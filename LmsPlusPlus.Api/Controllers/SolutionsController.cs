using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api;

[ApiController, Route("solutions")]
public class SolutionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;
    readonly Vcs.HostingClientFactory _hostingClientFactory;

    public SolutionsController(Infrastructure.ApplicationContext context, Vcs.HostingClientFactory hostingClientFactory)
    {
        _context = context;
        _hostingClientFactory = hostingClientFactory;
    }

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Solution>> GetAll()
    {
        Infrastructure.Role userRole = Utils.GetUserRoleFromClaims(User);
        long userId = Utils.GetUserIdFromClaims(User);
        return userRole switch
        {
            Infrastructure.Role.Author => await (from s in _context.Solutions
                                                 join ts in _context.Tasks on s.TaskId equals ts.Id
                                                 join tp in _context.Topics on ts.TopicId equals tp.Id
                                                 where tp.Id == userId
                                                 select (Response.Solution)s).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from s in _context.Solutions
                                                 join u in _context.Users on s.SolverId equals u.Id
                                                 where u.Id == userId
                                                 select (Response.Solution)s).ToArrayAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Solver")]
    public async Task<ActionResult<Response.Solution>> Create(Request.Solution requestSolution)
    {
        long solverId = Utils.GetUserIdFromClaims(User);
        bool solverCanViewTask = await (from ts in _context.Tasks
                                        join tp in _context.Topics on ts.TopicId equals tp.Id
                                        join g in _context.Groups.Include(g => g.Users) on tp.Id equals g.TopicId
                                        where ts.Id == requestSolution.TaskId
                                        select g.Users.Select(u => u.Id).Contains(solverId)).SingleOrDefaultAsync();
        if (!solverCanViewTask)
            return Forbid();
        Infrastructure.VcsAccount account = await _context.VcsAccounts.FirstAsync(a => a.UserId == solverId);
        Infrastructure.Repository templateRepository = await _context.Technologies
            .Include(t => t.TemplateRepository.VcsAccount)
            .Where(t => t.Id == requestSolution.TechnologyId)
            .Select(t => t.TemplateRepository)
            .SingleAsync();
        Vcs.IHostingClient client = _hostingClientFactory.CreateClient(templateRepository.VcsAccount.HostingProviderId,
            account.AccessToken);
        Vcs.Repository repository =
            await client.CreateRepositoryFromTemplate(requestSolution.RepositoryName, new Uri(templateRepository.CloneUrl));
        Infrastructure.Solution databaseSolution = new()
        {
            Repository = new Infrastructure.Repository
            {
                CloneUrl = repository.CloneUrl.ToString(),
                WebsiteUrl = repository.WebsiteUrl.ToString(),
                VcsAccountId = account.Id
            },
            SolverId = solverId,
            TaskId = requestSolution.TaskId,
            TechnologyId = requestSolution.TechnologyId
        };
        _context.Add(databaseSolution);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException postgresException)
        {
            switch (postgresException)
            {
                case { SqlState: PostgresErrorCodes.ForeignKeyViolation, ConstraintName: "solutions_task_id_fkey" }:
                    ModelState.AddModelError(key: "TaskId", $"Task with id {requestSolution.TaskId} does not exist.");
                    return ValidationProblem();
                case { SqlState: PostgresErrorCodes.ForeignKeyViolation, ConstraintName: "solutions_technology_id_fkey" }:
                    ModelState.AddModelError(key: "TechnologyId", $"Technology with id {requestSolution.TechnologyId} does not exist.");
                    return ValidationProblem();
                default:
                    throw;
            }
        }
        return (Response.Solution)databaseSolution;
    }

    [HttpDelete("{solutionId:long}"), Authorize(Roles = "Solver")]
    public async Task<IActionResult> Delete(long solutionId)
    {
        long userId = Utils.GetUserIdFromClaims(User);
        Infrastructure.Solution? solution = await _context.Solutions.FindAsync(solutionId);
        if (solution is not null)
        {
            if (solution.SolverId != userId)
                return Unauthorized();
            _context.Remove(solution);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
