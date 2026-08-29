using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Models.DTOs;
using backend.Helpers;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ComplaintsController : ControllerBase
{
    private readonly IMongoDbContext _context;

    public ComplaintsController(IMongoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var complaints = await _context.Complaints
            .Find(_ => true)
            .SortBy(c => c.DateCreated)
            .ToListAsync();

        var response = complaints.Select(c => new ComplaintResponse
        {
            Id = c.Id!,
            ComplaintId = c.ComplaintId ?? c.Id!,
            ComplainantName = c.ComplainantName,
            Appellant = c.Appellant,
            Description = c.Description,
            Status = c.Status,
            DateCreated = c.DateCreated
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        Complaint? complaint = null;
        
        if (MongoHelper.IsValidObjectId(id))
        {
            complaint = await _context.Complaints
                .Find(c => c.Id == id)
                .FirstOrDefaultAsync();
        }
        
        if (complaint == null)
        {
            complaint = await _context.Complaints
                .Find(c => c.ComplaintId == id)
                .FirstOrDefaultAsync();
        }

        if (complaint == null)
        {
            return NotFound(new { message = "Complaint not found" });
        }

        var response = new ComplaintResponse
        {
            Id = complaint.Id!,
            ComplaintId = complaint.ComplaintId ?? complaint.Id!,
            ComplainantName = complaint.ComplainantName,
            Appellant = complaint.Appellant,
            Description = complaint.Description,
            Status = complaint.Status,
            DateCreated = complaint.DateCreated
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ComplaintRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var complaint = new Complaint
        {
            ComplaintId = Guid.NewGuid().ToString(),
            ComplainantName = request.ComplainantName,
            Appellant = request.Appellant,
            Description = request.Description,
            Status = request.Status,
            DateCreated = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Complaints.InsertOneAsync(complaint);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "ComplainantName", complaint.ComplainantName },
            { "Appellant", complaint.Appellant },
            { "Description", complaint.Description },
            { "Status", complaint.Status }
        };

        var auditLog = new AuditLog
        {
            EntityType = "Complaint",
            EntityId = complaint.ComplaintId ?? complaint.Id!,
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

        var response = new ComplaintResponse
        {
            Id = complaint.Id!,
            ComplaintId = complaint.ComplaintId!,
            ComplainantName = complaint.ComplainantName,
            Appellant = complaint.Appellant,
            Description = complaint.Description,
            Status = complaint.Status,
            DateCreated = complaint.DateCreated
        };

        return CreatedAtAction(nameof(GetById), new { id = complaint.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ComplaintRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        Complaint? complaint = null;
        
        if (MongoHelper.IsValidObjectId(id))
        {
            complaint = await _context.Complaints
                .Find(c => c.Id == id)
                .FirstOrDefaultAsync();
        }
        
        if (complaint == null)
        {
            complaint = await _context.Complaints
                .Find(c => c.ComplaintId == id)
                .FirstOrDefaultAsync();
        }

        if (complaint == null)
        {
            return NotFound(new { message = "Complaint not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "ComplainantName", complaint.ComplainantName },
            { "Appellant", complaint.Appellant },
            { "Description", complaint.Description },
            { "Status", complaint.Status }
        };

        var newValues = new Dictionary<string, object>
        {
            { "ComplainantName", request.ComplainantName },
            { "Appellant", request.Appellant },
            { "Description", request.Description },
            { "Status", request.Status }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        complaint.ComplainantName = request.ComplainantName;
        complaint.Appellant = request.Appellant;
        complaint.Description = request.Description;
        complaint.Status = request.Status;
        complaint.UpdatedAt = DateTime.UtcNow;

        var updateDefinition = Builders<Complaint>.Update
            .Set(c => c.ComplainantName, complaint.ComplainantName)
            .Set(c => c.Appellant, complaint.Appellant)
            .Set(c => c.Description, complaint.Description)
            .Set(c => c.Status, complaint.Status)
            .Set(c => c.UpdatedAt, complaint.UpdatedAt);

        await _context.Complaints.UpdateOneAsync(c => c.Id == complaint.Id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Complaint",
            EntityId = complaint.ComplaintId ?? complaint.Id!,
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

        var response = new ComplaintResponse
        {
            Id = complaint.Id!,
            ComplaintId = complaint.ComplaintId ?? complaint.Id!,
            ComplainantName = complaint.ComplainantName,
            Appellant = complaint.Appellant,
            Description = complaint.Description,
            Status = complaint.Status,
            DateCreated = complaint.DateCreated
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        Complaint? complaint = null;
        
        if (MongoHelper.IsValidObjectId(id))
        {
            complaint = await _context.Complaints
                .Find(c => c.Id == id)
                .FirstOrDefaultAsync();
        }
        
        if (complaint == null)
        {
            complaint = await _context.Complaints
                .Find(c => c.ComplaintId == id)
                .FirstOrDefaultAsync();
        }

        if (complaint == null)
        {
            return NotFound(new { message = "Complaint not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "ComplainantName", complaint.ComplainantName },
            { "Appellant", complaint.Appellant },
            { "Description", complaint.Description },
            { "Status", complaint.Status }
        };

        DeleteResult result;
        
        if (MongoHelper.IsValidObjectId(id))
        {
            result = await _context.Complaints.DeleteOneAsync(c => c.Id == id);
        }
        else
        {
            result = await _context.Complaints.DeleteOneAsync(c => c.ComplaintId == id);
        }

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Complaint not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Complaint",
            EntityId = complaint.ComplaintId ?? complaint.Id!,
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

        return Ok(new { message = "Complaint deleted successfully" });
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "Complaint")
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
