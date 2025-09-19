using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Nethereum.Signer;
using Nethereum.Util;
using PinterestClone.BLL.DTOs;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.BLL.Services.JwtService;
using PinterestClone.DAL.ViewModels;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using Microsoft.EntityFrameworkCore;

namespace PinterestClone.BLL.Services.Web3AuthService
{
    public class Web3AuthService : IWeb3AuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;
        private readonly AppDbContext _context;

        public Web3AuthService(IUserRepository userRepository, IJwtService jwtService, AppDbContext context)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
            _context = context;
        }

        public async Task<ServiceResponse<NonceResponseDto>> GetNonceAsync(string walletAddress)
        {
            try
            {
                if (string.IsNullOrEmpty(walletAddress))
                {
                    return ServiceResponse<NonceResponseDto>.BadRequestResponse("Wallet address is required");
                }

                var nonce = GenerateRandomNonce();
                var message = $"Sign this message to authenticate with Aestify. Nonce: {nonce}";
                var expiresAt = DateTime.UtcNow.AddMinutes(5);

                var nonceResponse = new NonceResponseDto
                {
                    Nonce = nonce,
                    Message = message,
                    ExpiresAt = expiresAt
                };

                var nonceEntity = new Nonce
                {
                    WalletAddress = walletAddress,
                    NonceValue = nonce,
                    Message = message,
                    ExpiresAt = expiresAt
                };

                var existingNonces = await _context.Nonces
                    .Where(n => n.WalletAddress == walletAddress)
                    .ToListAsync();
                _context.Nonces.RemoveRange(existingNonces);

                await _context.Nonces.AddAsync(nonceEntity);
                await _context.SaveChangesAsync();

                return ServiceResponse<NonceResponseDto>.SuccessResponse(nonceResponse);
            }
            catch (Exception ex)
            {
                return ServiceResponse<NonceResponseDto>.ErrorResponse($"Error generating nonce: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<Web3AuthResponseDto>> VerifySignatureAsync(VerifySignatureRequestDto request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.WalletAddress) || 
                    string.IsNullOrEmpty(request.Signature) || 
                    string.IsNullOrEmpty(request.Nonce))
                {
                    return ServiceResponse<Web3AuthResponseDto>.BadRequestResponse("Wallet address, signature and nonce are required");
                }

                var storedNonce = await _context.Nonces
                    .FirstOrDefaultAsync(n => n.WalletAddress == request.WalletAddress);

                if (storedNonce == null)
                {
                    return ServiceResponse<Web3AuthResponseDto>.BadRequestResponse("Invalid or expired nonce");
                }

                if (DateTime.UtcNow > storedNonce.ExpiresAt)
                {
                    _context.Nonces.Remove(storedNonce);
                    await _context.SaveChangesAsync();
                    return ServiceResponse<Web3AuthResponseDto>.BadRequestResponse("Nonce has expired");
                }

                if (!VerifySignature(request.WalletAddress, request.Signature, storedNonce.Message))
                {
                    return ServiceResponse<Web3AuthResponseDto>.BadRequestResponse("Invalid signature");
                }

                var user = await GetOrCreateUserAsync(request.WalletAddress);

                var jwtResponse = await _jwtService.GenerateTokensAsync(user);

                if (!jwtResponse.Success)
                {
                    return ServiceResponse<Web3AuthResponseDto>.ErrorResponse("Failed to generate tokens");
                }


                _context.Nonces.Remove(storedNonce);
                await _context.SaveChangesAsync();

                var tokens = jwtResponse.Payload as JwtVM;
                var authResponse = new Web3AuthResponseDto
                {
                    AccessToken = tokens?.AccessToken ?? "",
                    RefreshToken = tokens?.RefreshToken ?? "",
                    User = MapToUserProfileDto(user)
                };

                return ServiceResponse<Web3AuthResponseDto>.SuccessResponse(authResponse);
            }
            catch (Exception ex)
            {
                return ServiceResponse<Web3AuthResponseDto>.ErrorResponse($"Error verifying signature: {ex.Message}");
            }
        }

        public async Task<ServiceResponse<Web3UserProfileDto>> GetUserByWalletAddressAsync(string walletAddress)
        {
            try
            {
                var user = await _userRepository.GetByWalletAddressAsync(walletAddress);
                if (user == null)
                {
                    return ServiceResponse<Web3UserProfileDto>.NotFoundResponse("User not found");
                }

                var userProfile = MapToWeb3UserProfileDto(user);
                return ServiceResponse<Web3UserProfileDto>.SuccessResponse(userProfile);
            }
            catch (Exception ex)
            {
                return ServiceResponse<Web3UserProfileDto>.ErrorResponse($"Error getting user: {ex.Message}");
            }
        }

        private string GenerateRandomNonce()
        {
            var random = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(random);
            }
            return Convert.ToHexString(random).ToLower();
        }

        private bool VerifySignature(string walletAddress, string signature, string message)
        {
            try
            {
                var signer = new EthereumMessageSigner();
                var recoveredAddress = signer.EncodeUTF8AndEcRecover(message, signature);

                var normalizedWalletAddress = walletAddress.ToLower();
                var normalizedRecoveredAddress = recoveredAddress.ToLower();

                return normalizedWalletAddress == normalizedRecoveredAddress;
            }
            catch
            {
                return false;
            }
        }

        private async Task<User> GetOrCreateUserAsync(string walletAddress)
        {
            var user = await _userRepository.GetByWalletAddressAsync(walletAddress);
            
            if (user == null)
            {

                user = new User
                {
                    UserName = walletAddress,
                    Email = $"{walletAddress}@web3.user", 
                    WalletAddress = walletAddress,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _userRepository.CreateAsync(user, Guid.NewGuid().ToString());
            }

            return user;
        }

        private UserProfileDto MapToUserProfileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                DisplayName = user.DisplayName,
                AvatarUrl = user.AvatarUrl,
                Bio = user.Bio,
                BirthDate = user.BirthDate,
                Gender = user.Gender,
                Country = user.Country,
                Language = user.Language,
                IsProfilePublic = user.IsProfilePublic
            };
        }

        private Web3UserProfileDto MapToWeb3UserProfileDto(User user)
        {
            return new Web3UserProfileDto
            {
                WalletAddress = user.WalletAddress ?? string.Empty,
                Nickname = user.DisplayName,
                Bio = user.Bio,
                AvatarUrl = user.AvatarUrl,
                BannerUrl = user.BannerUrl,
                Website = user.Website,
                Twitter = user.Twitter,
                Instagram = user.Instagram,
                Discord = user.Discord,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt
            };
        }
    }
} 