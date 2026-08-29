using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Helpers;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PurokController : ControllerBase
{
    private readonly IMongoDbContext _context;

    public PurokController(IMongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var puroks = await _context.Puroks
            .Find(p => p.IsActive)
            .SortBy(p => p.PurokId)
            .ToListAsync();

        return Ok(puroks);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var purok = await _context.Puroks
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (purok == null)
        {
            return NotFound(new { message = "Purok not found" });
        }

        return Ok(purok);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PurokRequest request)
    {
        var purok = new Purok
        {
            PurokId = Guid.NewGuid().ToString(),
            PurokName = request.PurokName,
            Description = request.Description,
            IsActive = request.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Puroks.InsertOneAsync(purok);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "PurokName", purok.PurokName },
            { "Description", purok.Description ?? "" },
            { "IsActive", purok.IsActive }
        };

        var auditLog = new AuditLog
        {
            EntityType = "Purok",
            EntityId = purok.Id!,
            Action = "Create",
            AdminId = adminInfo.AdminId,
            AdminName = adminInfo.AdminName,
            AdminEmail = adminInfo.AdminEmail,
            AdminRole = adminInfo.AdminRole,
            NewValues = newValues,
            Timestamp = DateTime.UtcNow,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
        };

        await _context.AuditLogs.InsertOneAsync(auditLog);

        return Ok(purok);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] PurokRequest request)
    {
        var purok = await _context.Puroks
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (purok == null)
        {
            return NotFound(new { message = "Purok not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "PurokName", purok.PurokName },
            { "Description", purok.Description ?? "" },
            { "IsActive", purok.IsActive }
        };

        var newValues = new Dictionary<string, object>
        {
            { "PurokName", request.PurokName },
            { "Description", request.Description ?? "" },
            { "IsActive", request.IsActive }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        var updateDefinition = Builders<Purok>.Update
            .Set(p => p.PurokName, request.PurokName)
            .Set(p => p.Description, request.Description)
            .Set(p => p.IsActive, request.IsActive);

        await _context.Puroks.UpdateOneAsync(
            p => p.Id == id,
            updateDefinition
        );

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Purok",
            EntityId = purok.Id!,
            Action = "Update",
            AdminId = adminInfo.AdminId,
            AdminName = adminInfo.AdminName,
            AdminEmail = adminInfo.AdminEmail,
            AdminRole = adminInfo.AdminRole,
            Changes = changes,
            PreviousValues = previousValues,
            NewValues = newValues,
            Timestamp = DateTime.UtcNow,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
        };

        await _context.AuditLogs.InsertOneAsync(auditLog);

        var updatedPurok = await _context.Puroks
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        return Ok(updatedPurok);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var purok = await _context.Puroks
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (purok == null)
        {
            return NotFound(new { message = "Purok not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "PurokName", purok.PurokName },
            { "Description", purok.Description ?? "" },
            { "IsActive", purok.IsActive }
        };

        await _context.Puroks.DeleteOneAsync(p => p.Id == id);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Purok",
            EntityId = id,
            Action = "Delete",
            AdminId = adminInfo.AdminId,
            AdminName = adminInfo.AdminName,
            AdminEmail = adminInfo.AdminEmail,
            AdminRole = adminInfo.AdminRole,
            PreviousValues = previousValues,
            Timestamp = DateTime.UtcNow,
            IpAddress = HttpContext.Connection.RemoteIpAddress?.ToString(),
            UserAgent = HttpContext.Request.Headers["User-Agent"].ToString()
        };

        await _context.AuditLogs.InsertOneAsync(auditLog);

        return Ok(new { message = "Purok deleted successfully" });
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "Purok")
            .SortByDescending(log => log.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }

    private (string AdminId, string AdminName, string AdminEmail, string AdminRole) GetAdminInfo()
    {
        var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value ?? "unknown";
        var adminEmail = User.FindFirst(ClaimTypes.Email)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Email)?.Value ?? User.Identity?.Name ?? "unknown@example.com";
        var adminRole = User.FindFirst(ClaimTypes.Role)?.Value ?? "Staff";
        
        var adminName = adminEmail;
        
        return (adminId, adminName, adminEmail, adminRole);
    }
}

public class PurokRequest
{
    public string PurokName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}
