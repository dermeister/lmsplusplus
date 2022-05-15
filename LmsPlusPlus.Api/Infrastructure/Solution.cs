namespace LmsPlusPlus.Api.Infrastructure;

public record Solution
{
    public long Id { get; set; }
    public long RepositoryId { get; set; }
    public Repository Repository { get; set; } = null!;
    public long SolverId { get; set; }
    public User Solver { get; set; } = null!;
    public long TaskId { get; set; }
    public Task Task { get; set; } = null!;
    public short TechnologyId { get; set; }
    public Technology Technology { get; set; } = null!;
}
