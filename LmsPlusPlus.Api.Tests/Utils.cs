using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace LmsPlusPlus.Api.Tests;

static class Utils
{
    static readonly JsonSerializerOptions s_jsonSerializerOptions = new()
    {
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    internal static HttpRequestMessage CreateHttpRequestMessage(string url, HttpMethod method, string? jwt, object? body = null)
    {
        HttpRequestMessage message = new(method, url);
        if (jwt is not null)
            message.Headers.Authorization = new AuthenticationHeaderValue(scheme: "Bearer", jwt);
        if (body is not null)
            message.Content = new StringContent(SerializeBody(body), Encoding.UTF8, mediaType: "application/json");
        return message;
    }

    internal static async Task<T> ReadHttpResponse<T>(HttpResponseMessage message)
    {
        message.EnsureSuccessStatusCode();
        string content = await message.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, s_jsonSerializerOptions)!;
    }

    static string SerializeBody(object body) =>
        JsonSerializer.Serialize(body, s_jsonSerializerOptions);
}
