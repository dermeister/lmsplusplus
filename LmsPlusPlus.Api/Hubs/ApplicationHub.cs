using System.Collections.ObjectModel;
using System.Runtime.CompilerServices;
using LmsPlusPlus.Api.Infrastructure;
using LmsPlusPlus.Api.Models;
using LmsPlusPlus.Runtime;
using Microsoft.AspNetCore.SignalR;

namespace LmsPlusPlus.Api;

public class ApplicationHub : Hub
{
    const string ApplicationItemKey = "application";
    readonly SemaphoreSlim _lock = new(1);
    readonly ApplicationContext _dbContext;
    readonly string _workingDirectory = Path.Combine(Path.GetTempPath(), path2: "lmsplusplus", path3: "runtime-working-directory");

    public ApplicationHub(ApplicationContext dbContext) => _dbContext = dbContext;

    public async Task<IEnumerable<ServiceConfiguration>> StartApplication(int solutionId)
    {
        Solution? solution = await _dbContext.Solutions.FindAsync(solutionId);
        if (solution is null)
            throw new Exception();
        ApplicationConfiguration applicationConfiguration = new(solution.RepositoryUrl, _workingDirectory);
        Application application = new(applicationConfiguration);
        Context.Items[ApplicationItemKey] = application;
        ReadOnlyCollection<Runtime.ServiceConfiguration> serviceConfigurations = await application.GetServiceConfigurations();
        return from serviceConfiguration in serviceConfigurations
               let name = serviceConfiguration.Name
               let stdin = serviceConfiguration.Stdin
               let virtualPorts = serviceConfiguration.VirtualPortMappings.Select(m => m.VirtualHostPort).ToArray()
               select new ServiceConfiguration(name, stdin, Array.AsReadOnly(virtualPorts));
    }

    public async IAsyncEnumerable<ServiceBuildOutput> ReadBuildOutput(string serviceName,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (Context.Items.TryGetValue(ApplicationItemKey, out object? o) && o is Application application)
        {
            LmsPlusPlus.Runtime.ServiceBuildOutput? buildOutput;
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
    }

    public async IAsyncEnumerable<string> ReadServiceOutput(string serviceName,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        if (Context.Items.TryGetValue(ApplicationItemKey, out object? o) && o is Application application)
        {
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
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        if (Context.Items.TryGetValue(ApplicationItemKey, out object? o) && o is Application application)
            try
            {
                await _lock.WaitAsync();
                await application.DisposeAsync();
                Context.Items.Remove(ApplicationItemKey);
            }
            finally
            {
                _lock.Release();
            }
    }

    protected override void Dispose(bool disposing) => _lock.Dispose();
}

public record struct ServiceConfiguration(string Name, bool Stdin, ReadOnlyCollection<ushort> VirtualPorts);

public record struct ServiceBuildOutput(string Text, string? Anchor);
