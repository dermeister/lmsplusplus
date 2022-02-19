namespace LmsPlusPlus.Api.Response;

public record Solution(long Id, string RepositoryName, long TaskId, short TechnologyId)
{
    public static explicit operator Solution(Infrastructure.Solution solution) =>
        new(solution.Id, solution.Repository.Name, solution.TaskId, solution.TechnologyId);
}
