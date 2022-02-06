namespace LmsPlusPlus.Api.DatabaseModels;

public record Solution
{
    public long Id { get; set; }
    public Repository Repository { get; set; } = null!;
    public User Solver { get; set; } = null!;
    public Task Task { get; set; } = null!;
}
