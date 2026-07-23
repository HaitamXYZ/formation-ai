using Backend.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class AIConversationConfiguration : IEntityTypeConfiguration<AIConversation>
{
    public void Configure(EntityTypeBuilder<AIConversation> builder)
    {
        builder.HasKey(conversation => conversation.Id);

        builder.Property(conversation => conversation.UserId)
            .HasMaxLength(450)
            .IsRequired();

        builder.Property(conversation => conversation.Title)
            .HasMaxLength(200);

        builder.Property(conversation => conversation.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(conversation => conversation.User)
            .WithMany()
            .HasForeignKey(conversation => conversation.UserId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasOne(conversation => conversation.Training)
            .WithMany()
            .HasForeignKey(conversation => conversation.TrainingId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasOne(conversation => conversation.TrainingModule)
            .WithMany()
            .HasForeignKey(conversation => conversation.TrainingModuleId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex(conversation => conversation.UserId);
        builder.HasIndex(conversation => conversation.TrainingId);
        builder.HasIndex(conversation => conversation.TrainingModuleId);
    }
}
