namespace LmsPlusPlus.Api.Request;

public record Solution(string RepositoryName, long TaskId, short TechnologyId);

public record CreateSolution(string RepositoryName, long TaskId, short TechnologyId);
