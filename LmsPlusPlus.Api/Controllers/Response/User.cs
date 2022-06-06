namespace LmsPlusPlus.Api.Response;

public record User(long Id, string FirstName, string LastName)
{
    public static explicit operator User(Infrastructure.User user) => new(user.Id, user.FirstName, user.LastName);
}
