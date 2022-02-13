namespace LmsPlusPlus.Api.Infrastructure;

public record Technology
{
    public short Id { get; init; }
    public string Name { get; init; } = null!;
    public Repository TemplateRepository { get; init; } = null!;
    public List<Task> Tasks { get; set; } = null!;
}
