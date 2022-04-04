namespace LmsPlusPlus.Runtime.DockerCompose;

class Compose
{
    public string? Version { get; set; }
    public IDictionary<string, Service> Services { get; set; } = new Dictionary<string, Service>();
}
