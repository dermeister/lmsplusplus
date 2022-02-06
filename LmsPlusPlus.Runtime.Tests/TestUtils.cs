using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading.Tasks;

namespace LmsPlusPlus.Runtime.Tests;

static class TestUtils
{
    internal static async Task<string?> ReadAllServiceOutput(Application application, string serviceName)
    {
        StringBuilder result = new();
        string? output;
        do
        {
            output = await application.ReadServiceOutputAsync(serviceName);
            result.Append(output);
        }
        while (output != null);
        return result.ToString();
    }

    internal static async Task<string?> ReadAllServiceOutput(Service service)
    {
        StringBuilder result = new();
        string? output;
        do
        {
            output = await service.ReadOutputAsync();
            result.Append(output);
        }
        while (output != null);
        return result.ToString();
    }

    internal static TcpClient ConnectToTcpSocket(ushort port)
    {
        TcpClient client = new();
        client.Connect(IPAddress.Loopback, port);
        return client;
    }

    internal static void WriteToTcpClient(TcpClient client, string message)
    {
        byte[] buffer = Encoding.Default.GetBytes(message);
        client.GetStream().Write(buffer, offset: 0, buffer.Length);
    }

    internal static string ReadFromTcpClient(TcpClient client)
    {
        var buffer = new byte[1 << 16];
        int receivedBytesCount = client.GetStream().Read(buffer, offset: 0, buffer.Length);
        return Encoding.Default.GetString(buffer.AsSpan(start: 0, receivedBytesCount));
    }
}
