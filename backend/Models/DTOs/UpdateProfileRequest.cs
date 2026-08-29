using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class UpdateProfileRequest
{
    public string Id { get; set; } = string.Empty;
    
    [Required(ErrorMessage = "First name is required")]
    public required string FirstName { get; set; }
    
    [Required(ErrorMessage = "Last name is required")]
    public required string LastName { get; set; }
    
    [Required(ErrorMessage = "Username is required")]
    public required string Username { get; set; }
    
    public string? Password { get; set; }
    
    public string? Old_Password { get; set; }
}

public class UpdateProfileResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? Id { get; set; }
    public string? Email { get; set; }
    public string? Username { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Role { get; set; }
    public string? ProfilePhoto { get; set; }
}
