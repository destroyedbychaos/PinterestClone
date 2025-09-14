using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using PinterestClone.BLL.Services.AuthService;
using PinterestClone.BLL.Services.BoardService;
using PinterestClone.BLL.Services.ImageService;
using PinterestClone.BLL.Services.JwtService;
using PinterestClone.BLL.Services.PinService;
using PinterestClone.BLL.Services.SmsService;
using PinterestClone.BLL.Services.PhoneService;
using PinterestClone.BLL.Services.NotificationService;
using PinterestClone.BLL.Services.PinShareService;
using PinterestClone.BLL.Services.PinReportService;
using PinterestClone.BLL.Services.ProfileReportService;
using PinterestClone.BLL.Services.UserBlockService;
using PinterestClone.BLL.Services.EmailService;
using PinterestClone.BLL.Services.PasswordResetService;
using PinterestClone.BLL.Services.HiddenPinService;
using PinterestClone.BLL.Services.ImageAnalysisService;
using PinterestClone.BLL.Services.ImageSearchService;
using PinterestClone.BLL.Services.PinViewHistoryService;
using PinterestClone.DAL.Data;
using PinterestClone.DAL.Models.Identity;
using PinterestClone.DAL.Repositories.BoardRepository;
using PinterestClone.DAL.Repositories.PinRepository;
using PinterestClone.DAL.Repositories.UserRepository;
using PinterestClone.DAL.Repositories.PinShareRepository;
using PinterestClone.DAL.Repositories.PinReportRepository;
using PinterestClone.DAL.Repositories.ProfileReportRepository;
using PinterestClone.DAL.Repositories.UserBlockRepository;
using PinterestClone.DAL.Repositories.PasswordResetRepository;
using PinterestClone.DAL.Repositories.HiddenPinRepository;
using PinterestClone.DAL.Repositories.PinViewHistoryRepository;
using System.Text;
using System;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using PinterestClone.BLL.MappingProfiles;
using PinterestClone.BLL.Services.UserService;
using PinterestClone.BLL.Services.FileBlobService;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors();

// HTTP Client для внешних API
builder.Services.AddHttpClient();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Pinterest Clone API",
        Version = "v1",
        Description = "API для клона Pinterest",
        Contact = new OpenApiContact
        {
            Name = "Pinterest Clone Team"
        }
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredUniqueChars = 0;
    options.Password.RequireDigit = false;
    options.Password.RequiredLength = 6;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["AuthSettings:key"] ?? throw new InvalidOperationException("JWT key not found"))),
        ValidIssuer = builder.Configuration["AuthSettings:issuer"],
        ValidAudience = builder.Configuration["AuthSettings:audience"],
        ClockSkew = TimeSpan.FromMinutes(5)
    };
    
});

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IBoardRepository, BoardRepository>();
builder.Services.AddScoped<IPinRepository, PinRepository>();
builder.Services.AddScoped<IPinService, PinService>();
builder.Services.AddScoped<IBoardService, BoardService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<ISmsService, SmsService>();
builder.Services.AddScoped<IPhoneService, PhoneService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPinShareRepository, PinShareRepository>();
builder.Services.AddScoped<IPinReportRepository, PinReportRepository>();
builder.Services.AddScoped<IProfileReportRepository, ProfileReportRepository>();
builder.Services.AddScoped<IUserBlockRepository, UserBlockRepository>();
builder.Services.AddScoped<IPinShareService, PinShareService>();
builder.Services.AddScoped<IPinReportService, PinReportService>();
builder.Services.AddScoped<IProfileReportService, ProfileReportService>();
builder.Services.AddScoped<IUserBlockService, UserBlockService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IPasswordResetRepository, PasswordResetRepository>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<IHiddenPinRepository, HiddenPinRepository>();
builder.Services.AddScoped<IHiddenPinService, HiddenPinService>();
builder.Services.AddScoped<IImageAnalysisService, ImageAnalysisService>();
builder.Services.AddScoped<IImageSearchService, ImageSearchService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddSingleton<IFileService, FileService>();

//AutoMapper
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddMaps(typeof(PinMappingProfile).Assembly);
    cfg.AddMaps(typeof(BoardMappingProfile).Assembly);
    cfg.AddMaps(typeof(DeviceServicesMappingProfile).Assembly);
    cfg.AddMaps(typeof(UserMappingProfile).Assembly);
    cfg.AddMaps(typeof(PinViewHistoryMappingProfile).Assembly);
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pinterest Clone API v1");
        c.RoutePrefix = "swagger";
        c.DocumentTitle = "Pinterest Clone API Documentation";
        c.DefaultModelsExpandDepth(-1);
        c.DisplayRequestDuration();
        c.EnableDeepLinking();
        c.EnableFilter();
        c.ShowExtensions();
    });
}


app.UseCors(policy => policy
    .AllowAnyOrigin()
    .AllowAnyMethod()
    .AllowAnyHeader()
    .SetIsOriginAllowed(_ => true));

app.Use(async (context, next) =>
{
    context.Response.Headers.Add("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    await next();
});

app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
       
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ctx.Context.Response.Headers.Add("Access-Control-Allow-Headers", "*");
        
        if (ctx.File.Name.EndsWith(".png") || ctx.File.Name.EndsWith(".jpg") || 
            ctx.File.Name.EndsWith(".jpeg") || ctx.File.Name.EndsWith(".gif") || 
            ctx.File.Name.EndsWith(".webp"))
        {
            ctx.Context.Response.Headers.Add("Cache-Control", "public, max-age=86400");
        }
    }
});

app.UseHttpsRedirection();



app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
