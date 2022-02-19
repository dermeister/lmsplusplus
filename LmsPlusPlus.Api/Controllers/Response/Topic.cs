namespace LmsPlusPlus.Api.Response;

public record Topic(long Id, string Name, long AuthorId)
{
    public static explicit operator Topic(Infrastructure.Topic topic) =>
        new(topic.Id, topic.Name, topic.AuthorId);
}
