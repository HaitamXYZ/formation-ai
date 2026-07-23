using Backend.Entities;
using Backend.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Configurations;

public sealed class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
    public void Configure(EntityTypeBuilder<Enrollment> builder)
    {
        builder.HasKey(enrollment => enrollment.Id);
        builder.Property(enrollment => enrollment.UserId).HasMaxLength(450).IsRequired();
        builder.Property(enrollment => enrollment.Status)
            .HasConversion<string>()
            .HasMaxLength(30)
            .HasDefaultValue(EnrollmentStatus.Active)
            .IsRequired();
        builder.Property(enrollment => enrollment.EnrolledAt).HasDefaultValueSql("SYSUTCDATETIME()");

        builder.HasOne(enrollment => enrollment.User)
            .WithMany(user => user.Enrollments)
            .HasForeignKey(enrollment => enrollment.UserId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();
        builder.HasOne(enrollment => enrollment.Training)
            .WithMany(training => training.Enrollments)
            .HasForeignKey(enrollment => enrollment.TrainingId)
            .OnDelete(DeleteBehavior.Restrict)
            .IsRequired();

        builder.HasIndex(enrollment => enrollment.UserId);
        builder.HasIndex(enrollment => enrollment.TrainingId);
        builder.HasIndex(enrollment => new { enrollment.UserId, enrollment.TrainingId }).IsUnique();
    }
}
