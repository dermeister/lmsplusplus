namespace LmsPlusPlus.Api.Infrastructure;

public record Technology
{
    public short Id { get; set; }
    public string Name { get; set; } = null!;
    public long TemplateRepositoryId { get; set; }
    public TemplateRepository TemplateRepository { get; set; } = null!;
    public ICollection<Task> Tasks { get; set; } = null!;
}
