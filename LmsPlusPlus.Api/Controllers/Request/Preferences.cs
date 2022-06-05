using System.ComponentModel.DataAnnotations;

namespace LmsPlusPlus.Api.Request;

public record Preferences
{
    [MinLength(1), MaxLength(200)]
    public string Theme { get; }

    public Preferences(string theme) => Theme = theme;
}
