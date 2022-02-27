namespace LmsPlusPlus.Api.Vcs;

interface IHostingClient
{
    Task<string> GetUsername();

    Task<Repository> CreateRepositoryFromTemplate(string name, Uri templateRepositoryUri);
}
