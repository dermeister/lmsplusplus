namespace LmsPlusPlus.Api.Response;

public record Permissions(bool CanCreateTask, bool CanUpdateTask, bool CanDeleteTask, bool HasVcsAccounts, bool CanUpdateUser, bool CanCreateSolution,
    bool CanDeleteSolution, bool CanViewAllSolutions)
{
    public static explicit operator Permissions(Infrastructure.Permissions permissions) => new(permissions.CanCreateTask, permissions.CanUpdateTask,
        permissions.CanDeleteTask, permissions.HasVcsAccounts, permissions.CanUpdateUser, permissions.CanCreateSolution, permissions.CanDeleteSolution,
            permissions.CanViewAllSolutions);
}
