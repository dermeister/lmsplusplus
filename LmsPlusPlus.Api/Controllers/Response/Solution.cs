namespace LmsPlusPlus.Api.Response;

public record Solution(long Id, string CloneUrl, string? WebsiteUrl, long TaskId, long SolverId)
{
    public static explicit operator Solution(Infrastructure.Solution solution) => new(solution.Id, solution.Repository.CloneUrl,
        solution.Repository.WebsiteUrl, solution.TaskId, solution.SolverId);
}
