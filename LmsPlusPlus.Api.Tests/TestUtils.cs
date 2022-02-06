using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace LmsPlusPlus.Api.Tests;

static class TestUtils
{
    internal static HttpRequestMessage CreateHttpRequestMessage(string url, HttpMethod method, object? body = null)
    {
        HttpRequestMessage message = new(method, url);
        if (body is not null)
            message.Content = new StringContent(SerializeBody(body), Encoding.UTF8, mediaType: "application/json");
        return message;
    }

    static string SerializeBody(object body)
    {
        return JsonSerializer.Serialize(body, new JsonSerializerOptions
        {
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
    }
}
