namespace LmsPlusPlus.Api;

public class ProxyMiddleware
{
    readonly HttpClient _httpClient = new();
    readonly RequestDelegate _requestDelegate;

    public ProxyMiddleware(RequestDelegate requestDelegate) => _requestDelegate = requestDelegate;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/proxy"))
        {
            string host = context.Request.Headers["lmsplusplus-host"];
            var port = ushort.Parse(context.Request.Headers["lmsplusplus-port"]);
            HttpResponseMessage? responseMessage;
            string path = context.Request.Path.Value!["/proxy".Length..];
            Uri requestUri = new($"http://{host}:{port}{path}");
            HttpMethod method = new(context.Request.Method);
            try
            {
                responseMessage = await _httpClient.SendAsync(new HttpRequestMessage
                {
                    RequestUri = requestUri,
                    Method = method
                });
            }
            catch (HttpRequestException)
            {
                await Task.Delay(200);
                responseMessage = await _httpClient.SendAsync(new HttpRequestMessage
                {
                    RequestUri = requestUri,
                    Method = method
                });
            }
            await responseMessage.Content.CopyToAsync(context.Response.Body);
        }
        else
            await _requestDelegate(context);
    }
}
