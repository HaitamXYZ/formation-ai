using Backend.Models;

namespace Backend.Interfaces;

public interface IModuleKnowledgeService
{
    Task<IReadOnlyCollection<ModuleKnowledgeSource>> BuildContextAsync(
        int trainingId,
        int? selectedModuleId,
        bool canAccessUnpublishedModules,
        string question,
        CancellationToken cancellationToken = default);
}
