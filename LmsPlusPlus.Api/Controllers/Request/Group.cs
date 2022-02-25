namespace LmsPlusPlus.Api.Request;

public record CreateGroup(string Name, long TopicId);

public record UpdateGroup(string Name);
