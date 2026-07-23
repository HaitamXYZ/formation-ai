using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class TrainingModuleConfiguration : IEntityTypeConfiguration<TrainingModule>
{
    public void Configure(EntityTypeBuilder<TrainingModule> builder)
    {
        builder.HasKey(module => module.Id);

        builder.Property(module => module.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(module => module.Description)
            .HasMaxLength(2000);

        builder.Property(module => module.Content)
            .HasMaxLength(20000);

        builder.Property(module => module.VideoUrl)
            .HasMaxLength(1000);

        builder.Property(module => module.DocumentUrl)
            .HasMaxLength(1000);

        builder.Property(module => module.OrderIndex)
            .IsRequired();

        builder.Property(module => module.IsPublished)
            .HasDefaultValue(false);

        builder.Property(module => module.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(module => module.Training)
            .WithMany(training => training.Modules)
            .HasForeignKey(module => module.TrainingId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex(module => module.TrainingId);

        builder.HasIndex(module => new { module.TrainingId, module.OrderIndex })
            .IsUnique();
    }
}
