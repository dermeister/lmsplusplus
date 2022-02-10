namespace LmsPlusPlus.Api.Infrastructure;

public record Preferences
{
    public long Id { get; set; }
    public string Theme { get; set; } = null!;
    public long UserId { get; set; }
    public User User { get; set; } = null!;
}
