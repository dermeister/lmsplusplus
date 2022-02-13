namespace LmsPlusPlus.Api.Infrastructure;

public record Repository
{
    public long Id { get; set; }
    public string Name { get; set; } = null!; // TODO: is it really needed?
    public string Url { get; set; } = null!;
    public long VcsAccountId { get; set; }
    public VcsAccount VcsAccount { get; set; } = null!;
}
