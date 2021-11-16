using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("permissions")]
public class PermissionsController
{
    [HttpGet("")]
    public string GetAll() => "All permissions";
}
