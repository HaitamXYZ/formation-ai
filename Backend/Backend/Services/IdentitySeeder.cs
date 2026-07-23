using Backend.Entities;
using Backend.Enums;
using Backend.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace Backend.Services;

public sealed class IdentitySeeder : IIdentitySeeder
{
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ILogger<IdentitySeeder> _logger;

    public IdentitySeeder(
        RoleManager<IdentityRole> roleManager,
        UserManager<ApplicationUser> userManager,
        ILogger<IdentitySeeder> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        foreach (var roleName in ApplicationRoles.All)
        {
            if (await _roleManager.RoleExistsAsync(roleName))
            {
                continue;
            }

            var result = await _roleManager.CreateAsync(new IdentityRole(roleName));
            if (result.Succeeded)
            {
                _logger.LogInformation("Identity role {RoleName} created.", roleName);
                continue;
            }

            var errors = string.Join("; ", result.Errors.Select(error => error.Description));
            throw new InvalidOperationException($"Unable to create identity role '{roleName}': {errors}");
        }

        await EnsureAdminUserAsync();
    }

    private async Task EnsureAdminUserAsync()
    {
        const string adminEmail = "admin@example.com";
        const string adminPassword = "Admin123";

        var admin = await _userManager.FindByEmailAsync(adminEmail);
        if (admin is null)
        {
            admin = new ApplicationUser
            {
                FirstName = "Admin",
                LastName = "Formation AI",
                Email = adminEmail,
                UserName = adminEmail,
                EmailConfirmed = true,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await _userManager.CreateAsync(admin, adminPassword);
            if (!createResult.Succeeded)
            {
                var errors = string.Join("; ", createResult.Errors.Select(error => error.Description));
                throw new InvalidOperationException($"Unable to create admin user '{adminEmail}': {errors}");
            }

            _logger.LogInformation("Default admin user {AdminEmail} created.", adminEmail);
        }

        if (!admin.IsActive)
        {
            admin.IsActive = true;
            var updateResult = await _userManager.UpdateAsync(admin);
            if (!updateResult.Succeeded)
            {
                var errors = string.Join("; ", updateResult.Errors.Select(error => error.Description));
                throw new InvalidOperationException($"Unable to activate admin user '{adminEmail}': {errors}");
            }
        }

        if (!await _userManager.IsInRoleAsync(admin, ApplicationRoles.Admin))
        {
            var roleResult = await _userManager.AddToRoleAsync(admin, ApplicationRoles.Admin);
            if (!roleResult.Succeeded)
            {
                var errors = string.Join("; ", roleResult.Errors.Select(error => error.Description));
                throw new InvalidOperationException($"Unable to assign admin role to '{adminEmail}': {errors}");
            }

            _logger.LogInformation("Admin role assigned to {AdminEmail}.", adminEmail);
        }
    }
}
