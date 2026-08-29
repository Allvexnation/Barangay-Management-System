using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class AuditLog
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("entityType")]
    public required string EntityType { get; set; }

    [BsonElement("entityId")]
    public required string EntityId { get; set; }

    [BsonElement("action")]
    public required string Action { get; set; }

    [BsonElement("adminId")]
    public required string AdminId { get; set; }

    [BsonElement("adminName")]
    public required string AdminName { get; set; }

    [BsonElement("adminEmail")]
    public required string AdminEmail { get; set; }

    [BsonElement("adminRole")]
    public string? AdminRole { get; set; }

    [BsonElement("changes")]
    public Dictionary<string, object>? Changes { get; set; }

    [BsonElement("previousValues")]
    public Dictionary<string, object>? PreviousValues { get; set; }

    [BsonElement("newValues")]
    public Dictionary<string, object>? NewValues { get; set; }

    [BsonElement("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    [BsonElement("ipAddress")]
    public string? IpAddress { get; set; }

    [BsonElement("userAgent")]
    public string? UserAgent { get; set; }
}
