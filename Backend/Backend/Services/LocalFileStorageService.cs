using Backend.Configurations;
using Backend.Interfaces;
using Microsoft.Extensions.Options;

namespace Backend.Services;

public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _root;

    public LocalFileStorageService(IOptions<ModuleResourceOptions> options, IWebHostEnvironment environment)
    {
        _root = Path.GetFullPath(Path.Combine(environment.ContentRootPath, options.Value.StorageRoot));
        Directory.CreateDirectory(_root);
    }

    public async Task<StoredFileResult> SaveAsync(Stream source, string extension, CancellationToken cancellationToken = default)
    {
        var safeExtension = extension.ToLowerInvariant();
        var storedName = $"{Guid.NewGuid():N}{safeExtension}";
        var folder = Path.Combine(DateTime.UtcNow.ToString("yyyy"), DateTime.UtcNow.ToString("MM"));
        var relativePath = Path.Combine(folder, storedName);
        var fullPath = Resolve(relativePath);
        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);
        await using var destination = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, FileOptions.Asynchronous);
        await source.CopyToAsync(destination, cancellationToken);
        return new StoredFileResult(storedName, relativePath.Replace('\\', '/'));
    }

    public Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        Stream stream = new FileStream(Resolve(storagePath), FileMode.Open, FileAccess.Read, FileShare.Read, 81920, FileOptions.Asynchronous | FileOptions.SequentialScan);
        return Task.FromResult(stream);
    }

    public Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default)
    {
        var fullPath = Resolve(storagePath);
        if (File.Exists(fullPath)) File.Delete(fullPath);
        return Task.CompletedTask;
    }

    private string Resolve(string relativePath)
    {
        var fullPath = Path.GetFullPath(Path.Combine(_root, relativePath.Replace('/', Path.DirectorySeparatorChar)));
        if (!fullPath.StartsWith(_root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Invalid storage path.");
        return fullPath;
    }
}
