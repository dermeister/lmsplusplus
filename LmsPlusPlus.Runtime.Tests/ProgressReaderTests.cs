using System;
using System.Threading.Tasks;
using Xunit;

namespace LmsPlusPlus.Runtime.Tests;

public class ProgressReaderTests
{
    [Fact]
    public async Task ReadDataAfterReport()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, "text1");
        string? text1 = await progressReader.ReadAsync();
        await ReportAndWait(progress, "text2");
        string? text2 = await progressReader.ReadAsync();

        // Assert
        Assert.Equal("text1", text1);
        Assert.Equal("text2", text2);
    }

    [Fact]
    public async Task ReadQueuedData()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, "text1");
        await ReportAndWait(progress, "text2");
        string? text1 = await progressReader.ReadAsync();
        string? text2 = await progressReader.ReadAsync();

        // Assert
        Assert.Equal("text1", text1);
        Assert.Equal("text2", text2);
    }

    [Fact]
    public async Task ReadQueuedDataAfterDispose()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, "text1");
        await ReportAndWait(progress, "text2");
        progressReader.Dispose();
        string? text1 = await progressReader.ReadAsync();
        string? text2 = await progressReader.ReadAsync();
        string? text3 = await progressReader.ReadAsync();
        string? text4 = await progressReader.ReadAsync();

        // Assert
        Assert.Equal("text1", text1);
        Assert.Equal("text2", text2);
        Assert.Null(text3);
        Assert.Null(text4);
    }

    static async Task ReportAndWait<T>(IProgress<T> progress, T value)
    {
        progress.Report(value);
        await Task.Delay(millisecondsDelay: 100);
    }
}
