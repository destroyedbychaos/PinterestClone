using PinterestClone.DAL;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.DAL.ViewModels;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace PinterestClone.BLL.Services.JwtService
{
    public class JwtService : IJwtService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;

        public JwtService(AppDbContext context, IConfiguration configuration, IUserRepository userRepository)
        {
            _context = context;
            _configuration = configuration;
            _userRepository = userRepository;
        }

        private async Task<RefreshToken?> SaveRefreshTokenAsync(User user, string refreshToken, string jwtId)
        {
            var token = new RefreshToken
            {
                Id = Guid.NewGuid().ToString(),
                CreateDate = DateTime.UtcNow,
                ExpiredDate = DateTime.UtcNow.AddDays(7),
                IsUsed = false,
                JwtId = jwtId,
                Token = refreshToken,
                UserId = user.Id
            };

            await _context.RefreshTokens.AddAsync(token);
            var result = await _context.SaveChangesAsync();

            if(result == 0)
            {
                return null;
            }

            return token;
        }

        private JwtSecurityToken GenerateAccessToken(User user)
        {
            var issuer = _configuration["AuthSettings:issuer"];
            var audience = _configuration["AuthSettings:audience"];
            var keyString = _configuration["AuthSettings:key"];
            var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("id", user.Id),
                new Claim("email", user.Email),
            };

            

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(1),
                signingCredentials: new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }

        private string GenerateRefreshToken()
        {
            var bytes = new byte[32];

            using (var rnd = RandomNumberGenerator.Create())
            {
                rnd.GetBytes(bytes);
                return Convert.ToBase64String(bytes);
            }
        }

        public async Task<ServiceResponse> GenerateTokensAsync(User user)
        {
            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            var saveResult = await SaveRefreshTokenAsync(user, refreshToken, accessToken.Id);

            if(saveResult == null)
            {
                return ServiceResponse.BadRequestResponse("Не вдалося зберегти refresh токен");
            }

            var tokens = new JwtVM
            {
                AccessToken = new JwtSecurityTokenHandler().WriteToken(accessToken),
                RefreshToken = refreshToken
            };

            return ServiceResponse.OkResponse("Токени", tokens);
        }

        public async Task<ServiceResponse> RefreshTokensAsync(JwtVM model)
        {
            var storedToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(t => t.Token == model.RefreshToken);

            if(storedToken == null)
            {
                throw new SecurityTokenException("Invalid token");
            }

            if(storedToken.IsUsed)
            {
                throw new SecurityTokenException("Invalid token");
            }

            if (storedToken.ExpiredDate < DateTime.UtcNow)
            {
                throw new SecurityTokenException("Token expired");
            }

            var principals = GetPrincipals(model.AccessToken);

            var accessTokenId = principals.Claims
                .Single(c => c.Type == JwtRegisteredClaimNames.Jti).Value;

            if(storedToken.JwtId != accessTokenId)
            {
                throw new SecurityTokenException("Invalid access token");
            }

            storedToken.IsUsed = true;
            _context.RefreshTokens.Update(storedToken);
            await _context.SaveChangesAsync();

            var user = await _userRepository.GetByIdAsync(storedToken.UserId);

            if(user == null)
            {
                throw new SecurityTokenException("Invalid user id");
            }

            var response = await GenerateTokensAsync(user);

            return response;
        }

        private ClaimsPrincipal GetPrincipals(string accessToken)
        {
            var jwtSecurityKey = _configuration["AuthSettings:key"];

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecurityKey))
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            var principals = tokenHandler.ValidateToken(accessToken, validationParameters, out SecurityToken securityToken);

            var jwtSecurityToken = securityToken as JwtSecurityToken;

            if(jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256))
            {
                throw new SecurityTokenException("Invalid access token");
            }

            return principals;
        }
    }
}
