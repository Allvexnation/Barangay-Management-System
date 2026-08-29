using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Models.DTOs;
using backend.Helpers;
using backend.Services.Interfaces;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OfficialsController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;

    public OfficialsController(IMongoDbContext context, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var officials = await _context.Officials
            .Find(_ => true)
            .SortBy(o => o.LastName)
            .ThenBy(o => o.FirstName)
            .ToListAsync();

        var response = officials.Select(o => new OfficialResponse
        {
            Id = o.Id!,
            FirstName = o.FirstName,
            LastName = o.LastName,
            MiddleName = o.MiddleName,
            FullName = NameHelper.FormatFullName(o.LastName, o.FirstName, o.MiddleName),
            Contact = o.Contact,
            PositionId = o.PositionId,
            Position = o.Position,
            ImageUrl = o.ImageUrl,
            CreatedAt = o.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var official = await _context.Officials
            .Find(o => o.Id == id)
            .FirstOrDefaultAsync();

        if (official == null)
        {
            return NotFound(new { message = "Official not found" });
        }

        var response = new OfficialResponse
        {
            Id = official.Id!,
            FirstName = official.FirstName,
            LastName = official.LastName,
            MiddleName = official.MiddleName,
            FullName = $"{official.LastName}, {official.FirstName}" + (string.IsNullOrEmpty(official.MiddleName) ? "" : $", {official.MiddleName}"),
            Contact = official.Contact,
            PositionId = official.PositionId,
            Position = official.Position,
            ImageUrl = official.ImageUrl,
            CreatedAt = official.CreatedAt
        };

        return Ok(response);
    }

    [HttpGet("positions")]
    public async Task<IActionResult> GetPositions()
    {
        var positions = await _context.Positions
            .Find(p => p.IsActive)
            .SortBy(p => p.PositionId)
            .ToListAsync();

        return Ok(positions);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] OfficialRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var position = await _context.Positions
            .Find(p => p.PositionId == request.PositionId)
            .FirstOrDefaultAsync();

        var official = new Official
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            MiddleName = request.MiddleName,
            Contact = request.Contact,
            PositionId = request.PositionId,
            Position = position?.PositionName,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Officials.InsertOneAsync(official);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "FirstName", official.FirstName },
            { "LastName", official.LastName },
            { "MiddleName", official.MiddleName ?? "" },
            { "Contact", official.Contact },
            { "PositionId", official.PositionId },
            { "ImageUrl", official.ImageUrl ?? "" }
        };

        var auditLog = new AuditLog
        {
            EntityType = "Official",
            EntityId = official.Id!,
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

        var response = new OfficialResponse
        {
            Id = official.Id!,
            FirstName = official.FirstName,
            LastName = official.LastName,
            MiddleName = official.MiddleName,
            FullName = $"{official.LastName}, {official.FirstName}" + (string.IsNullOrEmpty(official.MiddleName) ? "" : $", {official.MiddleName}"),
            Contact = official.Contact,
            PositionId = official.PositionId,
            Position = official.Position,
            ImageUrl = official.ImageUrl,
            CreatedAt = official.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = official.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] OfficialRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var official = await _context.Officials
            .Find(o => o.Id == id)
            .FirstOrDefaultAsync();

        if (official == null)
        {
            return NotFound(new { message = "Official not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "FirstName", official.FirstName },
            { "LastName", official.LastName },
            { "MiddleName", official.MiddleName ?? "" },
            { "Contact", official.Contact },
            { "PositionId", official.PositionId },
            { "ImageUrl", official.ImageUrl ?? "" }
        };

        var newValues = new Dictionary<string, object>
        {
            { "FirstName", request.FirstName },
            { "LastName", request.LastName },
            { "MiddleName", request.MiddleName ?? "" },
            { "Contact", request.Contact },
            { "PositionId", request.PositionId },
            { "ImageUrl", request.ImageUrl ?? "" }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        var position = await _context.Positions
            .Find(p => p.PositionId == request.PositionId)
            .FirstOrDefaultAsync();

        official.FirstName = request.FirstName;
        official.LastName = request.LastName;
        official.MiddleName = request.MiddleName;
        official.Contact = request.Contact;
        official.PositionId = request.PositionId;
        official.Position = position?.PositionName;
        official.ImageUrl = request.ImageUrl;
        official.UpdatedAt = DateTime.UtcNow;

        var updateDefinition = Builders<Official>.Update
            .Set(o => o.FirstName, official.FirstName)
            .Set(o => o.LastName, official.LastName)
            .Set(o => o.MiddleName, official.MiddleName)
            .Set(o => o.Contact, official.Contact)
            .Set(o => o.PositionId, official.PositionId)
            .Set(o => o.Position, official.Position)
            .Set("imageUrl", official.ImageUrl)
            .Set(o => o.UpdatedAt, official.UpdatedAt);

        await _context.Officials.UpdateOneAsync(o => o.Id == id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Official",
            EntityId = official.Id!,
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

        var response = new OfficialResponse
        {
            Id = official.Id!,
            FirstName = official.FirstName,
            LastName = official.LastName,
            MiddleName = official.MiddleName,
            FullName = $"{official.LastName}, {official.FirstName}" + (string.IsNullOrEmpty(official.MiddleName) ? "" : $", {official.MiddleName}"),
            Contact = official.Contact,
            PositionId = official.PositionId,
            Position = official.Position,
            ImageUrl = official.ImageUrl,
            CreatedAt = official.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var official = await _context.Officials
            .Find(o => o.Id == id)
            .FirstOrDefaultAsync();

        if (official == null)
        {
            return NotFound(new { message = "Official not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "FirstName", official.FirstName },
            { "LastName", official.LastName },
            { "MiddleName", official.MiddleName ?? "" },
            { "Contact", official.Contact },
            { "PositionId", official.PositionId },
            { "ImageUrl", official.ImageUrl ?? "" }
        };

        var result = await _context.Officials.DeleteOneAsync(o => o.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Official not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Official",
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

        return Ok(new { message = "Official deleted successfully" });
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "Official")
            .SortByDescending(log => log.Timestamp)
            .ToListAsync();

        return Ok(logs);
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
        {
            return BadRequest(new { message = "Invalid file type. Only images are allowed." });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "File size exceeds 5MB limit." });
        }

        try
        {
            var imageUrl = await _cloudinaryService.UploadImageAsync(file);
            return Ok(new { imageUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to upload image", error = ex.Message });
        }
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
