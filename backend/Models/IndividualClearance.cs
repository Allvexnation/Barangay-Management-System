using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class IndividualClearance
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("lastName")]
    public required string LastName { get; set; }

    [BsonElement("firstName")]
    public required string FirstName { get; set; }

    [BsonElement("middleName")]
    public string? MiddleName { get; set; }

    [BsonElement("age")]
    public required string Age { get; set; }

    [BsonElement("contact")]
    public required string Contact { get; set; }

    [BsonElement("orNo")]
    public required string OrNo { get; set; }

    [BsonElement("purpose")]
    public required string Purpose { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
