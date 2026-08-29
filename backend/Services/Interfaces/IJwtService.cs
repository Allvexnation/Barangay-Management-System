namespace backend.Services.Interfaces;

public interface IJwtService
{
    string GenerateToken(string userId, string email, string? firstName = null, string? lastName = null, string? username = null, string? role = null);
}
