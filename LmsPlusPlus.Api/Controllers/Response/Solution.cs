namespace LmsPlusPlus.Api.Response;

public record Solution(long Id, string? RepositoryWebsiteUrl, long TaskId)
{
    public static explicit operator Solution(Infrastructure.Solution solution) => new(solution.Id, solution.Repository.WebsiteUrl, solution.TaskId);
}
