using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace LmsPlusPlus.Runtime.Tests;

public class ServiceTests
{
    readonly ITestOutputHelper _testOutputHelper;

    public ServiceTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
    }

    [Fact]
    public async Task Test()
    {
        // Arrange
        Service service = new(new ServiceConfiguration(contextPath: "", tcpPorts: null, stdin: false));

        // Act
        ServiceOutput? output1 = await service.ReadAsync();
        ServiceOutput? output2 = await service.ReadAsync();
        await service.DisposeAsync();

        // Assert
        Assert.NotNull(output1);
        _testOutputHelper.WriteLine(output1!.Content);
        Assert.Equal(ServiceOutputStage.Run, output1.Stage);
        Assert.NotEmpty(output1.Content);
        Assert.Null(output2);
    }
}
