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
public class ClearanceController : ControllerBase
{
    private readonly IMongoDbContext _context;

    public ClearanceController(IMongoDbContext context)
    {
        _context = context;
    }


    [HttpGet("individual")]
    public async Task<IActionResult> GetAllIndividual()
    {
        var clearances = await _context.IndividualClearances
            .Find(_ => true)
            .SortBy(c => c.LastName)
            .ThenBy(c => c.FirstName)
            .ToListAsync();

        var response = clearances.Select(c => new IndividualClearanceResponse
        {
            Id = c.Id!,
            LastName = c.LastName,
            FirstName = c.FirstName,
            MiddleName = c.MiddleName,
            FullName = NameHelper.FormatFullName(c.LastName, c.FirstName, c.MiddleName),
            Age = c.Age,
            Contact = c.Contact,
            OrNo = c.OrNo,
            Purpose = c.Purpose,
            CreatedAt = c.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpGet("individual/{id}")]
    public async Task<IActionResult> GetIndividualById(string id)
    {
        var clearance = await _context.IndividualClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Individual clearance not found" });
        }

        var response = new IndividualClearanceResponse
        {
            Id = clearance.Id!,
            LastName = clearance.LastName,
            FirstName = clearance.FirstName,
            MiddleName = clearance.MiddleName,
            FullName = $"{clearance.LastName}, {clearance.FirstName}" + (string.IsNullOrEmpty(clearance.MiddleName) ? "" : $", {clearance.MiddleName}"),
            Age = clearance.Age,
            Contact = clearance.Contact,
            OrNo = clearance.OrNo,
            Purpose = clearance.Purpose,
            CreatedAt = clearance.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost("individual")]
    public async Task<IActionResult> CreateIndividual([FromBody] IndividualClearanceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var clearance = new IndividualClearance
        {
            LastName = request.LastName,
            FirstName = request.FirstName,
            MiddleName = request.MiddleName,
            Age = request.Age,
            Contact = request.Contact,
            OrNo = request.OrNo,
            Purpose = request.Purpose,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.IndividualClearances.InsertOneAsync(clearance);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "LastName", clearance.LastName },
            { "FirstName", clearance.FirstName },
            { "MiddleName", clearance.MiddleName ?? "" },
            { "Age", clearance.Age },
            { "Contact", clearance.Contact },
            { "OrNo", clearance.OrNo },
            { "Purpose", clearance.Purpose }
        };

        var auditLog = new AuditLog
        {
            EntityType = "IndividualClearance",
            EntityId = clearance.Id!,
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

        var response = new IndividualClearanceResponse
        {
            Id = clearance.Id!,
            LastName = clearance.LastName,
            FirstName = clearance.FirstName,
            MiddleName = clearance.MiddleName,
            FullName = $"{clearance.LastName}, {clearance.FirstName}" + (string.IsNullOrEmpty(clearance.MiddleName) ? "" : $", {clearance.MiddleName}"),
            Age = clearance.Age,
            Contact = clearance.Contact,
            OrNo = clearance.OrNo,
            Purpose = clearance.Purpose,
            CreatedAt = clearance.CreatedAt
        };

        return CreatedAtAction(nameof(GetIndividualById), new { id = clearance.Id }, response);
    }

    [HttpPut("individual/{id}")]
    public async Task<IActionResult> UpdateIndividual(string id, [FromBody] IndividualClearanceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var clearance = await _context.IndividualClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Individual clearance not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "LastName", clearance.LastName },
            { "FirstName", clearance.FirstName },
            { "MiddleName", clearance.MiddleName ?? "" },
            { "Age", clearance.Age },
            { "Contact", clearance.Contact },
            { "OrNo", clearance.OrNo },
            { "Purpose", clearance.Purpose }
        };

        var newValues = new Dictionary<string, object>
        {
            { "LastName", request.LastName },
            { "FirstName", request.FirstName },
            { "MiddleName", request.MiddleName ?? "" },
            { "Age", request.Age },
            { "Contact", request.Contact },
            { "OrNo", request.OrNo },
            { "Purpose", request.Purpose }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        clearance.LastName = request.LastName;
        clearance.FirstName = request.FirstName;
        clearance.MiddleName = request.MiddleName;
        clearance.Age = request.Age;
        clearance.Contact = request.Contact;
        clearance.OrNo = request.OrNo;
        clearance.Purpose = request.Purpose;
        clearance.UpdatedAt = DateTime.UtcNow;

        var updateDefinition = Builders<IndividualClearance>.Update
            .Set(c => c.LastName, clearance.LastName)
            .Set(c => c.FirstName, clearance.FirstName)
            .Set(c => c.MiddleName, clearance.MiddleName)
            .Set(c => c.Age, clearance.Age)
            .Set(c => c.Contact, clearance.Contact)
            .Set(c => c.OrNo, clearance.OrNo)
            .Set(c => c.Purpose, clearance.Purpose)
            .Set(c => c.UpdatedAt, clearance.UpdatedAt);

        await _context.IndividualClearances.UpdateOneAsync(c => c.Id == id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "IndividualClearance",
            EntityId = clearance.Id!,
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

        var response = new IndividualClearanceResponse
        {
            Id = clearance.Id!,
            LastName = clearance.LastName,
            FirstName = clearance.FirstName,
            MiddleName = clearance.MiddleName,
            FullName = $"{clearance.LastName}, {clearance.FirstName}" + (string.IsNullOrEmpty(clearance.MiddleName) ? "" : $", {clearance.MiddleName}"),
            Age = clearance.Age,
            Contact = clearance.Contact,
            OrNo = clearance.OrNo,
            Purpose = clearance.Purpose,
            CreatedAt = clearance.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("individual/{id}")]
    public async Task<IActionResult> DeleteIndividual(string id)
    {
        var clearance = await _context.IndividualClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Individual clearance not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "LastName", clearance.LastName },
            { "FirstName", clearance.FirstName },
            { "MiddleName", clearance.MiddleName ?? "" },
            { "Age", clearance.Age },
            { "Contact", clearance.Contact },
            { "OrNo", clearance.OrNo },
            { "Purpose", clearance.Purpose }
        };

        var result = await _context.IndividualClearances.DeleteOneAsync(c => c.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Individual clearance not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "IndividualClearance",
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

        return Ok(new { message = "Individual clearance deleted successfully" });
    }

    [HttpGet("individual/{id}/audit-logs")]
    public async Task<IActionResult> GetIndividualAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "IndividualClearance")
            .SortByDescending(log => log.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }



    [HttpGet("business")]
    public async Task<IActionResult> GetAllBusiness()
    {
        var clearances = await _context.BusinessClearances
            .Find(_ => true)
            .SortBy(c => c.BusinessName)
            .ToListAsync();

        var response = clearances.Select(c => new BusinessClearanceResponse
        {
            Id = c.Id!,
            OwnerName = c.OwnerName,
            BusinessName = c.BusinessName,
            BusinessType = c.BusinessType,
            Tin = c.Tin,
            OrNo = c.OrNo,
            CreatedAt = c.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpGet("business/{id}")]
    public async Task<IActionResult> GetBusinessById(string id)
    {
        var clearance = await _context.BusinessClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Business clearance not found" });
        }

        var response = new BusinessClearanceResponse
        {
            Id = clearance.Id!,
            OwnerName = clearance.OwnerName,
            BusinessName = clearance.BusinessName,
            BusinessType = clearance.BusinessType,
            Tin = clearance.Tin,
            OrNo = clearance.OrNo,
            CreatedAt = clearance.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost("business")]
    public async Task<IActionResult> CreateBusiness([FromBody] BusinessClearanceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var clearance = new BusinessClearance
        {
            OwnerName = request.OwnerName,
            BusinessName = request.BusinessName,
            BusinessType = request.BusinessType,
            Tin = request.Tin,
            OrNo = request.OrNo,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.BusinessClearances.InsertOneAsync(clearance);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "OwnerName", clearance.OwnerName },
            { "BusinessName", clearance.BusinessName },
            { "BusinessType", clearance.BusinessType },
            { "Tin", clearance.Tin },
            { "OrNo", clearance.OrNo }
        };

        var auditLog = new AuditLog
        {
            EntityType = "BusinessClearance",
            EntityId = clearance.Id!,
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

        var response = new BusinessClearanceResponse
        {
            Id = clearance.Id!,
            OwnerName = clearance.OwnerName,
            BusinessName = clearance.BusinessName,
            BusinessType = clearance.BusinessType,
            Tin = clearance.Tin,
            OrNo = clearance.OrNo,
            CreatedAt = clearance.CreatedAt
        };

        return CreatedAtAction(nameof(GetBusinessById), new { id = clearance.Id }, response);
    }

    [HttpPut("business/{id}")]
    public async Task<IActionResult> UpdateBusiness(string id, [FromBody] BusinessClearanceRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var clearance = await _context.BusinessClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Business clearance not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "OwnerName", clearance.OwnerName },
            { "BusinessName", clearance.BusinessName },
            { "BusinessType", clearance.BusinessType },
            { "Tin", clearance.Tin },
            { "OrNo", clearance.OrNo }
        };

        var newValues = new Dictionary<string, object>
        {
            { "OwnerName", request.OwnerName },
            { "BusinessName", request.BusinessName },
            { "BusinessType", request.BusinessType },
            { "Tin", request.Tin },
            { "OrNo", request.OrNo }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        clearance.OwnerName = request.OwnerName;
        clearance.BusinessName = request.BusinessName;
        clearance.BusinessType = request.BusinessType;
        clearance.Tin = request.Tin;
        clearance.OrNo = request.OrNo;
        clearance.UpdatedAt = DateTime.UtcNow;

        var updateDefinition = Builders<BusinessClearance>.Update
            .Set(c => c.OwnerName, clearance.OwnerName)
            .Set(c => c.BusinessName, clearance.BusinessName)
            .Set(c => c.BusinessType, clearance.BusinessType)
            .Set(c => c.Tin, clearance.Tin)
            .Set(c => c.OrNo, clearance.OrNo)
            .Set(c => c.UpdatedAt, clearance.UpdatedAt);

        await _context.BusinessClearances.UpdateOneAsync(c => c.Id == id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "BusinessClearance",
            EntityId = clearance.Id!,
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

        var response = new BusinessClearanceResponse
        {
            Id = clearance.Id!,
            OwnerName = clearance.OwnerName,
            BusinessName = clearance.BusinessName,
            BusinessType = clearance.BusinessType,
            Tin = clearance.Tin,
            OrNo = clearance.OrNo,
            CreatedAt = clearance.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("business/{id}")]
    public async Task<IActionResult> DeleteBusiness(string id)
    {
        var clearance = await _context.BusinessClearances
            .Find(c => c.Id == id)
            .FirstOrDefaultAsync();

        if (clearance == null)
        {
            return NotFound(new { message = "Business clearance not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "OwnerName", clearance.OwnerName },
            { "BusinessName", clearance.BusinessName },
            { "BusinessType", clearance.BusinessType },
            { "Tin", clearance.Tin },
            { "OrNo", clearance.OrNo }
        };

        var result = await _context.BusinessClearances.DeleteOneAsync(c => c.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Business clearance not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "BusinessClearance",
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

        return Ok(new { message = "Business clearance deleted successfully" });
    }

    [HttpGet("business/{id}/audit-logs")]
    public async Task<IActionResult> GetBusinessAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "BusinessClearance")
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
