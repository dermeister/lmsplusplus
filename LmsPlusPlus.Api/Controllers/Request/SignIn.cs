using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record SignIn
{
    [MinLength(1), MaxLength(500)]
    public string Login { get; }
    [MinLength(1), MaxLength(1000)]
    public string Password { get; }

    public SignIn(string login, string password)
    {
        Login = login;
        Password = password;
    }
}
