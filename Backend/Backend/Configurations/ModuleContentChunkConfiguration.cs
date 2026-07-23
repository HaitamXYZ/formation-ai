using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class ModuleContentChunkConfiguration : IEntityTypeConfiguration<ModuleContentChunk>
{
    public void Configure(EntityTypeBuilder<ModuleContentChunk> builder)
    {
        builder.HasKey(chunk => chunk.Id);

        builder.Property(chunk => chunk.Content)
            .HasColumnType("nvarchar(max)")
            .IsRequired();

        builder.Property(chunk => chunk.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(chunk => chunk.TrainingModuleResource)
            .WithMany()
            .HasForeignKey(chunk => chunk.TrainingModuleResourceId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(chunk => chunk.TrainingModule)
            .WithMany()
            .HasForeignKey(chunk => chunk.TrainingModuleId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex(chunk => chunk.TrainingModuleId);
        builder.HasIndex(chunk => new { chunk.TrainingModuleResourceId, chunk.ChunkIndex }).IsUnique();
    }
}
