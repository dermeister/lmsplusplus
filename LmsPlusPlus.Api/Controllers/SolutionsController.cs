using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace LmsPlusPlus.Api;

[ApiController, Route("solutions")]
public class SolutionsController : ControllerBase
{
    readonly Infrastructure.ApplicationContext _context;

    public SolutionsController(Infrastructure.ApplicationContext context) => _context = context;

    [HttpGet, Authorize(Roles = "Author, Solver")]
    public async Task<IEnumerable<Response.Solution>> GetAll()
    {
        AuthorizationCredentials credentials = new(User);
        return credentials.UserRole switch
        {
            Infrastructure.Role.Author => await (from solution in _context.Solutions.Include(s => s.Repository)
                                                 join task in _context.Tasks on solution.TaskId equals task.Id
                                                 join topic in _context.Topics on task.TopicId equals topic.Id
                                                 where topic.Id == credentials.UserId
                                                 select (Response.Solution)solution).ToArrayAsync(),
            Infrastructure.Role.Solver => await (from solution in _context.Solutions.Include(s => s.Repository)
                                                 join user in _context.Users on solution.SolverId equals user.Id
                                                 where user.Id == credentials.UserId
                                                 select (Response.Solution)solution).ToArrayAsync(),
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    [HttpPost, Authorize(Roles = "Solver")]
    public async Task<ActionResult<Response.Solution>> Create(Request.CreateSolution requestSolution)
    {
        AuthorizationCredentials credentials = new(User);
        bool solverCanCreateSolutionForTask = await (from task in _context.Tasks
                                                     join topic in _context.Topics on task.TopicId equals topic.Id
                                                     join @group in _context.Groups.Include(g => g.Users) on topic.Id equals @group.TopicId
                                                     where task.Id == requestSolution.TaskId
                                                     select @group.Users.Select(u => u.Id).Contains(credentials.UserId)).SingleOrDefaultAsync();
        if (!solverCanCreateSolutionForTask)
            return Forbid();
        Infrastructure.VcsAccount? activeAccount = await (from a in _context.VcsAccounts
                                                          where a.UserId == credentials.UserId && a.IsActive
                                                          select a).SingleOrDefaultAsync();
        if (activeAccount is null)
            return Problem(detail: "Active account is not selected.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot create solution.");
        Infrastructure.TemplateRepository? databaseTemplateRepository = await (from t in _context.Technologies.Include(t => t.TemplateRepository)
                                                                               where t.Id == requestSolution.TechnologyId
                                                                               select t.TemplateRepository).SingleOrDefaultAsync();
        if (databaseTemplateRepository is null)
        {
            ModelState.AddModelError(nameof(requestSolution.TechnologyId), $"Technology with id {requestSolution.TechnologyId} does not exist.");
            return ValidationProblem();
        }
        Vcs.IHostingClient hostingClient = Vcs.HostingClientFactory.CreateClient(activeAccount.HostingProviderId);
        Vcs.Repository vcsTemplateRepository = new(databaseTemplateRepository.CloneUrl, websiteUrl: null, null, null);
        Vcs.Repository vcsCreatedRepository;
        try
        {
            vcsCreatedRepository = await hostingClient.CreateRepositoryFromTemplate(requestSolution.RepositoryName, activeAccount.AccessToken,
                vcsTemplateRepository);
        }
        catch (Vcs.RepositoryCreationException)
        {
            return Problem(detail: "Cannot create repository.", statusCode: StatusCodes.Status400BadRequest, title: "Cannot create solution.");
        }
        Infrastructure.Solution databaseSolution = new()
        {
            Repository = new Infrastructure.UserRepository
            {
                CloneUrl = vcsCreatedRepository.CloneUrl,
                WebsiteUrl = vcsCreatedRepository.WebsiteUrl,
                VcsAccountId = activeAccount.Id
            },
            SolverId = credentials.UserId,
            TaskId = requestSolution.TaskId,
        };
        _context.Add(databaseSolution);
        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException e) when (e.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.ForeignKeyViolation,
            ConstraintName: "fk_solutions_task_id"
        })
        {
            return Problem(detail: $"Task with id {requestSolution.TaskId} does not exist.", statusCode: StatusCodes.Status400BadRequest,
                title: "Cannot create solution.");
        }
        return (Response.Solution)databaseSolution;
    }

    [HttpDelete("{solutionId:long}"), Authorize(Roles = "Solver")]
    public async Task<IActionResult> Delete(long solutionId)
    {
        AuthorizationCredentials credentials = new(User);
        Infrastructure.Solution? solution = await _context.Solutions.FindAsync(solutionId);
        if (solution is not null)
        {
            if (solution.SolverId != credentials.UserId)
                return Forbid();
            _context.Remove(solution);
            await _context.SaveChangesAsync();
        }
        return Ok();
    }
}
