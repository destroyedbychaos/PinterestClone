using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

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
