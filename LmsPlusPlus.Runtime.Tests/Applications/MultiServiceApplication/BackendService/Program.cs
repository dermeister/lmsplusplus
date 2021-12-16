using System.Net;
using System.Net.Sockets;

TcpListener? server = null;
try
{
    server = new TcpListener(IPAddress.Any, port: 10_000);
    server.Start();
    using TcpClient client = server.AcceptTcpClient();
    var buffer = new byte[1 << 16];
    int readBytesCount = Console.OpenStandardInput().Read(buffer, offset: 0, buffer.Length);
    client.GetStream().Write(buffer, offset:0, readBytesCount);
}
finally
{
    server?.Stop();
}
