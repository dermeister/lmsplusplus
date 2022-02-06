namespace LmsPlusPlus.Api.DatabaseModels;

public record Permissions
{
    public Role Role { get; set; }
    public bool CanCreateTask { get; set; }
    public bool CanUpdateTask { get; set; }
    public bool CanDeleteTask { get; set; }
    public bool CanUpdateVcsConfiguration { get; set; }
    public bool CanUpdateUser { get; set; }
    public bool CanCreateSolution { get; set; }
    public bool CanDeleteSolution { get; set; }
}
