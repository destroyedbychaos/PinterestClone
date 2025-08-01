// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title NFTMarketplace
 * @dev Повноцінний NFT маркетплейс з мінтингом, торгівлею та управлінням
 */
contract NFTMarketplace is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    Counters.Counter private _itemsSold;

    // Структура для лістингу NFT
    struct MarketItem {
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool isListed;
        bool exists;
    }

    // Структура для роялті
    struct RoyaltyInfo {
        address receiver;
        uint256 royaltyFraction; // у базисних пунктах (100 = 1%)
    }

    // Маппінги
    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(uint256 => RoyaltyInfo) private _tokenRoyalties;
    mapping(address => uint256[]) private _userTokens;
    mapping(address => mapping(uint256 => uint256)) private _userTokenIndex;

    // Комісії
    uint256 private _listingPrice = 0.001 ether; // Комісія за лістинг
    uint256 private _marketplaceFee = 250; // 2.5% у базисних пунктах
    uint256 private constant MAX_ROYALTY = 1000; // 10% максимальне роялті

    // Події
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event MarketItemCreated(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed owner,
        uint256 price
    );
    event MarketItemSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event MarketItemDelisted(uint256 indexed tokenId, address indexed seller);
    event ListingPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event MarketplaceFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() ERC721("Aestify NFT", "ANFT") Ownable(msg.sender) {
        _tokenIdCounter.increment(); // Починаємо з tokenId = 1
    }

    /**
     * @dev Мінтинг нового NFT
     */
    function mintNFT(
        address to,
        string memory tokenURI,
        uint256 royaltyFraction
    ) public whenNotPaused returns (uint256) {
        require(royaltyFraction <= MAX_ROYALTY, "Royalty too high");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);

        // Встановлюємо роялті
        if (royaltyFraction > 0) {
            _setTokenRoyalty(tokenId, to, royaltyFraction);
        }

        // Додаємо токен до списку користувача
        _addTokenToUser(to, tokenId);

        emit NFTMinted(tokenId, to, tokenURI);
        return tokenId;
    }

    /**
     * @dev Виставлення NFT на продаж
     */
    function listNFTForSale(uint256 tokenId, uint256 price) 
        public 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        require(price > 0, "Price must be greater than 0");
        require(ownerOf(tokenId) == msg.sender, "Only owner can list NFT");
        require(msg.value >= _listingPrice, "Listing fee required");
        require(!idToMarketItem[tokenId].isListed, "NFT already listed");

        // Переводимо NFT на контракт
        _transfer(msg.sender, address(this), tokenId);

        // Створюємо лістинг
        idToMarketItem[tokenId] = MarketItem(
            tokenId,
            payable(msg.sender),
            payable(address(this)),
            price,
            true,
            true
        );

        emit MarketItemCreated(tokenId, msg.sender, address(this), price);
    }

    /**
     * @dev Купівля NFT
     */
    function buyNFT(uint256 tokenId) 
        public 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.exists, "Market item does not exist");
        require(item.isListed, "NFT not for sale");
        require(msg.value >= item.price, "Insufficient payment");

        address seller = item.seller;
        uint256 totalPrice = item.price;

        // Розрахунок роялті та комісій
        (address royaltyReceiver, uint256 royaltyAmount) = royaltyInfo(tokenId, totalPrice);
        uint256 marketplaceFeeAmount = (totalPrice * _marketplaceFee) / 10000;
        uint256 sellerAmount = totalPrice - royaltyAmount - marketplaceFeeAmount;

        // Оновлюємо стан перед трансферами
        item.isListed = false;
        item.owner = payable(msg.sender);
        _itemsSold.increment();

        // Переводимо NFT покупцю
        _transfer(address(this), msg.sender, tokenId);

        // Оновлюємо списки користувачів
        _removeTokenFromUser(seller, tokenId);
        _addTokenToUser(msg.sender, tokenId);

        // Виплати
        if (royaltyAmount > 0 && royaltyReceiver != address(0)) {
            payable(royaltyReceiver).transfer(royaltyAmount);
        }
        
        if (marketplaceFeeAmount > 0) {
            payable(owner()).transfer(marketplaceFeeAmount);
        }
        
        payable(seller).transfer(sellerAmount);

        // Повертаємо зайву суму
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }

        emit MarketItemSold(tokenId, seller, msg.sender, totalPrice);
    }

    /**
     * @dev Зняття NFT з продажу
     */
    function delistNFT(uint256 tokenId) public nonReentrant whenNotPaused {
        MarketItem storage item = idToMarketItem[tokenId];
        require(item.exists, "Market item does not exist");
        require(item.seller == msg.sender, "Only seller can delist");
        require(item.isListed, "NFT not listed");

        item.isListed = false;
        item.owner = payable(msg.sender);

        // Повертаємо NFT власнику
        _transfer(address(this), msg.sender, tokenId);

        emit MarketItemDelisted(tokenId, msg.sender);
    }

    /**
     * @dev Спалення NFT
     */
    function burnNFT(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Only owner can burn");
        
        // Якщо NFT в лістингу, знімаємо його
        if (idToMarketItem[tokenId].isListed) {
            delistNFT(tokenId);
        }

        _removeTokenFromUser(msg.sender, tokenId);
        _burn(tokenId);
        delete idToMarketItem[tokenId];
        delete _tokenRoyalties[tokenId];
    }

    /**
     * @dev Отримання інформації про лістинг
     */
    function getMarketItem(uint256 tokenId) public view returns (MarketItem memory) {
        return idToMarketItem[tokenId];
    }

    /**
     * @dev Отримання всіх активних лістингів
     */
    function getActiveListings() public view returns (MarketItem[] memory) {
        uint256 totalItems = _tokenIdCounter.current() - 1;
        uint256 activeCount = 0;

        // Підрахунок активних лістингів
        for (uint256 i = 1; i <= totalItems; i++) {
            if (idToMarketItem[i].isListed) {
                activeCount++;
            }
        }

        MarketItem[] memory activeItems = new MarketItem[](activeCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= totalItems; i++) {
            if (idToMarketItem[i].isListed) {
                activeItems[index] = idToMarketItem[i];
                index++;
            }
        }

        return activeItems;
    }

    /**
     * @dev Отримання NFT користувача
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        return _userTokens[user];
    }

    /**
     * @dev Отримання кількості NFT користувача
     */
    function getUserNFTCount(address user) public view returns (uint256) {
        return _userTokens[user].length;
    }

    /**
     * @dev Отримання інформації про роялті
     */
    function royaltyInfo(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address, uint256) 
    {
        RoyaltyInfo memory royalty = _tokenRoyalties[tokenId];
        uint256 royaltyAmount = (salePrice * royalty.royaltyFraction) / 10000;
        return (royalty.receiver, royaltyAmount);
    }

    /**
     * @dev Встановлення роялті
     */
    function _setTokenRoyalty(uint256 tokenId, address receiver, uint256 feeNumerator) 
        internal 
    {
        require(feeNumerator <= MAX_ROYALTY, "Royalty too high");
        _tokenRoyalties[tokenId] = RoyaltyInfo(receiver, feeNumerator);
    }

    /**
     * @dev Додавання токена до списку користувача
     */
    function _addTokenToUser(address user, uint256 tokenId) internal {
        _userTokenIndex[user][tokenId] = _userTokens[user].length;
        _userTokens[user].push(tokenId);
    }

    /**
     * @dev Видалення токена зі списку користувача
     */
    function _removeTokenFromUser(address user, uint256 tokenId) internal {
        uint256 index = _userTokenIndex[user][tokenId];
        uint256 lastIndex = _userTokens[user].length - 1;

        if (index != lastIndex) {
            uint256 lastTokenId = _userTokens[user][lastIndex];
            _userTokens[user][index] = lastTokenId;
            _userTokenIndex[user][lastTokenId] = index;
        }

        _userTokens[user].pop();
        delete _userTokenIndex[user][tokenId];
    }

    // Функції адміністрування
    function setListingPrice(uint256 price) public onlyOwner {
        uint256 oldPrice = _listingPrice;
        _listingPrice = price;
        emit ListingPriceUpdated(oldPrice, price);
    }

    function setMarketplaceFee(uint256 fee) public onlyOwner {
        require(fee <= 1000, "Fee too high"); // Максимум 10%
        uint256 oldFee = _marketplaceFee;
        _marketplaceFee = fee;
        emit MarketplaceFeeUpdated(oldFee, fee);
    }

    function getListingPrice() public view returns (uint256) {
        return _listingPrice;
    }

    function getMarketplaceFee() public view returns (uint256) {
        return _marketplaceFee;
    }

    function getTotalSupply() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }

    function getItemsSold() public view returns (uint256) {
        return _itemsSold.current();
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function withdrawFees() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Перевизначення функцій для підтримки роялті
    function _update(address to, uint256 tokenId, address auth) 
        internal 
        override 
        returns (address) 
    {
        address previousOwner = super._update(to, tokenId, auth);
        
        // Оновлюємо списки користувачів тільки для звичайних трансферів
        if (previousOwner != address(0) && to != address(0) && 
            previousOwner != address(this) && to != address(this)) {
            _removeTokenFromUser(previousOwner, tokenId);
            _addTokenToUser(to, tokenId);
        }
        
        return previousOwner;
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (string memory) 
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) 
        public 
        view 
        override(ERC721, ERC721URIStorage) 
        returns (bool) 
    {
        return super.supportsInterface(interfaceId);
    }
}