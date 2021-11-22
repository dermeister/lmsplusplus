using Microsoft.AspNetCore.Mvc;

namespace LmsPlusPlus.Api;

[Route("demos")]
public class DemosController
{
    [HttpGet("")]
    public string GetAll() => "All demos";

    [HttpGet("{id:int}")]
    public string GetById(int id) => "Demo";
}
