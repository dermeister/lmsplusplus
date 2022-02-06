namespace LmsPlusPlus.Api.DatabaseModels;

public record Group
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public long TopicId { get; set; }
    public Topic Topic { get; set; } = null!;
}
