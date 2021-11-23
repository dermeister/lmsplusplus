using System.Collections.Concurrent;

namespace LmsPlusPlus.Runtime;

class ProgressReader<T> : IDisposable
{
    readonly ConcurrentQueue<T> _queuedValues = new();
    readonly ConcurrentQueue<TaskCompletionSource<T?>> _queuedTaskCompletionSources = new();
    readonly ReaderWriterLockSlim _lock = new();
    bool _isDisposed;

    internal ProgressReader(Progress<T> progress) => progress.ProgressChanged += ProgressChanged;

    public void Dispose()
    {
        try
        {
            _lock.EnterWriteLock();
            if (!_isDisposed)
            {
                _isDisposed = true;
                while (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                    taskCompletionSource.SetResult(result: default(T?));
            }
        }
        finally
        {
            _lock.ExitWriteLock();
        }
    }

    internal Task<T?> ReadAsync()
    {
        if (_queuedValues.TryDequeue(out T? value))
            return Task.FromResult<T?>(value);
        try
        {
            _lock.EnterReadLock();
            if (_isDisposed)
                return Task.FromResult(result: default(T?));
            TaskCompletionSource<T?> taskCompletionSource = new();
            _queuedTaskCompletionSources.Enqueue(taskCompletionSource);
            return taskCompletionSource.Task;
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }

    void ProgressChanged(object? sender, T value)
    {
        try
        {
            _lock.EnterReadLock();
            if (!_isDisposed)
                if (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                    taskCompletionSource.SetResult(value);
                else
                    _queuedValues.Enqueue(value);
        }
        finally
        {
            _lock.ExitReadLock();
        }
    }
}
