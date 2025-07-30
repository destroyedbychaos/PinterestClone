using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Repositories.NFTRepository;
using PinterestClone.DAL.Repositories.UserFavoritesRepository;
using PinterestClone.DAL.Models;
using PinterestClone.BLL.Services.BlockchainService;

namespace PinterestClone.BLL.Services.NFTService
{
    public class NFTService : INFTService
    {
        private readonly INFTRepository _nftRepository;
        private readonly IUserFavoritesRepository _userFavoritesRepository;
        private readonly IBlockchainService _blockchainService;

        public NFTService(INFTRepository nftRepository, IUserFavoritesRepository userFavoritesRepository, IBlockchainService blockchainService)
        {
            _nftRepository = nftRepository;
            _userFavoritesRepository = userFavoritesRepository;
            _blockchainService = blockchainService;
        }

        public async Task<ServiceResponse<NFTDto>> CreateNFTAsync(CreateNFTDto createNFTDto, string walletAddress, string imageUrl)
        {
            try
            {
                var nft = new NFT
                {
                    Name = createNFTDto.Name,
                    Description = createNFTDto.Description,
                    ImageUrl = imageUrl,
                    OwnerWalletAddress = walletAddress,
                    Price = createNFTDto.Price,
                    Currency = createNFTDto.Currency,
                    IsForSale = createNFTDto.IsForSale,
                    ChainId = "137" 
                };

                var createdNft = await _nftRepository.CreateAsync(nft);
                return ServiceResponse<NFTDto>.SuccessResponse(MapToNFTDto(createdNft));
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTDto>.ErrorResponse($"Error creating NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<NFTListDto>> GetAllNFTsAsync(int page = 1, int pageSize = 20)
        {
            try
            {
                var nfts = await _nftRepository.GetAllAsync(page, pageSize);
                var totalCount = await _nftRepository.GetAllCountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var nftList = new NFTListDto
                {
                    NFTs = nfts.Select(MapToNFTDto).ToList(),
                    TotalCount = totalCount,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = totalPages
                };

                return ServiceResponse<NFTListDto>.SuccessResponse(nftList);
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTListDto>.ErrorResponse($"Error getting all NFTs: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<NFTDto>> GetNFTByIdAsync(string nftId)
        {
            try
            {
                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<NFTDto>.NotFoundResponse("NFT not found");
                }

                return ServiceResponse<NFTDto>.SuccessResponse(MapToNFTDto(nft));
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTDto>.ErrorResponse($"Error getting NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<NFTDto>> UpdateNFTAsync(string nftId, UpdateNFTDto updateNFTDto, string walletAddress, string? imageUrl = null)
        {
            try
            {
                var existingNft = await _nftRepository.GetByIdAsync(nftId);
                if (existingNft == null)
                {
                    return ServiceResponse<NFTDto>.NotFoundResponse("NFT not found");
                }

                if (existingNft.OwnerWalletAddress.ToLower() != walletAddress.ToLower())
                {
                    return ServiceResponse<NFTDto>.UnauthorizedResponse("You can only update your own NFTs");
                }

                if (!string.IsNullOrEmpty(existingNft.TokenId))
                {

                    var nft = new NFT
                    {
                        Id = nftId,
                        Name = existingNft.Name, 
                        Description = existingNft.Description, 
                        ImageUrl = existingNft.ImageUrl,
                        Price = updateNFTDto.Price,
                        Currency = updateNFTDto.Currency,
                        IsForSale = updateNFTDto.IsForSale
                    };

                    var updatedNft = await _nftRepository.UpdateAsync(nft);
                    if (updatedNft == null)
                    {
                        return ServiceResponse<NFTDto>.ErrorResponse("Failed to update NFT");
                    }

                    return ServiceResponse<NFTDto>.SuccessResponse(MapToNFTDto(updatedNft));
                }
                else
                {
  
                    var nft = new NFT
                    {
                        Id = nftId,
                        Name = updateNFTDto.Name,
                        Description = updateNFTDto.Description,
                        ImageUrl = existingNft.ImageUrl, 
                        Price = updateNFTDto.Price,
                        Currency = updateNFTDto.Currency,
                        IsForSale = updateNFTDto.IsForSale
                    };

                    var updatedNft = await _nftRepository.UpdateAsync(nft);
                    if (updatedNft == null)
                    {
                        return ServiceResponse<NFTDto>.ErrorResponse("Failed to update NFT");
                    }

                    return ServiceResponse<NFTDto>.SuccessResponse(MapToNFTDto(updatedNft));
                }
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTDto>.ErrorResponse($"Error updating NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> DeleteNFTAsync(string nftId, string walletAddress, bool burnOnChain = false)
        {
            try
            {
                var existingNft = await _nftRepository.GetByIdAsync(nftId);
                if (existingNft == null)
                {
                    return ServiceResponse<bool>.NotFoundResponse("NFT not found");
                }

                if (existingNft.OwnerWalletAddress.ToLower() != walletAddress.ToLower())
                {
                    return ServiceResponse<bool>.UnauthorizedResponse("You can only delete your own NFTs");
                }

                if (burnOnChain && !string.IsNullOrEmpty(existingNft.TokenId))
                {
                    var burnResult = await _blockchainService.BurnNFTAsync(existingNft.Id, walletAddress);
                    if (!burnResult.IsSuccess)
                    {
                        return ServiceResponse<bool>.ErrorResponse($"Failed to burn NFT on blockchain: {burnResult.Message}");
                    }
                }

                var result = await _nftRepository.DeleteAsync(nftId);
                return ServiceResponse<bool>.SuccessResponse(result);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error deleting NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<NFTMintResponseDto>> MintNFTAsync(string nftId, string walletAddress)
        {
            try
            {
                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<NFTMintResponseDto>.NotFoundResponse("NFT not found");
                }

                if (nft.OwnerWalletAddress.ToLower() != walletAddress.ToLower())
                {
                    return ServiceResponse<NFTMintResponseDto>.UnauthorizedResponse("You can only mint your own NFTs");
                }

                var metadata = new
                {
                    name = nft.Name,
                    description = nft.Description,
                    image = nft.ImageUrl,
                    attributes = new[]
                    {
                        new { trait_type = "Price", value = nft.Price.ToString() },
                        new { trait_type = "Currency", value = nft.Currency },
                        new { trait_type = "IsForSale", value = nft.IsForSale.ToString() }
                    }
                };


                var mintResult = await _blockchainService.MintNFTAsync(nftId, walletAddress);
                
                if (mintResult.IsSuccess)
                {
                    await _nftRepository.UpdateTokenInfoAsync(nftId, mintResult.Data.TokenId, mintResult.Data.ContractAddress, mintResult.Data.TransactionHash);
                    
                    var updatedNft = await _nftRepository.GetByIdAsync(nftId);
                    if (updatedNft != null)
                    {
                        mintResult.Data.TokenId = updatedNft.TokenId ?? mintResult.Data.TokenId;
                        mintResult.Data.ContractAddress = updatedNft.ContractAddress ?? mintResult.Data.ContractAddress;
                    }
                }

                return mintResult;
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTMintResponseDto>.ErrorResponse($"Error minting NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<NFTBurnResponseDto>> BurnNFTAsync(string nftId, string walletAddress)
        {
            try
            {
                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<NFTBurnResponseDto>.NotFoundResponse("NFT not found");
                }

                if (nft.OwnerWalletAddress.ToLower() != walletAddress.ToLower())
                {
                    return ServiceResponse<NFTBurnResponseDto>.UnauthorizedResponse("You can only burn your own NFTs");
                }

                if (string.IsNullOrEmpty(nft.TokenId))
                {
                    return ServiceResponse<NFTBurnResponseDto>.BadRequestResponse("NFT is not minted on blockchain");
                }

                var burnResult = await _blockchainService.BurnNFTAsync(nft.Id, walletAddress);
                return burnResult;
            }
            catch (Exception ex)
            {
                return ServiceResponse<NFTBurnResponseDto>.ErrorResponse($"Error burning NFT: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<UserNFTsResponseDto>> GetUserNFTsAsync(string walletAddress, int page, int pageSize)
        {
            try
            {
                var nfts = await _nftRepository.GetUserNFTsAsync(walletAddress, page, pageSize);
                var totalCount = await _nftRepository.GetUserNFTsCountAsync(walletAddress);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var response = new UserNFTsResponseDto
                {
                    WalletAddress = walletAddress,
                    NFTs = new NFTListDto
                    {
                        NFTs = nfts.Select(MapToNFTDto).ToList(),
                        TotalCount = totalCount,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = totalPages
                    }
                };

                return ServiceResponse<UserNFTsResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<UserNFTsResponseDto>.ErrorResponse($"Error getting user NFTs: {ex.Message}");
            }
        }

        // Favorites operations
        public async Task<ServiceResponse<bool>> AddToFavoritesAsync(string nftId, string walletAddress)
        {
            try
            {
                var nft = await _nftRepository.GetByIdAsync(nftId);
                if (nft == null)
                {
                    return ServiceResponse<bool>.NotFoundResponse("NFT not found");
                }

                var success = await _nftRepository.AddToFavoritesAsync(walletAddress, nftId);
                return ServiceResponse<bool>.SuccessResponse(success);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error adding to favorites: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> RemoveFromFavoritesAsync(string nftId, string walletAddress)
        {
            try
            {
                var success = await _nftRepository.RemoveFromFavoritesAsync(walletAddress, nftId);
                return ServiceResponse<bool>.SuccessResponse(success);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error removing from favorites: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<UserFavoritesResponseDto>> GetUserFavoritesAsync(string walletAddress, int page, int pageSize)
        {
            try
            {
                var favorites = await _nftRepository.GetUserFavoritesAsync(walletAddress, page, pageSize);
                var totalCount = await _nftRepository.GetUserFavoritesCountAsync(walletAddress);
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var response = new UserFavoritesResponseDto
                {
                    WalletAddress = walletAddress,
                    Favorites = new NFTListDto
                    {
                        NFTs = favorites.Select(MapToNFTDto).ToList(),
                        TotalCount = totalCount,
                        Page = page,
                        PageSize = pageSize,
                        TotalPages = totalPages
                    }
                };

                return ServiceResponse<UserFavoritesResponseDto>.SuccessResponse(response);
            }
            catch (Exception ex)
            {
                return ServiceResponse<UserFavoritesResponseDto>.ErrorResponse($"Error getting user favorites: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<bool>> IsFavoriteAsync(string nftId, string walletAddress)
        {
            try
            {
                var isFavorite = await _nftRepository.IsFavoriteAsync(walletAddress, nftId);
                return ServiceResponse<bool>.SuccessResponse(isFavorite);
            }
            catch (Exception ex)
            {
                return ServiceResponse<bool>.ErrorResponse($"Error checking favorite status: {ex.Message}");
            }
        }

        private NFTDto MapToNFTDto(NFT nft)
        {
            return new NFTDto
            {
                Id = nft.Id,
                Name = nft.Name,
                Description = nft.Description,
                ImageUrl = nft.ImageUrl,
                TokenId = nft.TokenId ?? string.Empty,
                ContractAddress = nft.ContractAddress ?? string.Empty,
                ChainId = nft.ChainId ?? "137",
                OwnerWalletAddress = nft.OwnerWalletAddress ?? string.Empty,
                Price = nft.Price,
                Currency = nft.Currency ?? "MATIC",
                IsForSale = nft.IsForSale,
                CreatedAt = nft.CreatedAt,
                UpdatedAt = nft.UpdatedAt
            };
        }
    }
} 