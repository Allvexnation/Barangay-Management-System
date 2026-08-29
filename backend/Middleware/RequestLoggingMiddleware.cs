namespace backend.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var startTime = DateTime.UtcNow;
        
        _logger.LogInformation("HTTP {Method} {Path} started at {StartTime}", 
            context.Request.Method, 
            context.Request.Path, 
            startTime);

        try
        {
            await _next(context);
        }
        finally
        {
            var endTime = DateTime.UtcNow;
            var duration = endTime - startTime;
            
            _logger.LogInformation("HTTP {Method} {Path} completed with status {StatusCode} in {Duration}ms", 
                context.Request.Method, 
                context.Request.Path, 
                context.Response.StatusCode, 
                duration.TotalMilliseconds);
        }
    }
}
