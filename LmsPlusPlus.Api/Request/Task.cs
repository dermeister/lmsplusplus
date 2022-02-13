namespace LmsPlusPlus.Api.Request;

public record Task(string Title, string Description, long TopicId, IEnumerable<short> TechnologyIds);
