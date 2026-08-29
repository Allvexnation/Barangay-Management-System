using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Household
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("firstName")]
    public required string FirstName { get; set; }

    [BsonElement("lastName")]
    public required string LastName { get; set; }

    [BsonElement("middleName")]
    public string? MiddleName { get; set; }

    [BsonElement("contact")]
    public required string Contact { get; set; }

    [BsonElement("houseNo")]
    public required string HouseNo { get; set; }

    [BsonElement("purokId")]
    public required string PurokId { get; set; }

    [BsonElement("purok")]
    public string? Purok { get; set; }

    [BsonElement("imageUrl")]
    public string? ImageUrl { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
