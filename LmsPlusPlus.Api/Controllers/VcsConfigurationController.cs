using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("vcs-configuration")]
public class VcsConfigurationController : ControllerBase
{
    [HttpGet("")]
    public string Get() => "Vcs configuration";

    [HttpPatch("")]
    public IActionResult Update() => Ok();
}
