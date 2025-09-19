using System.Reflection.Emit;
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
        public DbSet<ProfileReport> ProfileReports { get; set; }
        public DbSet<PasswordResetCode> PasswordResetCodes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<HiddenPin> HiddenPins { get; set; }
        public DbSet<SocialPermissions> SocialPermissions { get; set; }
        public DbSet<BlockedUser> BlockedUsers { get; set; }
        public DbSet<KeywordFilter> KeywordFilters { get; set; }
        public DbSet<NotificationSettings> NotificationSettings { get; set; }
        public DbSet<SecuritySettings> SecuritySettings { get; set; }
        public DbSet<UserSession> UserSessions { get; set; }
        public DbSet<UserFollow> UserFollows { get; set; }
        public DbSet<UserBlock> UserBlocks { get; set; }
        public DbSet<PinViewHistory> PinViewHistories { get; set; }
        

        public DbSet<NFT> NFTs { get; set; }
        public DbSet<MarketplaceListing> MarketplaceListings { get; set; }
        public DbSet<UserFavorite> UserFavorites { get; set; }
        public DbSet<Nonce> Nonces { get; set; }

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

            builder.Entity<ProfileReport>()
                .HasOne(pr => pr.Profile)
                .WithMany()
                .HasForeignKey(pr => pr.ProfileId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<ProfileReport>()
                .HasOne(pr => pr.ReportedByUser)
                .WithMany()
                .HasForeignKey(pr => pr.ReportedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<ProfileReport>()
                .HasIndex(pr => new { pr.ProfileId, pr.ReportedByUserId });

            builder.Entity<ProfileReport>()
                .HasIndex(pr => pr.ReportedAt);

            builder.Entity<PasswordResetCode>()
                .HasIndex(prc => new { prc.Email, prc.Code });

            builder.Entity<PasswordResetCode>()
                .HasIndex(prc => prc.ExpiresAt);

            builder.Entity<PasswordResetCode>()
                .HasIndex(prc => prc.CreatedAt);

            builder.Entity<HiddenPin>()
                .HasOne(hp => hp.Pin)
                .WithMany()
                .HasForeignKey(hp => hp.PinId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<HiddenPin>()
                .HasOne(hp => hp.User)
                .WithMany()
                .HasForeignKey(hp => hp.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<HiddenPin>()
                .HasIndex(hp => new { hp.PinId, hp.UserId })
                .IsUnique();

            builder.Entity<UserFollow>()
                .HasKey(uf => new { uf.FollowerId, uf.FollowingId });

            builder.Entity<UserFollow>()
                .HasOne(uf => uf.Follower)
                .WithMany(u => u.FollowingRelations)
                .HasForeignKey(uf => uf.FollowerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserFollow>()
                .HasOne(uf => uf.Following)
                .WithMany(u => u.FollowerRelations)
                .HasForeignKey(uf => uf.FollowingId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserBlock>()
                .HasOne(ub => ub.Blocker)
                .WithMany()
                .HasForeignKey(ub => ub.BlockerId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserBlock>()
                .HasOne(ub => ub.BlockedUser)
                .WithMany()
                .HasForeignKey(ub => ub.BlockedUserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<UserBlock>()
                .HasIndex(ub => new { ub.BlockerId, ub.BlockedUserId })
                .IsUnique();

            builder.Entity<PinViewHistory>()
                .HasOne(pvh => pvh.Pin)
                .WithMany()
                .HasForeignKey(pvh => pvh.PinId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PinViewHistory>()
                .HasOne(pvh => pvh.User)
                .WithMany()
                .HasForeignKey(pvh => pvh.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Entity<PinViewHistory>()
                .HasIndex(pvh => new { pvh.UserId, pvh.ViewedAt });

            builder.Entity<PinViewHistory>()
                .HasIndex(pvh => pvh.PinId);

            builder.Entity<PinViewHistory>()
                .HasIndex(pvh => pvh.ViewedAt);

            builder.Entity<SocialPermissions>(entity =>
            {
                entity.HasKey(sp => sp.Id);
                entity.HasOne(sp => sp.User)
                    .WithMany()
                    .HasForeignKey(sp => sp.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(sp => sp.UserId)
                    .IsUnique();
            });

            builder.Entity<BlockedUser>(entity =>
            {
                entity.HasKey(bu => bu.Id);
                
                entity.HasOne(bu => bu.Blocker)
                    .WithMany()
                    .HasForeignKey(bu => bu.BlockerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(bu => bu.Blocked)
                    .WithMany()
                    .HasForeignKey(bu => bu.BlockedId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(bu => new { bu.BlockerId, bu.BlockedId })
                    .IsUnique();
            });

            builder.Entity<KeywordFilter>(entity =>
            {
                entity.HasKey(kf => kf.Id);
                entity.HasOne(kf => kf.User)
                    .WithMany()
                    .HasForeignKey(kf => kf.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(kf => kf.UserId);
            });

            builder.Entity<NotificationSettings>(entity =>
            {
                entity.HasKey(ns => ns.Id);
                entity.HasOne(ns => ns.User)
                    .WithMany()
                    .HasForeignKey(ns => ns.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(ns => ns.UserId)
                    .IsUnique();
            });

            builder.Entity<SecuritySettings>(entity =>
            {
                entity.HasKey(ss => ss.Id);
                entity.HasOne(ss => ss.User)
                    .WithMany()
                    .HasForeignKey(ss => ss.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(ss => ss.UserId)
                    .IsUnique();
            });

            builder.Entity<UserSession>(entity =>
            {
                entity.HasKey(us => us.Id);
                entity.HasOne(us => us.User)
                    .WithMany()
                    .HasForeignKey(us => us.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(us => us.UserId);
                entity.HasIndex(us => us.SessionId)
                    .IsUnique();
                entity.HasIndex(us => us.IsActive);
            });

            builder.Entity<NFT>(entity =>
            {
                entity.HasKey(nft => nft.Id);
                entity.HasIndex(nft => nft.CreatorWalletAddress);
                entity.HasIndex(nft => nft.TokenId);
                entity.HasIndex(nft => nft.CreatedAt);
            });

            builder.Entity<MarketplaceListing>(entity =>
            {
                entity.HasKey(ml => ml.Id);
                entity.HasOne<NFT>()
                    .WithMany()
                    .HasForeignKey(ml => ml.NFTId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(ml => ml.SellerWalletAddress);
                entity.HasIndex(ml => ml.ListedAt);
                entity.HasIndex(ml => ml.IsActive);
            });

            builder.Entity<UserFavorite>(entity =>
            {
                entity.HasKey(uf => uf.Id);
                entity.HasOne(uf => uf.NFT)
                    .WithMany()
                    .HasForeignKey(uf => uf.NFTId)
                    .OnDelete(DeleteBehavior.Cascade);
                entity.HasIndex(uf => uf.UserWalletAddress);
                entity.HasIndex(uf => new { uf.UserWalletAddress, uf.NFTId })
                    .IsUnique();
            });

            builder.Entity<Nonce>(entity =>
            {
                entity.HasKey(n => n.WalletAddress);
                entity.HasIndex(n => n.CreatedAt);
                entity.HasIndex(n => n.ExpiresAt);
            });
        }
    }
} 