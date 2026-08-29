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
public class HouseholdController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;

    public HouseholdController(IMongoDbContext context, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var households = await _context.Households
            .Find(_ => true)
            .SortBy(h => h.LastName)
            .ThenBy(h => h.FirstName)
            .ToListAsync();

        var response = households.Select(h => new HouseholdResponse
        {
            Id = h.Id!,
            FirstName = h.FirstName,
            LastName = h.LastName,
            MiddleName = h.MiddleName,
            FullName = NameHelper.FormatFullName(h.LastName, h.FirstName, h.MiddleName),
            Contact = h.Contact,
            HouseNo = h.HouseNo,
            PurokId = h.PurokId,
            Purok = h.Purok,
            ImageUrl = h.ImageUrl,
            CreatedAt = h.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var household = await _context.Households
            .Find(h => h.Id == id)
            .FirstOrDefaultAsync();

        if (household == null)
        {
            return NotFound(new { message = "Household not found" });
        }

        var response = new HouseholdResponse
        {
            Id = household.Id!,
            FirstName = household.FirstName,
            LastName = household.LastName,
            MiddleName = household.MiddleName,
            FullName = $"{household.LastName}, {household.FirstName}" + (string.IsNullOrEmpty(household.MiddleName) ? "" : $", {household.MiddleName}"),
            Contact = household.Contact,
            HouseNo = household.HouseNo,
            PurokId = household.PurokId,
            Purok = household.Purok,
            ImageUrl = household.ImageUrl,
            CreatedAt = household.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] HouseholdRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var household = new Household
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            MiddleName = request.MiddleName,
            Contact = request.Contact,
            HouseNo = request.HouseNo,
            PurokId = request.PurokId,
            ImageUrl = request.ImageUrl,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.Households.InsertOneAsync(household);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "FirstName", household.FirstName },
            { "LastName", household.LastName },
            { "MiddleName", household.MiddleName ?? "" },
            { "Contact", household.Contact },
            { "HouseNo", household.HouseNo },
            { "PurokId", household.PurokId },
            { "ImageUrl", household.ImageUrl ?? "" }
        };

        var auditLog = new AuditLog
        {
            EntityType = "Household",
            EntityId = household.Id!,
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

        var response = new HouseholdResponse
        {
            Id = household.Id!,
            FirstName = household.FirstName,
            LastName = household.LastName,
            MiddleName = household.MiddleName,
            FullName = $"{household.LastName}, {household.FirstName}" + (string.IsNullOrEmpty(household.MiddleName) ? "" : $", {household.MiddleName}"),
            Contact = household.Contact,
            HouseNo = household.HouseNo,
            PurokId = household.PurokId,
            Purok = household.Purok,
            ImageUrl = household.ImageUrl,
            CreatedAt = household.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = household.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] HouseholdRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var household = await _context.Households
            .Find(h => h.Id == id)
            .FirstOrDefaultAsync();

        if (household == null)
        {
            return NotFound(new { message = "Household not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "FirstName", household.FirstName },
            { "LastName", household.LastName },
            { "MiddleName", household.MiddleName ?? "" },
            { "Contact", household.Contact },
            { "HouseNo", household.HouseNo },
            { "PurokId", household.PurokId },
            { "ImageUrl", household.ImageUrl ?? "" }
        };

        var newValues = new Dictionary<string, object>
        {
            { "FirstName", request.FirstName },
            { "LastName", request.LastName },
            { "MiddleName", request.MiddleName ?? "" },
            { "Contact", request.Contact },
            { "HouseNo", request.HouseNo },
            { "PurokId", request.PurokId },
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

        household.FirstName = request.FirstName;
        household.LastName = request.LastName;
        household.MiddleName = request.MiddleName;
        household.Contact = request.Contact;
        household.HouseNo = request.HouseNo;
        household.PurokId = request.PurokId;
        household.ImageUrl = request.ImageUrl;
        household.UpdatedAt = DateTime.UtcNow;

        var updateDefinition = Builders<Household>.Update
            .Set(h => h.FirstName, household.FirstName)
            .Set(h => h.LastName, household.LastName)
            .Set(h => h.MiddleName, household.MiddleName)
            .Set(h => h.Contact, household.Contact)
            .Set(h => h.HouseNo, household.HouseNo)
            .Set(h => h.PurokId, household.PurokId)
            .Set(h => h.ImageUrl, household.ImageUrl)
            .Set(h => h.UpdatedAt, household.UpdatedAt);

        await _context.Households.UpdateOneAsync(h => h.Id == id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Household",
            EntityId = household.Id!,
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

        var response = new HouseholdResponse
        {
            Id = household.Id!,
            FirstName = household.FirstName,
            LastName = household.LastName,
            MiddleName = household.MiddleName,
            FullName = $"{household.LastName}, {household.FirstName}" + (string.IsNullOrEmpty(household.MiddleName) ? "" : $", {household.MiddleName}"),
            Contact = household.Contact,
            HouseNo = household.HouseNo,
            PurokId = household.PurokId,
            Purok = household.Purok,
            ImageUrl = household.ImageUrl,
            CreatedAt = household.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var household = await _context.Households
            .Find(h => h.Id == id)
            .FirstOrDefaultAsync();

        if (household == null)
        {
            return NotFound(new { message = "Household not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "FirstName", household.FirstName },
            { "LastName", household.LastName },
            { "MiddleName", household.MiddleName ?? "" },
            { "Contact", household.Contact },
            { "HouseNo", household.HouseNo },
            { "PurokId", household.PurokId },
            { "ImageUrl", household.ImageUrl ?? "" }
        };

        var result = await _context.Households.DeleteOneAsync(h => h.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "Household not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "Household",
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

        return Ok(new { message = "Household deleted successfully" });
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "Household")
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
