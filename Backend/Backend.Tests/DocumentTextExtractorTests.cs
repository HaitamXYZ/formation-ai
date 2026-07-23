using Backend.Services;
using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using UglyToad.PdfPig.Content;
using UglyToad.PdfPig.Core;
using UglyToad.PdfPig.Fonts.Standard14Fonts;
using UglyToad.PdfPig.Writer;

namespace Backend.Tests;

public sealed class DocumentTextExtractorTests
{
    [Fact]
    public async Task PdfExtractor_ExtractsTextFromValidPdf()
    {
        var builder = new PdfDocumentBuilder();
        var font = builder.AddStandard14Font(Standard14Font.Helvetica);
        var page = builder.AddPage(UglyToad.PdfPig.Content.PageSize.A4);
        page.AddText("Formation PDF valide", 12, new PdfPoint(50, 750), font);
        await using var stream = new MemoryStream(builder.Build());

        var text = await new PdfDocumentTextExtractor().ExtractAsync(stream);

        Assert.Contains("Formation PDF valide", text);
    }

    [Fact]
    public async Task DocxExtractor_ExtractsParagraphsFromValidDocx()
    {
        await using var stream = new MemoryStream();
        using (var document = WordprocessingDocument.Create(stream, WordprocessingDocumentType.Document, true))
        {
            var main = document.AddMainDocumentPart();
            main.Document = new Document(new Body(
                new Paragraph(new Run(new Text("Premier paragraphe"))),
                new Paragraph(new Run(new Text("Deuxieme paragraphe")))));
            main.Document.Save();
        }
        stream.Position = 0;

        var text = await new DocxDocumentTextExtractor().ExtractAsync(stream);

        Assert.Contains("Premier paragraphe", text);
        Assert.Contains("Deuxieme paragraphe", text);
    }
}
