using Backend.Extensions;

var builder = WebApplication.CreateBuilder(args);

var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

builder.Services.AddApplicationServices(builder.Configuration, builder.Environment);

var app = builder.Build();

app.UseGlobalExceptionHandling();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors(ServiceCollectionExtensions.FrontendCorsPolicy);

app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();

app.MapControllers();

await app.SeedIdentityAsync();

app.Run();

