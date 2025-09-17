using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Repositories.NFTRepository;
using PinterestClone.DAL.Repositories.UserFavoritesRepository;
using PinterestClone.DAL.Models;

namespace PinterestClone.BLL.Services.NFTService
{
    public class NFTService : INFTService
    {
        private readonly INFTRepository _nftRepository;
        private readonly IUserFavoritesRepository _userFavoritesRepository;

        public NFTService(INFTRepository nftRepository, IUserFavoritesRepository userFavoritesRepository)
        {
            _nftRepository = nftRepository;
            _userFavoritesRepository = userFavoritesRepository;
        }

                public async Task<ServiceResponse<UserNFTsResponseDto>> GetUserNFTsAsync(string walletAddress, int page, int pageSize)
        {
            try
            {
                var nfts = await _nftRepository.GetUserNFTsAsync(walletAddress, page, pageSize);
                var totalCount = await _nftRepository.GetUserNFTsCountAsync(walletAddress);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var nftList = new NFTListDto
                {
                    NFTs = nfts.Select(MapToNFTDto).ToList(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };

                var response = new UserNFTsResponseDto
                {
                    WalletAddress = walletAddress,
                    NFTs = nftList
                };

                return ServiceResponse<UserNFTsResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<UserNFTsResponseDto>.ErrorResponse($"Error getting user NFTs: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<UserFavoritesResponseDto>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize)
        {
            try
            {
                var favorites = await _userFavoritesRepository.GetUserFavoritesAsync(walletAddress, page, pageSize);
                var totalCount = await _userFavoritesRepository.GetUserFavoritesCountAsync(walletAddress);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var favoritesList = new NFTListDto
                {
                    NFTs = favorites.Select(MapToNFTDto).ToList(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };

                var response = new UserFavoritesResponseDto
                {
                    WalletAddress = walletAddress,
                    Favorites = favoritesList
                };

                return ServiceResponse<UserFavoritesResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<UserFavoritesResponseDto>.ErrorResponse($"Error getting user favorites: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> AddToFavoritesAsync(string walletAddress, string nftId)
        {
            try
            {

                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<bool>.NotFoundResponse("NFT not found");
                }

                var isAlreadyFavorite = await _userFavoritesRepository.IsFavoriteAsync(walletAddress, nftId);
                if (isAlreadyFavorite)
                {
                    return ServiceResponse<bool>.BadRequestResponse("NFT is already in favorites");
                }

                await _userFavoritesRepository.AddToFavoritesAsync(walletAddress, nftId);
                return ServiceResponse<bool>.SuccessResponse(true);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error adding to favorites: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> RemoveFromFavoritesAsync(string walletAddress, string nftId)
        {
            try
            {
                var isFavorite = await _userFavoritesRepository.IsFavoriteAsync(walletAddress, nftId);
                if (!isFavorite)
                {
                    return ServiceResponse<bool>.BadRequestResponse("NFT is not in favorites");
                }

                await _userFavoritesRepository.RemoveFromFavoritesAsync(walletAddress, nftId);
                return ServiceResponse<bool>.SuccessResponse(true);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error removing from favorites: {ex.Message}");
            }
        }

        private NFTDto MapToNFTDto(NFT nft)
        {
            return new NFTDto
            {
                Id = nft.Id ?? string.Empty,
                Name = nft.Name ?? string.Empty,
                Description = nft.Description ?? string.Empty,
                ImageUrl = nft.ImageUrl ?? string.Empty,
                TokenId = nft.TokenId ?? string.Empty,
                ContractAddress = nft.ContractAddress ?? string.Empty,
                ChainId = nft.ChainId ?? string.Empty,
                OwnerWalletAddress = nft.OwnerWalletAddress ?? string.Empty,
                Price = nft.Price,
                Currency = nft.Currency ?? "ETH",
                IsForSale = nft.IsForSale,
                CreatedAt = nft.CreatedAt,
                UpdatedAt = nft.UpdatedAt
            };
        }
    }
} 