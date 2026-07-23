using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.Property(category => category.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(category => category.NormalizedName)
            .HasMaxLength(100)
            .IsRequired();

        builder.HasIndex(category => category.NormalizedName)
            .IsUnique();

        builder.Property(category => category.Description)
            .HasMaxLength(500);

        builder.Property(category => category.ImageUrl)
            .HasMaxLength(500);

        builder.Property(category => category.IsActive)
            .HasDefaultValue(true);

        builder.Property(category => category.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");
    }
}
