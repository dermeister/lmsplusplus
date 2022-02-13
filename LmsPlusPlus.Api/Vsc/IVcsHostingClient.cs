namespace LmsPlusPlus.Api.Vsc;

interface IVcsHostingClient
{
    Task<string> GetUsername();

    Task<Uri> CreateRepositoryFromTemplate(string name, Uri templateRepositoryUri);
}
