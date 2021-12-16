using System;
using System.Net;
using System.Net.Sockets;
using System.Text;

TcpListener server = null;
try
{
    server = new TcpListener(IPAddress.Any, port: 10_000);
    server.Start();
    using TcpClient client = server.AcceptTcpClient();
    var buffer = new byte[1 << 16];
    int readBytesCount = Console.OpenStandardInput().Read(buffer, 0, buffer.Length);
    client.GetStream().Write(buffer, 0, readBytesCount);
}
finally
{
    server?.Stop();
}
