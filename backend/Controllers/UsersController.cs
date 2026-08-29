using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using backend.Helpers;
using MongoDB.Driver;
using BCrypt.Net;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;

    public UsersController(IMongoDbContext context, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.AdminUsers
            .Find(_ => true)
            .SortBy(u => u.LastName)
            .ThenBy(u => u.FirstName)
            .ToListAsync();

        var response = users.Select(u => new UserResponse
        {
            Id = u.Id!,
            Email = u.Email,
            FirstName = u.FirstName,
            LastName = u.LastName,
            Role = u.Role,
            PhotoUrl = u.PhotoUrl,
            IsActive = u.IsActive,
            CreatedAt = u.CreatedAt
        }).ToList();

        return Ok(response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _context.AdminUsers
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var response = new UserResponse
        {
            Id = user.Id!,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            PhotoUrl = user.PhotoUrl,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Ok(response);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var existingUser = await _context.AdminUsers
            .Find(u => u.Email.ToLower() == request.Email.ToLower())
            .FirstOrDefaultAsync();

        if (existingUser != null)
        {
            return BadRequest(new { message = "Email already exists" });
        }

        var user = new AdminUser
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Role = request.Role,
            PhotoUrl = request.PhotoUrl,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.AdminUsers.InsertOneAsync(user);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "Email", user.Email },
            { "FirstName", user.FirstName },
            { "LastName", user.LastName },
            { "Role", user.Role },
            { "PhotoUrl", user.PhotoUrl ?? "" }
        };

        var auditLog = new AuditLog
        {
            EntityType = "User",
            EntityId = user.Id!,
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

        var response = new UserResponse
        {
            Id = user.Id!,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            PhotoUrl = user.PhotoUrl,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return CreatedAtAction(nameof(GetById), new { id = user.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _context.AdminUsers
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        if (user.Email.ToLower() != request.Email.ToLower())
        {
            var existingUser = await _context.AdminUsers
                .Find(u => u.Email.ToLower() == request.Email.ToLower() && u.Id != id)
                .FirstOrDefaultAsync();

            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }
        }

        if (!string.IsNullOrEmpty(request.Password) && !string.IsNullOrEmpty(request.CurrentPassword))
        {
            var adminId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var currentUser = await _context.AdminUsers
                .Find(u => u.Id == adminId)
                .FirstOrDefaultAsync();

            if (currentUser == null || !BCrypt.Net.BCrypt.Verify(request.CurrentPassword, currentUser.PasswordHash))
            {
                return BadRequest(new { message = "Current password is incorrect" });
            }
        }
        else if (!string.IsNullOrEmpty(request.Password) && string.IsNullOrEmpty(request.CurrentPassword))
        {
            return BadRequest(new { message = "Current password is required to change password" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "Email", user.Email },
            { "FirstName", user.FirstName },
            { "LastName", user.LastName },
            { "Role", user.Role },
            { "PhotoUrl", user.PhotoUrl ?? "" }
        };

        var newValues = new Dictionary<string, object>
        {
            { "Email", request.Email },
            { "FirstName", request.FirstName },
            { "LastName", request.LastName },
            { "Role", request.Role },
            { "PhotoUrl", request.PhotoUrl ?? "" }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        user.Email = request.Email;
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.Role = request.Role;
        user.PhotoUrl = request.PhotoUrl;
        user.UpdatedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(request.Password))
        {
            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
            changes["Password"] = new { oldValue = "[HIDDEN]", newValue = "[CHANGED]" };
        }

        var updateDefinition = Builders<AdminUser>.Update
            .Set(u => u.Email, user.Email)
            .Set(u => u.FirstName, user.FirstName)
            .Set(u => u.LastName, user.LastName)
            .Set(u => u.Role, user.Role)
            .Set(u => u.PhotoUrl, user.PhotoUrl)
            .Set(u => u.UpdatedAt, user.UpdatedAt);

        if (!string.IsNullOrEmpty(request.Password))
        {
            updateDefinition = updateDefinition.Set(u => u.PasswordHash, user.PasswordHash);
        }

        await _context.AdminUsers.UpdateOneAsync(u => u.Id == id, updateDefinition);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "User",
            EntityId = user.Id!,
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

        var response = new UserResponse
        {
            Id = user.Id!,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            PhotoUrl = user.PhotoUrl,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };

        return Ok(response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _context.AdminUsers
            .Find(u => u.Id == id)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "Email", user.Email },
            { "FirstName", user.FirstName },
            { "LastName", user.LastName },
            { "Role", user.Role },
            { "PhotoUrl", user.PhotoUrl ?? "" }
        };

        var result = await _context.AdminUsers.DeleteOneAsync(u => u.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound(new { message = "User not found" });
        }

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "User",
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

        return Ok(new { message = "User deleted successfully" });
    }

    [HttpPost("upload-image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { message = "No file uploaded" });
        }

        try
        {
            var imageUrl = await _cloudinaryService.UploadImageAsync(file);
            return Ok(new { url = imageUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("{id}/audit-logs")]
    public async Task<IActionResult> GetAuditLogs(string id)
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityId == id && log.EntityType == "User")
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
