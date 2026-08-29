using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class AdminUser
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("email")]
    public required string Email { get; set; }

    [BsonElement("username")]
    public string? Username { get; set; }

    [BsonElement("passwordHash")]
    public required string PasswordHash { get; set; }

    [BsonElement("firstName")]
    public required string FirstName { get; set; }

    [BsonElement("lastName")]
    public required string LastName { get; set; }

    [BsonElement("role")]
    public string Role { get; set; } = "Staff";

    [BsonElement("photoUrl")]
    public string? PhotoUrl { get; set; }

    [BsonElement("isActive")]
    public bool IsActive { get; set; } = true;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
