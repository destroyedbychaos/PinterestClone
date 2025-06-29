using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PinterestClone.DAL.Models;
using PinterestClone.DAL.Models.Identity;


namespace PinterestClone.DAL.Data
{

    public class AppDbContext : IdentityDbContext<User, Role, string, UserClaim, UserRole, UserLogin, RoleClaim, UserToken>
    {
        public AppDbContext(DbContextOptions options)
            : base(options) { }


   


        public DbSet<Pin> Pins { get; set; }
        public DbSet<Board> Boards { get; set; }
        public DbSet<BoardPin> BoardPins { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<Like> Likes { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<User>(b =>
            {
                b.ToTable("Users");
            });

            builder.Entity<Role>(b =>
            {
                b.ToTable("Roles");
            });

            builder.Entity<UserClaim>(b =>
            {
                b.ToTable("UserClaims");
            });

            builder.Entity<UserLogin>(b =>
            {
                b.ToTable("UserLogins");
            });

            builder.Entity<UserToken>(b =>
            {
                b.ToTable("UserTokens");
            });

            builder.Entity<RoleClaim>(b =>
            {
                b.ToTable("RoleClaims");
            });

            builder.Entity<UserRole>(b =>
            {
                b.ToTable("UserRoles");
            });

            builder.Entity < User>(b =>
            {
                // Each User can have many UserClaims
                b.HasMany(e=>e.Claims)
                    .WithOne(e => e.User)
                    .HasForeignKey(uc=>uc.UserId)
                    .IsRequired();
                // Each User can have many UserLogins
                b.HasMany(e => e.Logins)
                    .WithOne(e=>e.User)
                    .HasForeignKey(ul => ul.UserId)
                    .IsRequired();
                // Each User can have many UserTokens
                b.HasMany(e => e.Tokens)
                    .WithOne(e => e.User)
                    .HasForeignKey(ut=>ut.UserId)
                    .IsRequired();
                // Each User can have many entries in the UserRole join table
                b.HasMany(e=>e.UserRoles)
                    .WithOne(e => e.User)
                    .HasForeignKey(ur => ur.UserId)
                    .IsRequired();
            });

            builder.Entity<Role>(b =>
            {
                b.HasMany(e => e.UserRoles)
                    .WithOne(e => e.Role)
                    .HasForeignKey(ur => ur.RoleId)
                    .IsRequired();
                // Each Role can have many associated RoleClaims
                b.HasMany(e => e.RoleClaims)
                    .WithOne(e => e.Role)
                    .HasForeignKey(rc => rc.RoleId)
                    .IsRequired();
            });

            

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
        }
    }


}
