namespace LmsPlusPlus.Runtime.DockerCompose;

class Service
{
    public string? Build { get; set; }
    public IEnumerable<string>? Ports { get; set; }
    public bool StdinOpen { get; set; }
}
