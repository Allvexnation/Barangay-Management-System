using backend.Repositories.Interfaces;
using backend.Models;
using MongoDB.Driver;
using BCrypt.Net;

namespace backend.Services;

public class AdminSeeder
{
    private readonly IMongoDbContext _context;

    public AdminSeeder(IMongoDbContext context)
    {
        _context = context;
    }

    public async Task SeedAdminUserAsync()
    {
        var existingAdmin = await _context.AdminUsers
            .Find(u => u.Email == "admin@barangaypiodelpilar.gov")
            .FirstOrDefaultAsync();

        if (existingAdmin == null)
        {
            var adminUser = new AdminUser
            {
                Email = "admin@barangaypiodelpilar.gov",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
                FirstName = "Barangay",
                LastName = "Admin",
                Role = "Admin",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _context.AdminUsers.InsertOneAsync(adminUser);
            Console.WriteLine("Admin user seeded successfully");
        }
        else
        {
            Console.WriteLine("Admin user already exists");
        }
    }
}
