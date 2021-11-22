using System.Collections.Concurrent;

namespace LmsPlusPlus.Runtime;

class ProgressReader<T> : IDisposable
{
    readonly ConcurrentQueue<T> _queuedValues = new();
    readonly ConcurrentQueue<TaskCompletionSource<T?>> _queuedTaskCompletionSources = new();
    bool _isDisposed;

    public ProgressReader(Progress<T> progress) => progress.ProgressChanged += ProgressChanged;

    public void Dispose()
    {
        _isDisposed = true;
        while (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
            taskCompletionSource.SetResult(result: default(T?));
    }

    internal Task<T?> ReadAsync()
    {
        if (_queuedValues.TryDequeue(out T? value))
            return Task.FromResult<T?>(value);
        if (_isDisposed)
            return Task.FromResult(result: default(T?));
        TaskCompletionSource<T?> taskCompletionSource = new();
        _queuedTaskCompletionSources.Enqueue(taskCompletionSource);
        return taskCompletionSource.Task;
    }

    void ProgressChanged(object? sender, T value)
    {
        if (!_isDisposed)
            if (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                taskCompletionSource.SetResult(value);
            else
                _queuedValues.Enqueue(value);
    }
}
