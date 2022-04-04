using System.Text.Json;
using Docker.DotNet;
using LibGit2Sharp;

namespace LmsPlusPlus.Runtime;

public class ImageBuildException : Exception
{
    class ResponseBody
    {
        public string Message { get; set; } = null!;
    }

    internal ImageBuildException(DockerApiException e) : base(GetDockerApiExceptionMessage(e))
    {
    }

    static string GetDockerApiExceptionMessage(DockerApiException e) => JsonSerializer.Deserialize<ResponseBody>(e.ResponseBody)!.Message;
}

public class DockerComposeException : Exception
{
    public IEnumerable<string> Errors { get; set; }

    internal DockerComposeException(IEnumerable<string> errors) => Errors = errors;
}

public class RepositoryCloneException : Exception
{
    internal RepositoryCloneException(LibGit2SharpException _) : base("Unable to clone repository.")
    {
    }
}
