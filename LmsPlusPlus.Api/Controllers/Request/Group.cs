using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record CreateGroup
{
    [MinLength(1), MaxLength(1000)]
    public string Name { get; }
    public long TopicId { get; }

    public CreateGroup(string name, long topicId)
    {
        Name = name;
        TopicId = topicId;
    }
}

public record UpdateGroup
{
    [MinLength(1), MaxLength(1000)]
    public string Name { get; }

    public UpdateGroup(string name) => Name = name;
}
