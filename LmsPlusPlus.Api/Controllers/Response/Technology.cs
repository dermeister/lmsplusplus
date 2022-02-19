namespace LmsPlusPlus.Api.Response;

public record Technology(short Id, string Name)
{
    public static explicit operator Technology(Infrastructure.Technology technology) => new(technology.Id, technology.Name);
}
