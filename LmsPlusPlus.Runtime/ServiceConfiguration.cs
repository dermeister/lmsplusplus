using System.Collections.ObjectModel;

namespace LmsPlusPlus.Runtime;

public record ServiceConfiguration
{
    public string Name { get; }
    public bool Stdin { get; internal init; }
    public ReadOnlyCollection<VirtualPortMapping> VirtualPortMappings { get; internal init; }
    internal string ContextPath { get; }
    internal string? NetworkName { get; init; }

    internal ServiceConfiguration(string name, string contextPath)
    {
        Name = name;
        VirtualPortMappings = Array.AsReadOnly(Array.Empty<VirtualPortMapping>());
        ContextPath = contextPath;
    }
}

public record VirtualPortMapping
{
    public PortType PortType { get; }
    public ushort ContainerPort { get; }
    public ushort VirtualHostPort { get; }

    internal VirtualPortMapping(PortType portType, ushort containerPort, ushort virtualHostPort)
    {
        PortType = portType;
        ContainerPort = containerPort;
        VirtualHostPort = virtualHostPort;
    }
}

public enum PortType
{
    Tcp,
    Udp
}
