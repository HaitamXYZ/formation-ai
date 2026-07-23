using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class TrainingModuleResourceConfiguration : IEntityTypeConfiguration<TrainingModuleResource>
{
    public void Configure(EntityTypeBuilder<TrainingModuleResource> builder)
    {
        builder.HasKey(resource => resource.Id);
        builder.Property(resource => resource.Title).HasMaxLength(200).IsRequired();
        builder.Property(resource => resource.ResourceType).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(resource => resource.OriginalFileName).HasMaxLength(255);
        builder.Property(resource => resource.StoredFileName).HasMaxLength(100);
        builder.Property(resource => resource.StoragePath).HasMaxLength(500);
        builder.Property(resource => resource.MimeType).HasMaxLength(100);
        builder.Property(resource => resource.TextContent).HasColumnType("nvarchar(max)");
        builder.Property(resource => resource.ExtractedText).HasColumnType("nvarchar(max)");
        builder.Property(resource => resource.ProcessingStatus).HasConversion<string>().HasMaxLength(20).IsRequired();
        builder.Property(resource => resource.ProcessingError).HasMaxLength(1000);
        builder.Property(resource => resource.IsActive).HasDefaultValue(true);
        builder.Property(resource => resource.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(resource => resource.TrainingModule)
            .WithMany(module => module.Resources)
            .HasForeignKey(resource => resource.TrainingModuleId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex(resource => resource.TrainingModuleId);
        builder.HasIndex(resource => new { resource.TrainingModuleId, resource.IsActive, resource.ProcessingStatus });
    }
}
