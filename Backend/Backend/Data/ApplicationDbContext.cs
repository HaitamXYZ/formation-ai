using Backend.Entities;
using Backend.Configurations;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<Category> Categories => Set<Category>();

    public DbSet<Training> Trainings => Set<Training>();

    public DbSet<TrainingModule> TrainingModules => Set<TrainingModule>();

    public DbSet<TrainingModuleResource> TrainingModuleResources => Set<TrainingModuleResource>();

    public DbSet<ModuleContentChunk> ModuleContentChunks => Set<ModuleContentChunk>();

    public DbSet<AIConversation> AIConversations => Set<AIConversation>();

    public DbSet<AIMessage> AIMessages => Set<AIMessage>();

    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.ApplyConfiguration(new CategoryConfiguration());
        builder.ApplyConfiguration(new TrainingConfiguration());
        builder.ApplyConfiguration(new TrainingModuleConfiguration());
        builder.ApplyConfiguration(new TrainingModuleResourceConfiguration());
        builder.ApplyConfiguration(new ModuleContentChunkConfiguration());
        builder.ApplyConfiguration(new AIConversationConfiguration());
        builder.ApplyConfiguration(new AIMessageConfiguration());
        builder.ApplyConfiguration(new EnrollmentConfiguration());

        builder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(user => user.FirstName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(user => user.LastName)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(user => user.IsActive)
                .HasDefaultValue(true);

            entity.Property(user => user.CreatedAt)
                .HasDefaultValueSql("SYSUTCDATETIME()");
        });
    }
}
