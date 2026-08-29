using Microsoft.AspNetCore.Mvc;
using backend.Repositories.Interfaces;
using backend.Models;
using backend.Models.DTOs;
using backend.Services.Interfaces;
using MongoDB.Driver;
using BCrypt.Net;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AdminAuthController : ControllerBase
{
    private readonly IMongoDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly ICloudinaryService _cloudinaryService;

    public AdminAuthController(IMongoDbContext context, IJwtService jwtService, ICloudinaryService cloudinaryService)
    {
        _context = context;
        _jwtService = jwtService;
        _cloudinaryService = cloudinaryService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var adminUser = await _context.AdminUsers
            .Find(u => u.Email.ToLower() == request.Email.ToLower())
            .FirstOrDefaultAsync();

        if (adminUser == null)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (!adminUser.IsActive)
        {
            return Unauthorized(new { message = "Account is inactive" });
        }

        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, adminUser.PasswordHash);

        if (!isPasswordValid)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        var token = _jwtService.GenerateToken(adminUser.Id!, adminUser.Email, adminUser.FirstName, adminUser.LastName, adminUser.Username, adminUser.Role);

        var response = new LoginResponse
        {
            Token = token,
            Id = adminUser.Id!,
            Email = adminUser.Email,
            Username = adminUser.Username,
            FirstName = adminUser.FirstName,
            LastName = adminUser.LastName,
            Role = adminUser.Role,
            ProfilePhoto = adminUser.PhotoUrl
        };

        return Ok(response);
    }

    [HttpPost("update-profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        string userId = request.Id;
        
        if (string.IsNullOrEmpty(userId))
        {
            userId = Request.Headers["X-User-Id"].FirstOrDefault();
        }

        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { message = "User ID is required" });
        }

        var adminUser = await _context.AdminUsers
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync();

        if (adminUser == null)
        {
            return NotFound(new { message = "User not found" });
        }

        adminUser.Username = request.Username;
        adminUser.FirstName = request.FirstName;
        adminUser.LastName = request.LastName;

        if (!string.IsNullOrEmpty(request.Password))
        {
            if (string.IsNullOrEmpty(request.Old_Password))
            {
                return BadRequest(new { message = "Old password is required when changing password" });
            }

            bool isOldPasswordValid = BCrypt.Net.BCrypt.Verify(request.Old_Password, adminUser.PasswordHash);
            if (!isOldPasswordValid)
            {
                return BadRequest(new { message = "Old password is incorrect" });
            }

            adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        }

        adminUser.UpdatedAt = DateTime.UtcNow;

        var updateFilter = Builders<AdminUser>.Filter.Eq(u => u.Id, adminUser.Id);
        var updateDefinition = Builders<AdminUser>.Update
            .Set(u => u.Username, adminUser.Username)
            .Set(u => u.FirstName, adminUser.FirstName)
            .Set(u => u.LastName, adminUser.LastName)
            .Set(u => u.UpdatedAt, adminUser.UpdatedAt);

        if (!string.IsNullOrEmpty(request.Password))
        {
            updateDefinition = updateDefinition.Set(u => u.PasswordHash, adminUser.PasswordHash);
        }

        await _context.AdminUsers.UpdateOneAsync(updateFilter, updateDefinition);

        var response = new UpdateProfileResponse
        {
            Success = true,
            Message = "Profile updated successfully",
            Id = adminUser.Id,
            Email = adminUser.Email,
            Username = adminUser.Username,
            FirstName = adminUser.FirstName,
            LastName = adminUser.LastName,
            Role = adminUser.Role,
            ProfilePhoto = adminUser.PhotoUrl
        };

        return Ok(response);
    }

    [HttpPost("upload-photo")]
    public async Task<IActionResult> UploadPhoto(IFormFile photo)
    {
        if (photo == null || photo.Length == 0)
        {
            return BadRequest(new { message = "No photo uploaded" });
        }

        var userId = Request.Headers["X-User-Id"].FirstOrDefault();
        
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest(new { message = "User ID is required" });
        }

        try
        {
            var photoUrl = await _cloudinaryService.UploadImageAsync(photo);
            
            var updateFilter = Builders<AdminUser>.Filter.Eq(u => u.Id, userId);
            var updateDefinition = Builders<AdminUser>.Update.Set(u => u.PhotoUrl, photoUrl);
            
            await _context.AdminUsers.UpdateOneAsync(updateFilter, updateDefinition);

            return Ok(new { success = true, photoUrl = photoUrl });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
