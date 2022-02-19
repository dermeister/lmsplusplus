namespace LmsPlusPlus.Api.Response;

public record Preferences(string Theme)
{
    public static explicit operator Preferences(Infrastructure.Preferences preferences) => new(preferences.Theme);
}
