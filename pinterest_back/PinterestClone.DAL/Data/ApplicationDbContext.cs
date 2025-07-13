using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;

namespace PinterestClone.DAL.Data
{
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Pin> Pins { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardPin> BoardPins { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<RefreshToken> RefreshTokens { get; set; }
        public DbSet<SmsVerification> SmsVerifications { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<PinShare> PinShares { get; set; }
        public DbSet<PinReport> PinReports { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Board>()
                .HasOne(b => b.User)
                .WithMany(u => u.Boards)
                .HasForeignKey(b => b.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<BoardPin>()
                .HasKey(bp => new { bp.BoardId, bp.PinId });

            builder.Entity<BoardPin>()
                .HasOne(bp => bp.Board)
                .WithMany(b => b.BoardPins)
                .HasForeignKey(bp => bp.BoardId);

            builder.Entity<BoardPin>()
                .HasOne(bp => bp.Pin)
                .WithMany(p => p.BoardPins)
                .HasForeignKey(bp => bp.PinId);

            builder.Entity<Comment>()
                .HasOne(c => c.Pin)
                .WithMany(p => p.Comments)
                .HasForeignKey(c => c.PinId);

            builder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany(u => u.Comments)
                .HasForeignKey(c => c.UserId);

            builder.Entity<Like>()
                .HasOne(l => l.Pin)
                .WithMany(p => p.Likes)
                .HasForeignKey(l => l.PinId);

            builder.Entity<Like>()
                .HasOne(l => l.User)
                .WithMany(u => u.Likes)
                .HasForeignKey(l => l.UserId);

            // SMS Verification configuration
            builder.Entity<SmsVerification>()
                .HasOne(sv => sv.User)
                .WithMany()
                .HasForeignKey(sv => sv.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<SmsVerification>()
                .HasIndex(sv => new { sv.PhoneNumber, sv.VerificationCode })
                .IsUnique(false);

            builder.Entity<SmsVerification>()
                .HasIndex(sv => sv.UserId);

            // Notification configuration
            builder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<Notification>()
                .HasOne(n => n.Pin)
                .WithMany()
                .HasForeignKey(n => n.PinId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Notification>()
                .HasOne(n => n.Board)
                .WithMany()
                .HasForeignKey(n => n.BoardId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Notification>()
                .HasOne(n => n.Comment)
                .WithMany()
                .HasForeignKey(n => n.CommentId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.Entity<Notification>()
                .HasIndex(n => new { n.UserId, n.Status });

            builder.Entity<Notification>()
                .HasIndex(n => n.CreatedAt);

            // PinShare configuration
            builder.Entity<PinShare>()
                .HasOne(ps => ps.Pin)
                .WithMany()
                .HasForeignKey(ps => ps.PinId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PinShare>()
                .HasOne(ps => ps.SharedByUser)
                .WithMany()
                .HasForeignKey(ps => ps.SharedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PinShare>()
                .HasOne(ps => ps.SharedWithUser)
                .WithMany()
                .HasForeignKey(ps => ps.SharedWithUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PinShare>()
                .HasIndex(ps => new { ps.SharedWithUserId, ps.IsRead });

            builder.Entity<PinShare>()
                .HasIndex(ps => ps.SharedAt);

            // PinReport configuration
            builder.Entity<PinReport>()
                .HasOne(pr => pr.Pin)
                .WithMany()
                .HasForeignKey(pr => pr.PinId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PinReport>()
                .HasOne(pr => pr.ReportedByUser)
                .WithMany()
                .HasForeignKey(pr => pr.ReportedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<PinReport>()
                .HasIndex(pr => new { pr.PinId, pr.ReportedByUserId });

            builder.Entity<PinReport>()
                .HasIndex(pr => pr.ReportedAt);
        }
    }
} 