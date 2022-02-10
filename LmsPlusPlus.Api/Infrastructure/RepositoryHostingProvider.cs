namespace LmsPlusPlus.Api.Infrastructure;

public record RepositoryHostingProvider
{
    public short Id { get; set; }
    public string Name { get; set; } = null!;
}
