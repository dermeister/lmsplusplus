using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record CreateSolution
{
    [MinLength(1), MaxLength(200)]
    public string RepositoryName { get; }
    public long TaskId { get; }
    public short TechnologyId { get; }

    public CreateSolution(string repositoryName, long taskId, short technologyId)
    {
        RepositoryName = repositoryName;
        TaskId = taskId;
        TechnologyId = technologyId;
    }
}
