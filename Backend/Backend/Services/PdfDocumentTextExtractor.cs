using Backend.Enums;
using Backend.Interfaces;
using UglyToad.PdfPig;
using UglyToad.PdfPig.DocumentLayoutAnalysis.TextExtractor;

namespace Backend.Services;

public sealed class PdfDocumentTextExtractor : IDocumentTextExtractor
{
    public bool CanExtract(TrainingModuleResourceType resourceType) => resourceType == TrainingModuleResourceType.Pdf;

    public Task<string> ExtractAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        using var document = PdfDocument.Open(stream);
        var text = string.Join("\n\n", document.GetPages().Select(page => ContentOrderTextExtractor.GetText(page)));
        return Task.FromResult(text);
    }
}
