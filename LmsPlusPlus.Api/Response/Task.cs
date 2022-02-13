namespace LmsPlusPlus.Api.Response;

public record Task(long Id, string Title, string Description, long TopicId, IEnumerable<short> TechnologyIds)
{
    public static explicit operator Task(Infrastructure.Task task)
    {
        IEnumerable<short> technologyIds = task.Technologies.Select(t => t.Id);
        return new Task(task.Id, task.Title, task.Description, task.TopicId, technologyIds);
    }
}
