using MongoDB.Driver;
using backend.Models;

namespace backend.Data;

public abstract class MongoDbContext
{
    protected readonly IMongoDatabase _database;

    protected MongoDbContext(IMongoDatabase database)
    {
        _database = database;
    }

    public IMongoCollection<AdminUser> AdminUsers => 
        _database.GetCollection<AdminUser>("admin_users");
    
    public IMongoCollection<Household> Households => 
        _database.GetCollection<Household>("households");
    
    public IMongoCollection<Purok> Puroks => 
        _database.GetCollection<Purok>("puroks");
    
    public IMongoCollection<Official> Officials => 
        _database.GetCollection<Official>("officials");
    
    public IMongoCollection<Position> Positions => 
        _database.GetCollection<Position>("positions");
    
    public IMongoCollection<IndividualClearance> IndividualClearances => 
        _database.GetCollection<IndividualClearance>("individual_clearances");
    
    public IMongoCollection<BusinessClearance> BusinessClearances => 
        _database.GetCollection<BusinessClearance>("business_clearances");
    
    public IMongoCollection<Complaint> Complaints => 
        _database.GetCollection<Complaint>("complaints");
    
    public IMongoCollection<SystemInfo> SystemInfos => 
        _database.GetCollection<SystemInfo>("system_infos");
    
    public IMongoCollection<AuditLog> AuditLogs => 
        _database.GetCollection<AuditLog>("audit_logs");
}
