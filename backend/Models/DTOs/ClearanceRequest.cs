using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class IndividualClearanceRequest
{
    [Required(ErrorMessage = "Last name is required")]
    public required string LastName { get; set; }

    [Required(ErrorMessage = "First name is required")]
    public required string FirstName { get; set; }

    public string? MiddleName { get; set; }

    [Required(ErrorMessage = "Age is required")]
    public required string Age { get; set; }

    [Required(ErrorMessage = "Contact is required")]
    public required string Contact { get; set; }

    [Required(ErrorMessage = "OR number is required")]
    public required string OrNo { get; set; }

    [Required(ErrorMessage = "Purpose is required")]
    public required string Purpose { get; set; }
}

public class IndividualClearanceResponse
{
    public string Id { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string? MiddleName { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Age { get; set; } = string.Empty;
    public string Contact { get; set; } = string.Empty;
    public string OrNo { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class BusinessClearanceRequest
{
    [Required(ErrorMessage = "Owner name is required")]
    public required string OwnerName { get; set; }

    [Required(ErrorMessage = "Business name is required")]
    public required string BusinessName { get; set; }

    [Required(ErrorMessage = "Business type is required")]
    public required string BusinessType { get; set; }

    [Required(ErrorMessage = "TIN is required")]
    public required string Tin { get; set; }

    [Required(ErrorMessage = "OR number is required")]
    public required string OrNo { get; set; }
}

public class BusinessClearanceResponse
{
    public string Id { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string BusinessName { get; set; } = string.Empty;
    public string BusinessType { get; set; } = string.Empty;
    public string Tin { get; set; } = string.Empty;
    public string OrNo { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
