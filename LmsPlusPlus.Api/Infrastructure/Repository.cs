namespace LmsPlusPlus.Api.Infrastructure;

public record Repository
{
    public long Id { get; set; }
    public string CloneUrl { get; set; } = null!;
    public string? WebsiteUrl { get; set; } = null!;
    public long VcsAccountId { get; set; }
    public VcsAccount VcsAccount { get; set; } = null!;
}
