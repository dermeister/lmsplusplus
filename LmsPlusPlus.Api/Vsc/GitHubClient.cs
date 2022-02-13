using Octokit;

namespace LmsPlusPlus.Api.Vsc;

class GitHubClient : IVcsHostingClient
{
    readonly ProductHeaderValue _productHeaderValue = new("LMS++");
    readonly Octokit.GitHubClient _client;
    readonly string _workingDirectory;
    readonly string _token;

    internal GitHubClient(string token, string workingDirectory)
    {
        _token = token;
        _client = new Octokit.GitHubClient(_productHeaderValue)
        {
            Credentials = new Credentials(token)
        };
        _workingDirectory = workingDirectory;
    }

    public async Task<string> GetUsername()
    {
        User user = await _client.User.Current();
        return user.Login;
    }

    public async Task<Uri> CreateRepositoryFromTemplate(string name, Uri templateRepositoryUri)
    {
        Repository newOctokitRepository = await _client.Repository.Create(new NewRepository(name));
        User user = await _client.User.Current();
        IEnumerable<EmailAddress> emails = await _client.User.Email.GetAll();
        string email = emails.First(e => e.Primary).Email;
        await RepositoryUtils.CopyRepository(_workingDirectory, templateRepositoryUri, new Uri(newOctokitRepository.CloneUrl), user.Login,
            _token, user.Name, email);
        return new Uri(newOctokitRepository.CloneUrl);
    }
}
