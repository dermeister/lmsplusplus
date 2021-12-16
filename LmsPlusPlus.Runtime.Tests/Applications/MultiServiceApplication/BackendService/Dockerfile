FROM mcr.microsoft.com/dotnet/sdk:6.0-alpine

WORKDIR /usr/SocketService

COPY BackendService.csproj .
COPY Program.cs .

RUN dotnet build -c Release

CMD dotnet bin/Release/net6.0/BackendService.dll
