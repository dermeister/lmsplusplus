namespace LmsPlusPlus.Api.Infrastructure;

public record VcsAccount
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public string AccessToken { get; set; } = null!;
    public bool IsActive { get; set; }
    public string HostingProviderId { get; set; } = null!;
    public VcsHostingProvider HostingProvider { get; set; } = null!;
    public long UserId { get; set; }
    public User User { get; set; } = null!;
}
