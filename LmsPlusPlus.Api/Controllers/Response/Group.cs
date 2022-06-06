namespace LmsPlusPlus.Api.Response;

public record Group(long Id, string Name, long TopicId, IEnumerable<long> UserIds)
{
    public static explicit operator Group(Infrastructure.Group group) => new(group.Id, group.Name, group.TopicId, group.Users.Select(u => u.Id));
}
