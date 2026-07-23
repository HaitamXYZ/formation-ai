using Backend.Entities;
using Backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class AIMessageConfiguration : IEntityTypeConfiguration<AIMessage>
{
    public void Configure(EntityTypeBuilder<AIMessage> builder)
    {
        builder.HasKey(message => message.Id);

        builder.Property(message => message.Role)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(message => message.Content)
            .HasMaxLength(12000)
            .IsRequired();

        builder.Property(message => message.CreatedAt)
            .HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(message => message.Conversation)
            .WithMany(conversation => conversation.Messages)
            .HasForeignKey(message => message.ConversationId)
            .OnDelete(DeleteBehavior.Cascade)
            .IsRequired();

        builder.HasIndex(message => new { message.ConversationId, message.CreatedAt });

        builder.ToTable(table => table.HasCheckConstraint(
            "CK_AIMessages_Role",
            $"[Role] IN ('{AIMessageRoles.User}', '{AIMessageRoles.Assistant}', '{AIMessageRoles.System}')"));
    }
}
