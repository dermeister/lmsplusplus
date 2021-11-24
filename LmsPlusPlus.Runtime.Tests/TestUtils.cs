using System;
using System.IO;
using System.Threading.Tasks;

namespace LmsPlusPlus.Runtime.Tests;

static class TestUtils
{
    internal static async Task<string?> ReadServiceRunOutput(Service service)
    {
        ServiceOutput? output;
        do
            output = await service.ReadAsync();
        while (output?.Stage is ServiceOutputStage.Build);
        return output?.Content;
    }

    internal static string GetContextPath(string serviceName) => Path.Combine(path1: "Services", serviceName);

    internal static async Task ReportAndWait<T>(IProgress<T> progress, T value)
    {
        progress.Report(value);
        await Task.Delay(millisecondsDelay: 100);
    }
}
