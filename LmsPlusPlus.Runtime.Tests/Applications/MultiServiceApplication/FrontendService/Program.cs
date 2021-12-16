using System;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Threading;

TcpClient client = new();
Thread.Sleep(1000);
client.Connect("backend", 10_000);
byte[] buffer = new byte[1 << 16];
int receivedBytesCount = client.GetStream().Read(buffer, offset: 0, buffer.Length);
string response = Encoding.Default.GetString(buffer.AsSpan(start: 0, receivedBytesCount));
Console.Write(response);
