using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("preferences")]
public class PreferencesController : ControllerBase
{
    [HttpGet("")]
    public string Get() => "Preferences";

    [HttpPatch("")]
    public IActionResult Update() => Ok();
}
