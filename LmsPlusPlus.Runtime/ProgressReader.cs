using System.Collections.Concurrent;

namespace LmsPlusPlus.Runtime;

class ProgressReader<T> : IDisposable
{
    readonly ConcurrentQueue<T> _pendingValues = new();
    TaskCompletionSource<T?>? _taskCompletionSource;
    bool _isDisposed;

    public ProgressReader(Progress<T> progress) => progress.ProgressChanged += ProgressChanged;

    public void Dispose() => _isDisposed = true;

    internal Task<T?> ReadAsync()
    {
        if (_pendingValues.TryDequeue(out T? value))
            return Task.FromResult<T?>(value);
        if (_isDisposed)
        {
            _taskCompletionSource = null;
            return Task.FromResult<T?>(result: default);
        }
        _taskCompletionSource = new TaskCompletionSource<T?>();
        return _taskCompletionSource.Task;
    }


    void ProgressChanged(object? sender, T value)
    {
        if (!_isDisposed)
            if (_taskCompletionSource is not null)
            {
                _taskCompletionSource?.SetResult(value);
                _taskCompletionSource = null;
            }
            else
                _pendingValues.Enqueue(value);
    }
}
