namespace LmsPlusPlus.Api.Request;

public record CreateTopic(string Name, long AuthorId);

public record UpdateTopic(string Name);
