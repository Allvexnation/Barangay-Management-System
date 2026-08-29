using Microsoft.AspNetCore.Mvc;
using backend.Repositories.Interfaces;
using backend.Models;
using MongoDB.Driver;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuditController : ControllerBase
{
    private readonly IMongoDbContext _context;

    public AuditController(IMongoDbContext context)
    {
        _context = context;
    }

    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentAuditLogs([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        try
        {
            var count = await _context.AuditLogs.CountDocumentsAsync(_ => true);
            var logs = await _context.AuditLogs
                .Find(_ => true)
                .SortByDescending(log => log.Timestamp)
                .Skip((page - 1) * pageSize)
                .Limit(pageSize)
                .ToListAsync();

            return Ok(new { logs, totalCount = count, page, pageSize });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching audit logs", error = ex.Message });
        }
    }

    [HttpGet("entity/{entityType}")]
    public async Task<IActionResult> GetAuditLogsByEntityType(string entityType, [FromQuery] int limit = 50)
    {
        try
        {
            var logs = await _context.AuditLogs
                .Find(log => log.EntityType == entityType)
                .SortByDescending(log => log.Timestamp)
                .Limit(limit)
                .ToListAsync();

            return Ok(logs);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Error fetching audit logs", error = ex.Message });
        }
    }
}
