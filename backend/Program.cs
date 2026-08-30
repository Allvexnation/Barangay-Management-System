using backend.Repositories.Interfaces;
using backend.Repositories.Implementations;
using backend.Services.Interfaces;
using backend.Services.Implementations;
using backend.Services;
using backend.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var mongoDbConnectionString = builder.Configuration.GetConnectionString("MongoDb") 
    ?? Environment.GetEnvironmentVariable("MONGODB_URI");
builder.Services.AddSingleton<IMongoDbContext, MongoDbContext>();

builder.Services.AddScoped<IJwtService, JwtService>();

builder.Services.AddScoped<AdminSeeder>();

builder.Services.AddScoped<ICloudinaryService, CloudinaryService>();

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] ?? Environment.GetEnvironmentVariable("JWT_SECRET_KEY");
var issuer = jwtSettings["Issuer"] ?? Environment.GetEnvironmentVariable("JWT_ISSUER");
var audience = jwtSettings["Audience"] ?? Environment.GetEnvironmentVariable("JWT_AUDIENCE");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = false,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontendOnly", policy =>
    {
        policy.WithOrigins(
                "https://barangaypiodelpilarmakati.netlify.app",
                "https://barangaypiodelpilarmakati.vercel.app",
                "http://127.0.0.2:5500",
                "https://mlb-goes-edt-beverage.trycloudflare.com"
            )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var adminSeeder = scope.ServiceProvider.GetRequiredService<AdminSeeder>();
    await adminSeeder.SeedAdminUserAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseMiddleware<ResponseHeadersMiddleware>();

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseRouting();

app.UseCors("AllowFrontendOnly");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

var publicPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "frontend", "public");
if (Directory.Exists(publicPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(publicPath),
        RequestPath = ""
    });
}

var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (Directory.Exists(uploadsPath))
{
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(uploadsPath),
        RequestPath = ""
    });
}

app.MapStaticAssets();

app.MapControllers();

app.Run();
