namespace LmsPlusPlus.Api.DatabaseModels;

public record Repository
{
    public long Id { get; set; }
    public string Url { get; set; } = null!;
    public RepositoryHostingProvider HostingProvider { get; set; } = null!;
}
