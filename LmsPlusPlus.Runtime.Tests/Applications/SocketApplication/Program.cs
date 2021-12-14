using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

TcpListener server = null;
try
{
    server = new TcpListener(IPAddress.Any, port: 10_000);
    server.Start();
    using TcpClient client =  server.AcceptTcpClient();
    NetworkStream clientStream = client.GetStream();
    var buffer = new byte[1 << 16];
    int received = clientStream.Read(buffer, 0, buffer.Length);
    clientStream.Write(buffer, 0, received);
}
finally
{
    server?.Stop();
}
