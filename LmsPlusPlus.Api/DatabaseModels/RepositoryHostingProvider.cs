namespace LmsPlusPlus.Api.DatabaseModels;

public record RepositoryHostingProvider
{
    public short Id { get; set; }
    public string Name { get; set; } = null!;
}
