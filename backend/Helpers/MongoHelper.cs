using MongoDB.Bson;

namespace backend.Helpers;

public static class MongoHelper
{
    public static bool IsValidObjectId(string id)
    {
        return ObjectId.TryParse(id, out _);
    }

    public static ObjectId? ToObjectId(string id)
    {
        if (ObjectId.TryParse(id, out var objectId))
        {
            return objectId;
        }
        return null;
    }
}
