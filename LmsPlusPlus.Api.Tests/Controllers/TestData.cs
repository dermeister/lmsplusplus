using System.Threading.Tasks;

namespace LmsPlusPlus.Api.Tests;

class TestData
{
    internal const string SolverPassword = "solver";
    internal Infrastructure.User Author { get; set; } = null!;
    internal Infrastructure.User AuthorWithoutTopics { get; set; } = null!;
    internal Infrastructure.User Solver { get; set; } = null!;
    internal Infrastructure.User SolverWithoutAccounts { get; set; } = null!;
    internal Infrastructure.User Admin { get; set; } = null!;
    internal Infrastructure.Topic Topic { get; set; } = null!;
    internal Infrastructure.Group Group { get; set; } = null!;
    internal Infrastructure.VcsAccount Account { get; set; } = null!;
    internal Infrastructure.TemplateRepository TemplateRepository { get; set; } = null!;
    internal Infrastructure.Technology Technology { get; set; } = null!;
    internal Infrastructure.Task Task { get; set; } = null!;

    TestData()
    {
    }

    internal static async Task<TestData> Create(Infrastructure.ApplicationContext context)
    {
        Infrastructure.User author = new()
        {
            Login = "author",
            PasswordHash = "author",
            FirstName = "Author",
            LastName = "Author",
            Role = Infrastructure.Role.Author
        };
        Infrastructure.User authorWithoutTopics = new()
        {
            Login = "author-without-topics",
            PasswordHash = "author-without-topics",
            FirstName = "Author without topics",
            LastName = "Author without topics",
            Role = Infrastructure.Role.Author
        };
        Infrastructure.User solver = new()
        {
            Login = "solver",
            PasswordHash = "solver",
            FirstName = "Solver",
            LastName = "Solver",
            Role = Infrastructure.Role.Solver
        };
        Infrastructure.User solverWithoutAccounts = new()
        {
            Login = "solver-without-accounts",
            PasswordHash = "solver-without-accounts",
            FirstName = "Solver without accounts",
            LastName = "Solver without accounts",
            Role = Infrastructure.Role.Solver
        };
        Infrastructure.User admin = new()
        {
            Login = "admin",
            PasswordHash = "admin",
            FirstName = "Admin",
            LastName = "Admin",
            Role = Infrastructure.Role.Admin
        };
        context.AddRange(author, authorWithoutTopics, solver, solverWithoutAccounts, admin);
        await context.SaveChangesAsync();
        Infrastructure.Topic topic = new()
        {
            Author = author,
            Name = "Topic"
        };
        Infrastructure.Group group = new()
        {
            Topic = topic,
            Name = "Group",
            Users = new[] { solver }
        };
        Infrastructure.VcsHostingProvider vcsHostingProvider = new()
        {
            Id = "provider",
            Name = "Provider"
        };
        Infrastructure.VcsAccount account = new()
        {
            Name = "account",
            AccessToken = "token",
            HostingProvider = vcsHostingProvider,
            UserId = solver.Id
        };
        Infrastructure.VcsAccount templateAccount = new()
        {
            Name = "template-account",
            AccessToken = "token",
            HostingProvider = vcsHostingProvider,
            UserId = admin.Id
        };
        Infrastructure.TemplateRepository templateRepository = new()
        {
            CloneUrl = "Url",
        };
        Infrastructure.Technology technology = new()
        {
            Name = "Technology",
            TemplateRepository = templateRepository
        };
        Infrastructure.Task task = new()
        {
            Title = "Task",
            Description = "Task",
            Topic = topic,
            Technologies = new[] { technology }
        };
        context.AddRange(topic, group, vcsHostingProvider, account, templateAccount, templateRepository, technology, task);
        await context.SaveChangesAsync();
        return new TestData
        {
            Author = author,
            AuthorWithoutTopics = authorWithoutTopics,
            Solver = solver,
            SolverWithoutAccounts = solverWithoutAccounts,
            Admin = admin,
            Topic = topic,
            Group = group,
            Account = account,
            TemplateRepository = templateRepository,
            Technology = technology,
            Task = task
        };
    }
}
