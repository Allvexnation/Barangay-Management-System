using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.Models;

public class Complaint
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("complaintId")]
    public string? ComplaintId { get; set; }

    [BsonElement("complainantName")]
    public required string ComplainantName { get; set; }

    [BsonElement("appellant")]
    public required string Appellant { get; set; }

    [BsonElement("description")]
    public required string Description { get; set; }

    [BsonElement("status")]
    public required string Status { get; set; }

    [BsonElement("dateCreated")]
    public DateTime DateCreated { get; set; } = DateTime.UtcNow;

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
