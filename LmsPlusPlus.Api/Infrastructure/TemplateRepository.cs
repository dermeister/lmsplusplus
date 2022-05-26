namespace LmsPlusPlus.Api.Infrastructure;

public record TemplateRepository
{
    public long Id { get; set; }
    public string CloneUrl { get; set; } = null!;
}
