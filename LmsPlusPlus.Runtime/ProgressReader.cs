namespace LmsPlusPlus.Runtime;

class ProgressReader<T>
{
    readonly Queue<T> _queuedValues = new();
    readonly Queue<TaskCompletionSource<T?>> _queuedTaskCompletionSources = new();
    readonly object _lock = new();
    readonly Progress<T> _progress;
    bool _isListeningToProgressChanges;

    internal ProgressReader(Progress<T> progress)
    {
        _progress = progress;
        _progress.ProgressChanged += ProgressChanged;
        _isListeningToProgressChanges = true;
    }

    internal void StopListeningToProgressChanges()
    {
        lock (_lock)
        {
            _progress.ProgressChanged -= ProgressChanged;
            _isListeningToProgressChanges = false;
            while (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                taskCompletionSource.SetResult(result: default(T?));
        }
    }

    internal Task<T?> ReadAsync()
    {
        lock (_lock)
        {
            if (_queuedValues.TryDequeue(out T? value))
                return Task.FromResult<T?>(value);
            if (!_isListeningToProgressChanges)
                return Task.FromResult(result: default(T));
            TaskCompletionSource<T?> taskCompletionSource = new();
            _queuedTaskCompletionSources.Enqueue(taskCompletionSource);
            return taskCompletionSource.Task;
        }
    }

    void ProgressChanged(object? sender, T value)
    {
        lock (_lock)
            if (_queuedTaskCompletionSources.TryDequeue(out TaskCompletionSource<T?>? taskCompletionSource))
                taskCompletionSource.SetResult(value);
            else
                _queuedValues.Enqueue(value);
    }
}
