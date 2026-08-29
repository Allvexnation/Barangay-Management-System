using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Services.Interfaces;
using backend.Helpers;
using MongoDB.Driver;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SystemInfoController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly ICloudinaryService _cloudinaryService;

    public SystemInfoController(IMongoDbContext context, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _cloudinaryService = cloudinaryService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> Get()
    {
        var systemInfo = await _context.SystemInfos
            .Find(_ => true)
            .FirstOrDefaultAsync();

        if (systemInfo == null)
        {
            return NotFound(new { message = "System info not found" });
        }

        return Ok(systemInfo);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromForm] SystemInfoRequest request)
    {
        var existing = await _context.SystemInfos.Find(_ => true).FirstOrDefaultAsync();
        if (existing != null)
        {
            return BadRequest(new { message = "System info already exists. Use PUT to update." });
        }

        string? logoUrl = null;
        string? logoPublicId = null;

        if (request.Logo != null && request.Logo.Length > 0)
        {
            try
            {
                logoUrl = await _cloudinaryService.UploadImageAsync(request.Logo);
                logoPublicId = ExtractPublicIdFromUrl(logoUrl);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to upload logo: {ex.Message}" });
            }
        }

        var systemInfo = new SystemInfo
        {
            BarangayName = request.BarangayName,
            City = request.City,
            Province = request.Province,
            ZipCode = request.ZipCode,
            LogoUrl = logoUrl,
            LogoPublicId = logoPublicId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _context.SystemInfos.InsertOneAsync(systemInfo);

        var adminInfo = GetAdminInfo();
        var newValues = new Dictionary<string, object>
        {
            { "BarangayName", systemInfo.BarangayName },
            { "City", systemInfo.City },
            { "Province", systemInfo.Province },
            { "ZipCode", systemInfo.ZipCode },
            { "LogoUrl", systemInfo.LogoUrl ?? "" }
        };

        var auditLog = new AuditLog
        {
            EntityType = "SystemInfo",
            EntityId = systemInfo.Id!,
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

        return Ok(systemInfo);
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromForm] SystemInfoRequest request)
    {
        var systemInfo = await _context.SystemInfos.Find(_ => true).FirstOrDefaultAsync();

        if (systemInfo == null)
        {
            return NotFound(new { message = "System info not found" });
        }

        string? logoUrl = systemInfo.LogoUrl;
        string? logoPublicId = systemInfo.LogoPublicId;

        var previousValues = new Dictionary<string, object>
        {
            { "BarangayName", systemInfo.BarangayName },
            { "City", systemInfo.City },
            { "Province", systemInfo.Province },
            { "ZipCode", systemInfo.ZipCode },
            { "LogoUrl", systemInfo.LogoUrl ?? "" }
        };

        var newValues = new Dictionary<string, object>
        {
            { "BarangayName", request.BarangayName },
            { "City", request.City },
            { "Province", request.Province },
            { "ZipCode", request.ZipCode },
            { "LogoUrl", logoUrl ?? "" }
        };

        var changes = new Dictionary<string, object>();
        foreach (var key in previousValues.Keys)
        {
            if (!previousValues[key].Equals(newValues[key]))
            {
                changes[key] = new { oldValue = previousValues[key], newValue = newValues[key] };
            }
        }

        if (request.Logo != null && request.Logo.Length > 0)
        {
            try
            {
                if (!string.IsNullOrEmpty(systemInfo.LogoPublicId))
                {
                    await _cloudinaryService.DeleteImageAsync(systemInfo.LogoPublicId);
                }

                logoUrl = await _cloudinaryService.UploadImageAsync(request.Logo);
                logoPublicId = ExtractPublicIdFromUrl(logoUrl);
                newValues["LogoUrl"] = logoUrl ?? "";
                changes["LogoUrl"] = new { oldValue = previousValues["LogoUrl"], newValue = logoUrl ?? "" };
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Failed to upload logo: {ex.Message}" });
            }
        }

        var updateDefinition = Builders<SystemInfo>.Update
            .Set(s => s.BarangayName, request.BarangayName)
            .Set(s => s.City, request.City)
            .Set(s => s.Province, request.Province)
            .Set(s => s.ZipCode, request.ZipCode)
            .Set(s => s.LogoUrl, logoUrl)
            .Set(s => s.LogoPublicId, logoPublicId)
            .Set(s => s.UpdatedAt, DateTime.UtcNow);

        await _context.SystemInfos.UpdateOneAsync(
            s => s.Id == systemInfo.Id,
            updateDefinition
        );

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "SystemInfo",
            EntityId = systemInfo.Id!,
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

        var updatedSystemInfo = await _context.SystemInfos.Find(_ => true).FirstOrDefaultAsync();
        return Ok(updatedSystemInfo);
    }

    [HttpDelete]
    public async Task<IActionResult> Delete()
    {
        var systemInfo = await _context.SystemInfos.Find(_ => true).FirstOrDefaultAsync();

        if (systemInfo == null)
        {
            return NotFound(new { message = "System info not found" });
        }

        var previousValues = new Dictionary<string, object>
        {
            { "BarangayName", systemInfo.BarangayName },
            { "City", systemInfo.City },
            { "Province", systemInfo.Province },
            { "ZipCode", systemInfo.ZipCode },
            { "LogoUrl", systemInfo.LogoUrl ?? "" }
        };

        if (!string.IsNullOrEmpty(systemInfo.LogoPublicId))
        {
            try
            {
                await _cloudinaryService.DeleteImageAsync(systemInfo.LogoPublicId);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to delete logo from Cloudinary: {ex.Message}");
            }
        }

        await _context.SystemInfos.DeleteOneAsync(s => s.Id == systemInfo.Id);

        var adminInfo = GetAdminInfo();
        var auditLog = new AuditLog
        {
            EntityType = "SystemInfo",
            EntityId = systemInfo.Id!,
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

        return Ok(new { message = "System info deleted successfully" });
    }

    private string? ExtractPublicIdFromUrl(string url)
    {
        if (string.IsNullOrEmpty(url)) return null;
        
        try
        {
            var uri = new Uri(url);
            var segments = uri.Segments;
            if (segments.Length >= 2)
            {
                var fileName = segments.Last().Split('.')[0];
                var folder = segments[segments.Length - 2].Trim('/');
                return $"{folder}/{fileName}";
            }
        }
        catch
        {
            return null;
        }
        
        return null;
    }

    [HttpGet("audit-logs")]
    public async Task<IActionResult> GetAuditLogs()
    {
        var logs = await _context.AuditLogs
            .Find(log => log.EntityType == "SystemInfo")
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

public class SystemInfoRequest
{
    public string BarangayName { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Province { get; set; } = string.Empty;
    public string ZipCode { get; set; } = string.Empty;
    public IFormFile? Logo { get; set; }
}
