using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using backend.Services.Interfaces;

namespace backend.Services.Implementations;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(string userId, string email, string? firstName = null, string? lastName = null, string? username = null, string? role = null)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
        var issuer = jwtSettings["Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER");
        var audience = jwtSettings["Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE");
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? Environment.GetEnvironmentVariable("JWT_EXPIRATION_MINUTES"));

        if (string.IsNullOrEmpty(secretKey) || string.IsNullOrEmpty(issuer) || string.IsNullOrEmpty(audience))
        {
            throw new Exception("JWT configuration is missing. Please set JWT_SECRET_KEY, JWT_ISSUER, and JWT_AUDIENCE environment variables.");
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(ClaimTypes.NameIdentifier, userId)
        };

        if (!string.IsNullOrEmpty(firstName))
        {
            claims.Add(new Claim("firstName", firstName));
        }
        if (!string.IsNullOrEmpty(lastName))
        {
            claims.Add(new Claim("lastName", lastName));
        }
        if (!string.IsNullOrEmpty(username))
        {
            claims.Add(new Claim("username", username));
        }
        if (!string.IsNullOrEmpty(role))
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
