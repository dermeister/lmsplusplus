namespace LmsPlusPlus.Api.Infrastructure;

public record Preferences
{
    public long UserId { get; set; }
    public string Theme { get; set; } = null!;
    public User User { get; set; } = null!;
}
