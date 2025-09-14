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
    /// <summary>
    /// Сервіс відповідальний за JWT токени.
    /// ------------------------------------
    /// Методи:
    ///     -- Зберегти рефреш токен
    ///     -- Створити токен доступу
    ///     -- Створити рефреш токен
    ///     -- Створити токен доступу та рефреш токен
    ///     -- Перевірити токен
    /// </summary>
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

        /// <summary>
        /// Зберігає новий рефреш токен для користувача у базі даних.
        /// </summary>
        /// <param name="user">Користувач, для якого створюється токен.</param>
        /// <param name="refreshToken">Рефреш токен.</param>
        /// <param name="jwtId">Ідентифікатор JWT токена.</param>
        /// <returns>Об’єкт <see cref="RefreshToken"/> якщо успішно збережено; <c>null</c> у разі невдачі.</returns>
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

        /// <summary>
        /// Генерує JWT токен доступу для користувача.
        /// </summary>
        /// <param name="user">Користувач, для якого створюється токен.</param>
        /// <returns>Об’єкт <see cref="JwtSecurityToken"/>.</returns>
        /// <exception cref="InvalidOperationException">Якщо ключ або email користувача відсутні.</exception>
        private JwtSecurityToken GenerateAccessToken(User user)
        {
            var issuer = _configuration["AuthSettings:issuer"];
            var audience = _configuration["AuthSettings:audience"];
            var keyString = _configuration["AuthSettings:key"];
            var symmetricKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString ?? throw new InvalidOperationException("JWT key not found")));

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email ?? throw new InvalidOperationException("User email is null")),
                new Claim("id", user.Id),
                new Claim("email", user.Email ?? throw new InvalidOperationException("User email is null")),
            };

            

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(30),
                signingCredentials: new SigningCredentials(symmetricKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }

        /// <summary>
        /// Генерує новий рефреш токен.
        /// </summary>
        /// <returns>Рядок, що містить рефреш токен у Base64 форматі.</returns>
        private string GenerateRefreshToken()
        {
            var bytes = new byte[32];

            using (var rnd = RandomNumberGenerator.Create())
            {
                rnd.GetBytes(bytes);
                return Convert.ToBase64String(bytes);
            }
        }

        /// <summary>
        /// Генерує пару токенів: доступу та рефреш для користувача.
        /// </summary>
        /// <param name="user">Користувач, для якого генеруються токени.</param>
        /// <returns>Об’єкт <see cref="ServiceResponse"/> з токенами або повідомленням про помилку.</returns>
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

        /// <summary>
        /// Оновлює токени за наявним рефреш токеном.
        /// </summary>
        /// <param name="model">Модель <see cref="JwtVM"/> з токенами користувача.</param>
        /// <returns>Об’єкт <see cref="ServiceResponse"/> з новими токенами або винятком у разі невдачі.</returns>
        /// <exception cref="SecurityTokenException">Якщо токен недійсний або протермінований.</exception>
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

        /// <summary>
        /// Перевіряє дійсність токена доступу та повертає ClaimsPrincipal.
        /// </summary>
        /// <param name="accessToken">JWT токен доступу у вигляді рядка.</param>
        /// <returns>Об’єкт <see cref="ClaimsPrincipal"/> з даними користувача.</returns>
        /// <exception cref="SecurityTokenException">Якщо токен недійсний або не відповідає очікуваному алгоритму підпису.</exception>
        private ClaimsPrincipal GetPrincipals(string accessToken)
        {
            var jwtSecurityKey = _configuration["AuthSettings:key"];
            var issuer = _configuration["AuthSettings:issuer"];
            var audience = _configuration["AuthSettings:audience"];

            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecurityKey ?? throw new InvalidOperationException("JWT key not found"))),
                ValidIssuer = issuer,
                ValidAudience = audience,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var tokenHandler = new JwtSecurityTokenHandler();

            try
            {
                var principals = tokenHandler.ValidateToken(accessToken, validationParameters, out SecurityToken securityToken);

                var jwtSecurityToken = securityToken as JwtSecurityToken;

                if(jwtSecurityToken == null || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256))
                {
                    throw new SecurityTokenException("Invalid access token");
                }

                return principals;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                throw new SecurityTokenException("Invalid access token");
            }
        }
    }
}
