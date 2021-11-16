using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("")]
public class Controller : ControllerBase
{
    [HttpGet("hello")]
    public string Get() => "Hello, world!";
}
