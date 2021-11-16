using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("courses")]
public class CoursesController
{
    [HttpGet("")]
    public string GetAll() => "All courses";
}
