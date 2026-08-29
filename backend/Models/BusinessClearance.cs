using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class BusinessClearance
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("ownerName")]
    public required string OwnerName { get; set; }

    [BsonElement("businessName")]
    public required string BusinessName { get; set; }

    [BsonElement("businessType")]
    public required string BusinessType { get; set; }

    [BsonElement("tin")]
    public required string Tin { get; set; }

    [BsonElement("orNo")]
    public required string OrNo { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
