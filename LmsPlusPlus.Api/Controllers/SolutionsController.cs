using LmsPlusPlus.Api.Vcs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LmsPlusPlus.Api;

[ApiController]
[Route("solutions")]
public class SolutionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly VcsHostingClientFactory _vcsHostingClientFactory;

    public SolutionsController(Infrastructure.ApplicationContext context, VcsHostingClientFactory vcsHostingClientFactory)
    {
        _context = context;
        _vcsHostingClientFactory = vcsHostingClientFactory;
    }

    [HttpGet]
    public async Task<IEnumerable<Response.Solution>> GetAll()
    {
        return await _context.Solutions.Include(s => s.Repository).Select(s => (Response.Solution)s).ToArrayAsync();
    }

    [HttpPost]
    public async Task<Response.Solution> Create(Request.Solution requestSolution)
    {
        Infrastructure.VcsAccount account = await _context.VcsAccounts.FirstAsync(a => a.Name == "dermeister");
        Infrastructure.Repository templateRepository = await _context.Technologies
            .Include(t => t.TemplateRepository.VcsAccount)
            .Where(t => t.Id == requestSolution.TechnologyId)
            .Select(t => t.TemplateRepository)
            .SingleAsync();
        IVcsHostingClient client = _vcsHostingClientFactory.CreateClient(templateRepository.VcsAccount.HostingProviderId,
            account.AccessToken);
        Uri repositoryUri = await client.CreateRepositoryFromTemplate(requestSolution.RepositoryName, new Uri(templateRepository.Url));
        Infrastructure.Solution databaseSolution = new()
        {
            Repository = new Infrastructure.Repository
            {
                Url = repositoryUri.ToString(),
                VcsAccountId = account.Id
            },
            SolverId = 1,
            TaskId = requestSolution.TaskId,
            TechnologyId = requestSolution.TechnologyId
        };
        _context.Add(databaseSolution);
        await _context.SaveChangesAsync();
        return (Response.Solution)databaseSolution;
    }

    [HttpDelete("{id:long}")]
    public async Task Delete(long id)
    {
        Infrastructure.Solution? solution = await _context.Solutions.FindAsync(id);
        if (solution is not null)
        {
            _context.Remove(solution);
            await _context.SaveChangesAsync();
        }
    }
}
