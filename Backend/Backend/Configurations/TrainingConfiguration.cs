using Backend.Entities;
using Backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class TrainingConfiguration : IEntityTypeConfiguration<Training>
{
    public void Configure(EntityTypeBuilder<Training> builder)
    {
        builder.Property(training => training.Title)
            .HasMaxLength(150)
            .IsRequired();

        builder.Property(training => training.Slug)
            .HasMaxLength(180)
            .IsRequired();

        builder.HasIndex(training => training.Slug)
            .IsUnique();

        builder.Property(training => training.ShortDescription)
            .HasMaxLength(300);

        builder.Property(training => training.Description)
            .HasMaxLength(5000);

        builder.Property(training => training.ImageUrl)
            .HasMaxLength(500);

        builder.Property(training => training.Level)
            .HasConversion<string>()
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(training => training.Price)
            .HasPrecision(18, 2);

        builder.Property(training => training.Currency)
            .HasMaxLength(3)
            .IsRequired();

        builder.Property(training => training.Status)
            .HasConversion<string>()
            .HasMaxLength(50)
            .HasDefaultValue(TrainingStatus.Draft)
            .IsRequired();

        builder.Property(training => training.IsFeatured)
            .HasDefaultValue(false);

        builder.Property(training => training.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(training => training.Category)
            .WithMany(category => category.Trainings)
            .HasForeignKey(training => training.CategoryId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
    }
}

