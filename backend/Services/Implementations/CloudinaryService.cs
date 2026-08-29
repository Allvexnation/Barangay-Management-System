using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using backend.Services.Interfaces;

namespace backend.Services.Implementations;

public class CloudinaryService : ICloudinaryService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_CLOUD_NAME") ?? "your-cloud-name";
        var apiKey = configuration["Cloudinary:ApiKey"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_KEY") ?? "your-api-key";
        var apiSecret = configuration["Cloudinary:ApiSecret"] ?? Environment.GetEnvironmentVariable("CLOUDINARY_API_SECRET") ?? "your-api-secret";

        if (cloudName == "your-cloud-name" || apiKey == "your-api-key" || apiSecret == "your-api-secret")
        {
            throw new Exception("Cloudinary credentials are not configured properly");
        }

        var account = new Account(cloudName, apiKey, apiSecret);

        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ArgumentException("File is empty or null");
        }

        using var stream = file.OpenReadStream();
        
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(file.FileName, stream),
            Transformation = new Transformation()
                .Width(500)
                .Height(500)
                .Crop("fill")
                .Quality("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);

        if (uploadResult.Error != null)
        {
            throw new Exception($"Cloudinary upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task DeleteImageAsync(string publicId)
    {
        var deletionParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deletionParams);
    }
}
