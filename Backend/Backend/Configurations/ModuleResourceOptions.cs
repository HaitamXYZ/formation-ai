namespace Backend.Configurations;

public sealed class ModuleResourceOptions
{
    public const string SectionName = "ModuleResources";
    public string StorageRoot { get; set; } = "Storage/ModuleResources";
    public long MaxFileSizeBytes { get; set; } = 10 * 1024 * 1024;
    public int MaxResourcesPerModule { get; set; } = 20;
    public int MaxTextCharacters { get; set; } = 100_000;
    public int MaxContextCharacters { get; set; } = 18_000;
    public int ContextChunkCharacters { get; set; } = 1_800;
    public int MaxSelectedChunks { get; set; } = 8;
}
