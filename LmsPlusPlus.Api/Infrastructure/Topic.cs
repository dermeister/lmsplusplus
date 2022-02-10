namespace LmsPlusPlus.Api.Infrastructure;

public record Topic
{
    public long Id { get; set; }
    public string Name { get; set; } = null!;
    public long AuthorId { get; set; }
    public User Author { get; set; } = null!;
}
