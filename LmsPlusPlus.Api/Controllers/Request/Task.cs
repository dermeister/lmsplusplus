namespace LmsPlusPlus.Api.Request;

public record CreateTask(string Title, string Description, long TopicId, IEnumerable<short> TechnologyIds);

public record UpdateTask(string Title, string Description, IEnumerable<short> TechnologyIds);
