using System.Net;
using System.Net.Sockets;
using System.Text;

TcpClient client = new();
ConnectToBackend(client);
byte[] buffer = new byte[1 << 16];
int receivedBytesCount = client.GetStream().Read(buffer, offset: 0, buffer.Length);
string response = Encoding.Default.GetString(buffer.AsSpan(start: 0, receivedBytesCount));
Console.Write(response);

void ConnectToBackend(TcpClient client)
{
    for (int i = 0; i < 10; i++)
        try
        {
            client.Connect("backend", 10_000);
            break;
        }
        catch (SocketException e)
        {
            if (i is 9)
                throw;
            Thread.Sleep(500);
        }
}
