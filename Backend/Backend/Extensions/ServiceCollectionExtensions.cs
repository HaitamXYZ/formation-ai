using System.Text;
using System.Text.Json.Serialization;
using System.Security.Claims;
using System.Threading.RateLimiting;
using Backend.Configurations;
using Backend.Data;
using Backend.Entities;
using Backend.Interfaces;
using Backend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

namespace Backend.Extensions;

public static class ServiceCollectionExtensions
{
    public const string FrontendCorsPolicy = "AllowFormationAIFrontend";

    public static IServiceCollection AddApplicationServices(
        this IServiceCollection services,
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<AIOptions>(configuration.GetSection(AIOptions.SectionName));
        services.Configure<AnamOptions>(configuration.GetSection(AnamOptions.SectionName));
        services.Configure<AIUsageOptions>(configuration.GetSection(AIUsageOptions.SectionName));
        services.Configure<ModuleResourceOptions>(configuration.GetSection(ModuleResourceOptions.SectionName));

        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        services
            .AddIdentity<ApplicationUser, IdentityRole>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        services
            .AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                var jwtOptions = configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>() ?? new JwtOptions();
                var signingKey = Encoding.UTF8.GetBytes(jwtOptions.Key);

                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(signingKey),
                    ClockSkew = TimeSpan.Zero
                };

                options.Events = new JwtBearerEvents
                {
                    OnTokenValidated = async context =>
                    {
                        var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier);
                        if (string.IsNullOrWhiteSpace(userId))
                        {
                            context.Fail("Authenticated user was not found.");
                            return;
                        }

                        var userManager = context.HttpContext.RequestServices.GetRequiredService<UserManager<ApplicationUser>>();
                        var user = await userManager.FindByIdAsync(userId);
                        if (user is null || !user.IsActive)
                        {
                            context.Fail("User account is inactive.");
                        }
                    }
                };
            });

        services.AddAuthorization(options =>
        {
            options.DefaultPolicy = new AuthorizationPolicyBuilder(JwtBearerDefaults.AuthenticationScheme)
                .RequireAuthenticatedUser()
                .Build();
        });

        services.AddCors(options =>
        {
            options.AddPolicy(FrontendCorsPolicy, policy =>
            {
                policy
                    .WithOrigins(configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? ["http://localhost:3000"])
                    .AllowAnyHeader()
                    .AllowAnyMethod();
            });
        });

        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IIdentitySeeder, IdentitySeeder>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<ITrainingService, TrainingService>();
        services.AddScoped<ITrainingModuleService, TrainingModuleService>();
        services.AddScoped<IUserManagementService, UserManagementService>();
        services.AddScoped<IAITrainerService, AITrainerService>();
        services.AddScoped<IEnrollmentService, EnrollmentService>();
        services.AddScoped<ITrainingAccessService, TrainingAccessService>();
        services.AddScoped<ITrainingModuleResourceService, TrainingModuleResourceService>();
        services.AddScoped<IModuleKnowledgeService, ModuleKnowledgeService>();
        services.AddSingleton<IFileStorageService, LocalFileStorageService>();
        services.AddSingleton<IDocumentTextExtractor, PdfDocumentTextExtractor>();
        services.AddSingleton<IDocumentTextExtractor, DocxDocumentTextExtractor>();
        services.AddSingleton<IDocumentTextExtractor, PlainTextDocumentExtractor>();
        services.AddScoped<IAIUsageService, AIUsageService>();
        services.AddHttpClient<IAITrainerProvider, GeminiAITrainerProvider>(client =>
        {
            client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });
        services.AddHttpClient<IAvatarSessionService, AnamAvatarSessionService>((serviceProvider, client) =>
        {
            var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<AnamOptions>>().Value;
            client.Timeout = TimeSpan.FromSeconds(Math.Clamp(options.RequestTimeoutSeconds, 5, 120));
        });

        services.AddAIRateLimiting(configuration);
        services.AddProblemDetails();
        services.AddConfiguredControllers();
        services.AddConfiguredSwagger();

        return services;
    }

    private static IServiceCollection AddAIRateLimiting(
        this IServiceCollection services, IConfiguration configuration)
    {
        var usage = configuration.GetSection(AIUsageOptions.SectionName).Get<AIUsageOptions>() ?? new AIUsageOptions();
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = HandleRateLimitRejectionAsync;
            options.AddPolicy("ai-usage", context => RateLimitPartition.GetFixedWindowLimiter(
                context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? context.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = Math.Max(1, usage.RequestsPerMinute),
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 0,
                    AutoReplenishment = true
                }));
        });
        return services;
    }

    private static async ValueTask HandleRateLimitRejectionAsync(
        OnRejectedContext context, CancellationToken cancellationToken)
    {
        context.HttpContext.Response.ContentType = "application/problem+json";
        if (context.Lease.TryGetMetadata(MetadataName.RetryAfter, out var retryAfter))
            context.HttpContext.Response.Headers.RetryAfter = Math.Ceiling(retryAfter.TotalSeconds).ToString();
        await context.HttpContext.Response.WriteAsJsonAsync(
            new ProblemDetails
            {
                Status = StatusCodes.Status429TooManyRequests,
                Title = "Trop de demandes",
                Detail = "Vous avez envoye trop de demandes. Reessayez dans quelques instants.",
                Instance = context.HttpContext.Request.Path
            }, cancellationToken);
    }

    private static IServiceCollection AddConfiguredControllers(this IServiceCollection services)
    {
        services
            .AddControllers()
            .AddJsonOptions(options =>
            {
                options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var problemDetails = new ValidationProblemDetails(context.ModelState)
                    {
                        Status = StatusCodes.Status400BadRequest,
                        Title = "Validation failed",
                        Instance = context.HttpContext.Request.Path
                    };

                    return new BadRequestObjectResult(problemDetails)
                    {
                        ContentTypes = { "application/problem+json" }
                    };
                };
            });

        return services;
    }

    private static IServiceCollection AddConfiguredSwagger(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "FormationAI API",
                Version = "v1"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.Http,
                Scheme = "bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter a valid JWT Bearer token."
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        }
                    },
                    Array.Empty<string>()
                }
            });
        });

        return services;
    }
}



