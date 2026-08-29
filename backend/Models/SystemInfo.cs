using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class SystemInfo
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("barangayName")]
    public required string BarangayName { get; set; }

    [BsonElement("city")]
    public required string City { get; set; }

    [BsonElement("province")]
    public required string Province { get; set; }

    [BsonElement("zipCode")]
    public required string ZipCode { get; set; }

    [BsonElement("logoUrl")]
    public string? LogoUrl { get; set; }

    [BsonElement("logoPublicId")]
    public string? LogoPublicId { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
