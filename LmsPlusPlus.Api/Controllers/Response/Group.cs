namespace LmsPlusPlus.Api.Response;

public record Group(long Id, string Name, long TopicId)
{
    public static explicit operator Group(Infrastructure.Group group) => new(group.Id, group.Name, group.TopicId);
}
