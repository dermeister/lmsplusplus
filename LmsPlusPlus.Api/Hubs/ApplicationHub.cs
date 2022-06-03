using System.Collections.ObjectModel;
using System.Diagnostics.CodeAnalysis;
using System.Runtime.CompilerServices;
using LmsPlusPlus.Runtime;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

public class ApplicationHub : Hub
{
    const string ApplicationItemKey = "application";
    readonly SemaphoreSlim _lock = new(1);
    readonly Infrastructure.ApplicationContext _context;
    readonly string _workingDirectory;

    public ApplicationHub(Infrastructure.ApplicationContext context, IConfiguration configuration)
    {
        _context = context;
        _workingDirectory = configuration["WorkingDirectory"];
    }

    public async Task<IEnumerable<ServiceConfiguration>> StartApplication(int solutionId)
    {
        Infrastructure.Solution? solution = await _context.Solutions.Include(s => s.Repository).SingleOrDefaultAsync(s => s.Id == solutionId);
        if (solution is null)
            throw new ArgumentException(message: $"Invalid solution id {solution}", nameof(solutionId));
        ApplicationConfiguration applicationConfiguration = new(solution.Repository.CloneUrl, _workingDirectory);
        Application application = new(applicationConfiguration);
        Context.Items[ApplicationItemKey] = application;
        ReadOnlyCollection<Runtime.ServiceConfiguration> serviceConfigurations = await application.GetServiceConfigurations();
        return from serviceConfiguration in serviceConfigurations
               let name = serviceConfiguration.Name
               let stdin = serviceConfiguration.Stdin
               let virtualPorts = serviceConfiguration.VirtualPortMappings.Select(m => m.VirtualHostPort).ToArray()
               select new ServiceConfiguration(name, stdin, Array.AsReadOnly(virtualPorts));
    }

    public async Task<IEnumerable<PortMapping>> GetOpenedPorts(string serviceName)
    {
        if (!TryGetApplication(out Application? application))
            throw ApplicationNotStarted();
        ReadOnlyCollection<Runtime.PortMapping> portMappings = await application.GetOpenedPortsAsync(serviceName);
        return from portMapping in portMappings select new PortMapping(portMapping.VirtualHostPort, portMapping.HostPort);
    }

    public async IAsyncEnumerable<ServiceBuildOutput> ReadBuildOutput(string serviceName, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!TryGetApplication(out Application? application))
            throw ApplicationNotStarted();
        Runtime.ServiceBuildOutput? buildOutput;
        do
            try
            {
                await _lock.WaitAsync(cancellationToken);
                buildOutput = await application.ReadServiceBuildOutputAsync(serviceName, cancellationToken);
                if (buildOutput is not null)
                    yield return new ServiceBuildOutput(buildOutput.Text, buildOutput.Anchor);
            }
            finally
            {
                _lock.Release();
            }
        while (buildOutput is not null);
    }

    public async IAsyncEnumerable<string> ReadServiceOutput(string serviceName, [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (!TryGetApplication(out Application? application))
            throw ApplicationNotStarted();
        string? serviceOutput;
        do
            try
            {
                await _lock.WaitAsync(cancellationToken);
                serviceOutput = await application.ReadServiceOutputAsync(serviceName, cancellationToken);
                if (serviceOutput is not null)
                    yield return serviceOutput;
            }
            finally
            {
                _lock.Release();
            }
        while (serviceOutput is not null);
    }

    public async Task WriteServiceInput(string serviceName, string text)
    {
        if (!TryGetApplication(out Application? application))
            throw ApplicationNotStarted();
        try
        {
            await _lock.WaitAsync();
            await application.WriteServiceInputAsync(serviceName, text);
        }
        finally
        {
            _lock.Release();
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        if (TryGetApplication(out Application? application))
            try
            {
                _lock.Wait();
                await application.DisposeAsync();
                Context.Items.Remove(ApplicationItemKey);
            }
            finally
            {
                _lock.Release();
            }
    }

    protected override void Dispose(bool disposing) => _lock.Dispose();

    static InvalidOperationException ApplicationNotStarted() => new("Application not started");

    bool TryGetApplication([MaybeNullWhen(false)] out Application result)
    {
        if (Context.Items.TryGetValue(ApplicationItemKey, out object? o) && o is Application application)
        {
            result = application;
            return true;
        }
        result = null;
        return false;
    }
}

public record struct ServiceConfiguration(string Name, bool Stdin, ReadOnlyCollection<ushort> VirtualPorts);

public record struct ServiceBuildOutput(string Text, string? Anchor);

public record struct PortMapping(ushort VirtualPort, ushort Port);
