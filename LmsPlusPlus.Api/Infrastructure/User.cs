namespace LmsPlusPlus.Api.Infrastructure;

public record User
{
    public long Id { get; set; }
    public string Login { get; set; } = null!;
    public string PasswordHash { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public Role Role { get; set; }
}
