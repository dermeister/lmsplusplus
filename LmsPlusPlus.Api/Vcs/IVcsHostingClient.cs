namespace LmsPlusPlus.Api.Vcs;

interface IVcsHostingClient
{
    Task<string> GetUsername();

    Task<Uri> CreateRepositoryFromTemplate(string name, Uri templateRepositoryUri);
}
