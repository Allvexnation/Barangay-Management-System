using MongoDB.Driver;
using backend.Models;

namespace backend.Repositories.Interfaces;

public interface IMongoDbContext
{
    IMongoCollection<AdminUser> AdminUsers { get; }
    IMongoCollection<Household> Households { get; }
    IMongoCollection<Purok> Puroks { get; }
    IMongoCollection<Official> Officials { get; }
    IMongoCollection<Position> Positions { get; }
    IMongoCollection<IndividualClearance> IndividualClearances { get; }
    IMongoCollection<BusinessClearance> BusinessClearances { get; }
    IMongoCollection<Complaint> Complaints { get; }
    IMongoCollection<SystemInfo> SystemInfos { get; }
    IMongoCollection<AuditLog> AuditLogs { get; }
}
