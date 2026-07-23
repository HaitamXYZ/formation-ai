using Backend.Enums;

namespace Backend.Interfaces;

public interface IDocumentTextExtractor
{
    bool CanExtract(TrainingModuleResourceType resourceType);
    Task<string> ExtractAsync(Stream stream, CancellationToken cancellationToken = default);
}
