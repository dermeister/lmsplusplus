using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("tasks")]
public class TasksController : ControllerBase
{
    [HttpGet("")]
    public string GetAll() => "All tasks";

    [HttpPatch("{id:int}")]
    public IActionResult Update(int id) => Ok();

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id) => Ok();
}
