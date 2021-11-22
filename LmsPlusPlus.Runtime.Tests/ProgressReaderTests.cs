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
        await ReportAndWait(progress, value: "text1");
        string? text1 = await progressReader.ReadAsync();
        await ReportAndWait(progress, value: "text2");
        string? text2 = await progressReader.ReadAsync();
        progressReader.Dispose();

        // Assert
        Assert.Equal(expected: "text1", text1);
        Assert.Equal(expected: "text2", text2);
    }

    [Fact]
    public async Task ReadQueuedData()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, value: "text1");
        await ReportAndWait(progress, value: "text2");
        string? text1 = await progressReader.ReadAsync();
        string? text2 = await progressReader.ReadAsync();
        progressReader.Dispose();

        // Assert
        Assert.Equal(expected: "text1", text1);
        Assert.Equal(expected: "text2", text2);
    }

    [Fact]
    public async Task ReadQueuedDataAfterDispose()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, value: "text1");
        await ReportAndWait(progress, value: "text2");
        progressReader.Dispose();
        string? text1 = await progressReader.ReadAsync();
        string? text2 = await progressReader.ReadAsync();
        string? text3 = await progressReader.ReadAsync();
        string? text4 = await progressReader.ReadAsync();

        // Assert
        Assert.Equal(expected: "text1", text1);
        Assert.Equal(expected: "text2", text2);
        Assert.Null(text3);
        Assert.Null(text4);
    }

    [Fact]
    public async Task ReadDataConcurrently()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        await ReportAndWait(progress, value: "text1");
        await ReportAndWait(progress, value: "text2");
        Task<string?> textTask1 = progressReader.ReadAsync();
        Task<string?> textTask2 = progressReader.ReadAsync();
        Task<string?> textTask3 = progressReader.ReadAsync();
        progressReader.Dispose();
        string?[] texts = await Task.WhenAll(textTask1, textTask2, textTask3);

        // Assert
        Assert.Contains(expected: "text1", texts);
        Assert.Contains(expected: "text2", texts);
        Assert.Contains(expected: null, texts);
    }

    [Fact]
    public async Task MultipleTasksResolveToNullWhenProgressReaderDisposed()
    {
        // Arrange
        IProgress<string> progress = new Progress<string>();
        ProgressReader<string> progressReader = new((Progress<string>)progress);

        // Act
        Task<string?> textTask1 = progressReader.ReadAsync();
        Task<string?> textTask2 = progressReader.ReadAsync();
        Task<string?> textTask3 = progressReader.ReadAsync();
        progressReader.Dispose();
        string?[] texts = await Task.WhenAll(textTask1, textTask2, textTask3);

        // Assert
        Assert.Null(texts[0]);
        Assert.Null(texts[1]);
        Assert.Null(texts[2]);
    }

    static async Task ReportAndWait<T>(IProgress<T> progress, T value)
    {
        progress.Report(value);
        await Task.Delay(millisecondsDelay: 100);
    }
}
