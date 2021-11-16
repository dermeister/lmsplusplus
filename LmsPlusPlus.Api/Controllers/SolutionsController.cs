using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("solutions")]
public class SolutionsController : ControllerBase
{
    [HttpGet("")]
    public string GetAll() => "All solutions";

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id) => Ok();
}
