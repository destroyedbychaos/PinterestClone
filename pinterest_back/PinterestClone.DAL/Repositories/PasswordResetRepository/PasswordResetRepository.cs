using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models;

namespace PinterestClone.DAL.Repositories.PasswordResetRepository
{
    public class PasswordResetRepository : IPasswordResetRepository
    {
        private readonly AppDbContext _context;

        public PasswordResetRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<PasswordResetCode> CreateResetCodeAsync(string email, string code, DateTime expiresAt)
        {
            var existingCodes = await _context.PasswordResetCodes
                .Where(c => c.Email == email)
                .ToListAsync();
            
            _context.PasswordResetCodes.RemoveRange(existingCodes);

            var resetCode = new PasswordResetCode
            {
                Email = email,
                Code = code,
                ExpiresAt = expiresAt,
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.PasswordResetCodes.Add(resetCode);
            await _context.SaveChangesAsync();

            return resetCode;
        }

        public async Task<PasswordResetCode?> GetValidResetCodeAsync(string email, string code)
        {
            return await _context.PasswordResetCodes
                .FirstOrDefaultAsync(c => 
                    c.Email == email && 
                    c.Code == code && 
                    !c.IsUsed && 
                    c.ExpiresAt > DateTime.UtcNow);
        }

        public async Task MarkCodeAsUsedAsync(int codeId)
        {
            var code = await _context.PasswordResetCodes.FindAsync(codeId);
            if (code != null)
            {
                code.IsUsed = true;
                await _context.SaveChangesAsync();
            }
        }

        public async Task DeleteExpiredCodesAsync()
        {
            var expiredCodes = await _context.PasswordResetCodes
                .Where(c => c.ExpiresAt <= DateTime.UtcNow || c.IsUsed)
                .ToListAsync();

            _context.PasswordResetCodes.RemoveRange(expiredCodes);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> HasActiveResetCodeAsync(string email)
        {
            return await _context.PasswordResetCodes
                .AnyAsync(c => 
                    c.Email == email && 
                    !c.IsUsed && 
                    c.ExpiresAt > DateTime.UtcNow);
        }

        public async Task UpdateResetCodeAsync(PasswordResetCode resetCode)
        {
            _context.PasswordResetCodes.Update(resetCode);
            await _context.SaveChangesAsync();
        }
    }
} 