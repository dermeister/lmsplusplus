using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record CreateTopic
{
    [MaxLength(1000)]
    public string Name { get; }
    public long AuthorId { get; }

    public CreateTopic(string name, long authorId)
    {
        Name = name;
        AuthorId = authorId;
    }
}

public record UpdateTopic
{
    [MaxLength(1000)]
    public string Name { get; }

    public UpdateTopic(string name) => Name = name;
}
