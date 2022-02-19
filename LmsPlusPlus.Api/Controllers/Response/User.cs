namespace LmsPlusPlus.Api.Response;

public record User(string FirstName, string LastName)
{
    public static explicit operator User(Infrastructure.User user) => new(user.FirstName, user.LastName);
}
