using System.ComponentModel.DataAnnotations;

namespace backend.Models.DTOs;

public class ComplaintRequest
{
    [Required(ErrorMessage = "Complainant name is required")]
    public required string ComplainantName { get; set; }

    [Required(ErrorMessage = "Appellant is required")]
    public required string Appellant { get; set; }

    [Required(ErrorMessage = "Description is required")]
    public required string Description { get; set; }

    [Required(ErrorMessage = "Status is required")]
    public required string Status { get; set; }
}

public class ComplaintResponse
{
    public string Id { get; set; } = string.Empty;
    public string ComplaintId { get; set; } = string.Empty;
    public string ComplainantName { get; set; } = string.Empty;
    public string Appellant { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime DateCreated { get; set; }
}
