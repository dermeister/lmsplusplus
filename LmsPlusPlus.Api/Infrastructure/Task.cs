namespace LmsPlusPlus.Api.Infrastructure;

public record Task
{
    public long Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public long TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
    public ICollection<Technology> Technologies { get; set; } = null!;
}
