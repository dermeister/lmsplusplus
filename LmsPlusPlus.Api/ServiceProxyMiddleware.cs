using System.Diagnostics;
using System.Net;
using Microsoft.Extensions.Primitives;
using Yarp.ReverseProxy.Forwarder;

namespace LmsPlusPlus.Api;

public class ServiceProxyMiddleware
{
    readonly RequestDelegate _requestDelegate;
    readonly IHttpForwarder _forwarder;

    public ServiceProxyMiddleware(RequestDelegate requestDelegate, IHttpForwarder forwarder)
    {
        _requestDelegate = requestDelegate;
        _forwarder = forwarder;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.Path.StartsWithSegments("/proxy", out PathString remainingPath))
        {
            HttpMessageInvoker httpClient = new(new SocketsHttpHandler()
            {
                UseProxy = false,
                AllowAutoRedirect = false,
                AutomaticDecompression = DecompressionMethods.None,
                UseCookies = false,
                ActivityHeadersPropagator = new ReverseProxyPropagator(DistributedContextPropagator.Current)
            });
            RequestTransformer transformer = new();
            ForwarderRequestConfig requestConfig = new() { ActivityTimeout = TimeSpan.FromSeconds(100) };
            const string customHostHeader = "X-LmsPlusPlus-Host";
            const string customPortHeader = "X-LmsPlusPlus-Port";
            string schema = "http";
            if (!context.Request.Headers.TryGetValue(customHostHeader, out StringValues host))
                throw new ProxyException($"Header {customHostHeader} is not provided.");
            if (!context.Request.Headers.TryGetValue(customPortHeader, out StringValues port))
                throw new ProxyException($"Header {customPortHeader} is not provided.");
            string requestUri = $"{schema}://{host}:{port}";
            await _forwarder.SendAsync(context, requestUri, httpClient, requestConfig, transformer);
        }
        else
            await _requestDelegate(context);
    }
}

class RequestTransformer : HttpTransformer
{
    public override async ValueTask TransformRequestAsync(HttpContext httpContext, HttpRequestMessage proxyRequest, string destinationPrefix)
    {
        proxyRequest.Headers.Remove("X-LmsPlusPlus-Host");
        proxyRequest.Headers.Remove("X-LmsPlusPlus-Port");
        if (!httpContext.Request.Path.StartsWithSegments("/proxy", out PathString remainingPath))
            throw new ProxyException("Proxied request path must start with /proxy.");
        proxyRequest.RequestUri = RequestUtilities.MakeDestinationAddress(destinationPrefix, remainingPath, httpContext.Request.QueryString);
        await base.TransformRequestAsync(httpContext, proxyRequest, destinationPrefix);
    }
}

class ProxyException : Exception
{
    internal ProxyException(string message) : base(message)
    {
    }
}
