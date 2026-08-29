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
public class PositionController : ControllerBase
{
    private readonly IMongoDbContext _context;

    public PositionController(IMongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var positions = await _context.Positions
            .Find(_ => true)
            .SortBy(p => p.PositionName)
            .ToListAsync();

        return Ok(positions);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var position = await _context.Positions
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (position == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        return Ok(position);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PositionRequest request)
    {
        var position = new Position
        {
            PositionId = Guid.NewGuid().ToString(),
            PositionName = request.PositionName,
            Description = request.Description,
            IsActive = request.IsActive,
            IsApprover = request.IsApprover,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Positions.InsertOneAsync(position);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "PositionName", position.PositionName },
            { "Description", position.Description ?? "" },
            { "IsActive", position.IsActive },
            { "IsApprover", position.IsApprover }
        };

        var auditLog = new AuditLog
        {
            EntityType = "Position",
            EntityId = position.Id!,
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

        return Ok(position);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] PositionRequest request)
    {
        var position = await _context.Positions
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (position == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "PositionName", position.PositionName },
            { "Description", position.Description ?? "" },
            { "IsActive", position.IsActive },
            { "IsApprover", position.IsApprover }
        };

        var newValues = new Dictionary<string, object>
        {
            { "PositionName", request.PositionName },
            { "Description", request.Description ?? "" },
            { "IsActive", request.IsActive },
            { "IsApprover", request.IsApprover }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        var updateDefinition = Builders<Position>.Update
            .Set(p => p.PositionName, request.PositionName)
            .Set(p => p.Description, request.Description)
            .Set(p => p.IsActive, request.IsActive)
            .Set(p => p.IsApprover, request.IsApprover);

        await _context.Positions.UpdateOneAsync(
            p => p.Id == id,
            updateDefinition
        );

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Position",
            EntityId = position.Id!,
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

        var updatedPosition = await _context.Positions
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        return Ok(updatedPosition);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var position = await _context.Positions
            .Find(p => p.Id == id)
            .FirstOrDefaultAsync();

        if (position == null)
        {
            return NotFound(new { message = "Position not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "PositionName", position.PositionName },
            { "Description", position.Description ?? "" },
            { "IsActive", position.IsActive },
            { "IsApprover", position.IsApprover }
        };

        await _context.Positions.DeleteOneAsync(p => p.Id == id);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Position",
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

        return Ok(new { message = "Position deleted successfully" });
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "Position")
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

public class PositionRequest
{
    public string PositionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsApprover { get; set; } = false;
}
