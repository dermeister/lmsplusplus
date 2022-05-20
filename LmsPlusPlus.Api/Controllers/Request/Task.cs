using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record CreateTask
{
    [MaxLength(1000)]
    public string Title { get; }
    public string Description { get; }
    public long TopicId { get; }
    public IEnumerable<short> TechnologyIds { get; }

    public CreateTask(string title, string description, long topicId, IEnumerable<short> technologyIds)
    {
        Title = title;
        Description = description;
        TopicId = topicId;
        TechnologyIds = technologyIds;
    }
}

public record UpdateTask
{
    [MaxLength(1000)]
    public string Title { get; }
    public string Description { get; }
    public IEnumerable<short> TechnologyIds { get; }

    public UpdateTask(string title, string description, IEnumerable<short> technologyIds)
    {
        Title = title;
        Description = description;
        TechnologyIds = technologyIds;
    }
}
