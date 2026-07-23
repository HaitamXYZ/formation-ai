using Backend.Enums;
using Backend.Interfaces;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace Backend.Services;

public sealed class DocxDocumentTextExtractor : IDocumentTextExtractor
{
    public bool CanExtract(TrainingModuleResourceType resourceType) => resourceType == TrainingModuleResourceType.Docx;

    public Task<string> ExtractAsync(Stream stream, CancellationToken cancellationToken = default)
    {
        using var document = WordprocessingDocument.Open(stream, false);
        var body = document.MainDocumentPart?.Document?.Body;
        var paragraphs = body is null
            ? Enumerable.Empty<string>()
            : body.Descendants<Paragraph>().Select(paragraph => paragraph.InnerText);
        return Task.FromResult(string.Join("\n", paragraphs));
    }
}
