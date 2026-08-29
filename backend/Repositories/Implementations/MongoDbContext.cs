using MongoDB.Driver;
using backend.Data;
using backend.Repositories.Interfaces;

namespace backend.Repositories.Implementations;

public class MongoDbContext : backend.Data.MongoDbContext, IMongoDbContext
{
    public MongoDbContext(IConfiguration configuration) : base(CreateDatabase(configuration))
    {
    }

    private static IMongoDatabase CreateDatabase(IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MongoDb") 
            ?? Environment.GetEnvironmentVariable("MONGODB_URI");
        var client = new MongoClient(connectionString);
        return client.GetDatabase("barangay_pio_del_pilar_db");
    }
}
