namespace LmsPlusPlus.Api.Response;

public record VcsHostingProvider(string Id, string Name)
{
    public static explicit operator VcsHostingProvider(Infrastructure.VcsHostingProvider provider) => new(provider.Id, provider.Name);
}
