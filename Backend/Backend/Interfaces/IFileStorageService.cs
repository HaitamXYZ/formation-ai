namespace Backend.Interfaces;

public sealed record StoredFileResult(string StoredFileName, string StoragePath);

public interface IFileStorageService
{
    Task<StoredFileResult> SaveAsync(Stream source, string extension, CancellationToken cancellationToken = default);
    Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default);
    Task DeleteAsync(string storagePath, CancellationToken cancellationToken = default);
}
