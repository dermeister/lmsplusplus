namespace LmsPlusPlus.Api.Infrastructure;

public record VcsHostingProvider
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
}
