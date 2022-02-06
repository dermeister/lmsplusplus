namespace LmsPlusPlus.Api.RequestModels;

public record Permissions(bool CanCreateTask, bool CanUpdateTask, bool CanDeleteTask, bool CanUpdateVcsConfiguration, bool CanUpdateUser,
    bool CanCreateSolution, bool CanDeleteSolution);
