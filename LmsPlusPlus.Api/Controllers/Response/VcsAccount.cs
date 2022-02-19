namespace LmsPlusPlus.Api.Response;

public record VcsAccount(long Id, string Name, string HostingProviderId)
{
    public static explicit operator VcsAccount(Infrastructure.VcsAccount account) =>
        new(account.Id, account.Name, account.HostingProviderId);
}
