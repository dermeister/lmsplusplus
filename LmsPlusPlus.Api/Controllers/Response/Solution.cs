namespace LmsPlusPlus.Api.Response;

public record Solution(long Id, long TaskId, short TechnologyId)
{
    public static explicit operator Solution(Infrastructure.Solution solution) => new(solution.Id, solution.TaskId, solution.TechnologyId);
}
