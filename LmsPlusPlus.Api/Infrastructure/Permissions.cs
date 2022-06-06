namespace LmsPlusPlus.Api.Infrastructure;

public record Permissions
{
    public Role Role { get; set; }
    public bool CanCreateTask { get; set; }
    public bool CanUpdateTask { get; set; }
    public bool CanDeleteTask { get; set; }
    public bool HasVcsAccounts { get; set; }
    public bool CanUpdateUser { get; set; }
    public bool CanCreateSolution { get; set; }
    public bool CanDeleteSolution { get; set; }
    public bool CanViewAllSolutions { get; set; }
}
