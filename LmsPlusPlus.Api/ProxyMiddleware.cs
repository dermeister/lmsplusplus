using System.Net;
using Microsoft.Extensions.Primitives;

namespace LmsPlusPlus.Api;

public class ServiceProxyMiddleware
{
    class MissingProxyRequestHeadersException : Exception
    {
        internal MissingProxyRequestHeadersException(string message) : base(message)
        {
        }
    }

    const int RequestRetryDelay = 200;

    readonly HttpClient _httpClient;
    readonly RequestDelegate _requestDelegate;

    public ServiceProxyMiddleware(RequestDelegate requestDelegate, HttpClient httpClient)
    {
        _requestDelegate = requestDelegate;
        _httpClient = httpClient;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/proxy", out PathString remainingPath))
        {
            using StreamReader requestBodyReader = new(context.Request.Body);
            string requestBody = await requestBodyReader.ReadToEndAsync();
            try
            {
                await RedirectRequest(context, remainingPath, requestBody);
            }
            catch (HttpRequestException)
            {
                await Task.Delay(RequestRetryDelay);
                await RedirectRequest(context, remainingPath, requestBody);
            }
        }
        else
            await _requestDelegate(context);
    }

    async Task RedirectRequest(HttpContext context, string targetPath, string body)
    {
        try
        {
            HttpResponseMessage responseMessage = await _httpClient.SendAsync(CreateHttpRequestMessage(context.Request, targetPath, body));
            context.Response.StatusCode = (int)responseMessage.StatusCode;
            foreach ((string key, IEnumerable<string> value) in responseMessage.Headers)
                context.Response.Headers.Add(key, value.ToArray());
            foreach ((string key, IEnumerable<string> value) in responseMessage.Content.Headers)
                context.Response.Headers.Add(key, value.ToArray());
            await responseMessage.Content.CopyToAsync(context.Response.Body);
        }
        catch (MissingProxyRequestHeadersException e)
        {
            context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
            context.Response.Headers.Add("Content-Type", "application/json");
            await context.Response.WriteAsync($"{{\"message\":\"{e.Message}\"}}");
        }
    }

    static HttpRequestMessage CreateHttpRequestMessage(HttpRequest request, string path, string body)
    {
        const string customHostHeader = "X-LmsPlusPlus-Host";
        const string customPortHeader = "X-LmsPlusPlus-Port";
        string schema = "http";
        if (!request.Headers.TryGetValue(customHostHeader, out StringValues host))
            throw new MissingProxyRequestHeadersException($"Header {customHostHeader} is not provided");
        if (!request.Headers.TryGetValue(customPortHeader, out StringValues port))
            throw new MissingProxyRequestHeadersException($"Header {customPortHeader} is not provided");
        string query = request.QueryString.Value ?? "";
        Uri requestUri = new($"{schema}://{host}:{port}{path}{query}");
        HttpMethod method = new(request.Method);
        HttpRequestMessage requestMessage = new(method, requestUri)
        {
            Content = new StringContent(body)
        };
        var requestMessageHeaders = from header in request.Headers
                                    where header.Key is not customHostHeader or customPortHeader
                                    select header;
        foreach ((string key, StringValues value) in requestMessageHeaders)
        {
            string[] values = value.ToArray();
            if (!requestMessage.Content.Headers.TryAddWithoutValidation(key, values))
                requestMessage.Headers.TryAddWithoutValidation(key, values);
        }
        return requestMessage;
    }
}


