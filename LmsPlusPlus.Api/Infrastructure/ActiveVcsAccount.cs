namespace LmsPlusPlus.Api.Infrastructure;

public record ActiveVcsAccount
{
    public long UserId { get; set; }
    public User User { get; set; } = null!;
    public long VcsAccountId { get; set; }
    public VcsAccount VcsAccount { get; set; } = null!;
}
