using System.Text;
using Backend.Enums;
using Backend.Interfaces;

namespace Backend.Services;

public sealed class PlainTextDocumentExtractor : IDocumentTextExtractor
{
    public bool CanExtract(TrainingModuleResourceType resourceType) => resourceType is TrainingModuleResourceType.Txt or TrainingModuleResourceType.Markdown;

    public async Task<string> ExtractAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        using var reader = new StreamReader(stream, new UTF8Encoding(false, true), true, leaveOpen: true);
        return await reader.ReadToEndAsync(cancellationToken);
    }
}
