using Microsoft.Extensions.Primitives;

namespace LmsPlusPlus.Api;

public class ProxyMiddleware
{
    readonly HttpClient _httpClient;
    readonly RequestDelegate _requestDelegate;

    public ProxyMiddleware(RequestDelegate requestDelegate, HttpClient httpClient)
    {
        _requestDelegate = requestDelegate;
        _httpClient = httpClient;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/proxy"))
        {
            HttpResponseMessage? responseMessage;
            StreamReader sr = new(context.Request.Body);
            string body = await sr.ReadToEndAsync();
            try
            {
                responseMessage = await _httpClient.SendAsync(CreateHttpRequestMessage(context.Request, body));
            }
            catch (HttpRequestException)
            {
                await Task.Delay(200);
                responseMessage = await _httpClient.SendAsync(CreateHttpRequestMessage(context.Request, body));
            }
            context.Response.StatusCode = (int)responseMessage.StatusCode;
            foreach ((string key, IEnumerable<string> value) in responseMessage.Headers)
                context.Response.Headers.Add(key, value.ToArray());
            foreach ((string key, IEnumerable<string> value) in responseMessage.Content.Headers)
                context.Response.Headers.Add(key, value.ToArray());
            await responseMessage.Content.CopyToAsync(context.Response.Body);
        }
        else
            await _requestDelegate(context);
    }

    static HttpRequestMessage CreateHttpRequestMessage(HttpRequest request, string body)
    {
        string host = request.Headers["lmsplusplus-host"];
        var port = ushort.Parse(request.Headers["lmsplusplus-port"]);
        string path = request.Path.Value!["/proxy".Length..];
        string query = request.QueryString.Value ?? "";
        Uri requestUri = new($"http://{host}:{port}{path}{query}");
        HttpMethod method = new(request.Method);
        StringContent content = new(body);
        HttpRequestMessage requestMessage = new()
        {
            RequestUri = requestUri,
            Method = method,
            Content = content
        };
        foreach ((string key, StringValues value) in request.Headers.Where(h => !h.Key.StartsWith("lmsplusplus")))
        {
            string[] values = value.ToArray();
            if (!requestMessage.Content.Headers.TryAddWithoutValidation(key, values))
                requestMessage.Headers.TryAddWithoutValidation(key, values);
        }
        return requestMessage;
    }
}
