using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class HouseholdRequest
{
    [Required(ErrorMessage = "First name is required")]
    public required string FirstName { get; set; }

    [Required(ErrorMessage = "Last name is required")]
    public required string LastName { get; set; }

    public string? MiddleName { get; set; }

    [Required(ErrorMessage = "Contact is required")]
    public required string Contact { get; set; }

    [Required(ErrorMessage = "House number is required")]
    public required string HouseNo { get; set; }

    [Required(ErrorMessage = "Purok ID is required")]
    public required string PurokId { get; set; }

    public string? ImageUrl { get; set; }
}

public class HouseholdResponse
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string HouseNo { get; set; } = string.Empty;
    public string PurokId { get; set; } = string.Empty;
    public string? Purok { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
