using System.Collections.Concurrent;

namespace LmsPlusPlus.Runtime;

class ProgressReader<T> : IDisposable
{
    const int LockTimeout = 5000;

    readonly ConcurrentQueue<T> _queuedValues = new();
    readonly ConcurrentQueue<TaskCompletionSource<T?>> _queuedTaskCompletionSources = new();
    readonly ReaderWriterLock _lock = new();
    bool _isDisposed;

    internal ProgressReader(Progress<T> progress) => progress.ProgressChanged += ProgressChanged;

    public void Dispose()
    {
        try
        {
            _lock.AcquireWriterLock(LockTimeout);
            if (!_isDisposed)
            {
                _isDisposed = true;
                while (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                    taskCompletionSource.SetResult(result: default(T?));
            }
        }
        finally
        {
            if (_lock.IsWriterLockHeld)
                _lock.ReleaseWriterLock();
        }
    }

    internal Task<T?> ReadAsync()
    {
        if (_queuedValues.TryDequeue(out T? value))
            return Task.FromResult<T?>(value);
        try
        {
            _lock.AcquireReaderLock(LockTimeout);
            if (_isDisposed)
                return Task.FromResult(result: default(T?));
            TaskCompletionSource<T?> taskCompletionSource = new();
            _queuedTaskCompletionSources.Enqueue(taskCompletionSource);
            return taskCompletionSource.Task;
        }
        finally
        {
            if (_lock.IsReaderLockHeld)
                _lock.ReleaseReaderLock();
        }
    }

    void ProgressChanged(object? sender, T value)
    {
        try
        {
            _lock.AcquireReaderLock(LockTimeout);
            if (!_isDisposed)
                if (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                    taskCompletionSource.SetResult(value);
                else
                    _queuedValues.Enqueue(value);
        }
        finally
        {
            if (_lock.IsReaderLockHeld)
                _lock.ReleaseReaderLock();
        }
    }
}
