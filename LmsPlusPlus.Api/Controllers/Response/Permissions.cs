namespace LmsPlusPlus.Api.Response;

public record Permissions(bool CanCreateTask, bool CanUpdateTask, bool CanDeleteTask, bool CanUpdateVcsConfiguration, bool CanUpdateUser,
    bool CanCreateSolution, bool CanDeleteSolution)
{
    public static explicit operator Permissions(Infrastructure.Permissions permissions) =>
        new(permissions.CanCreateTask, permissions.CanUpdateTask, permissions.CanDeleteTask,
            permissions.CanUpdateVcsConfiguration, permissions.CanUpdateUser, permissions.CanCreateSolution, permissions.CanDeleteSolution);
}
