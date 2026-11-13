
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using SaftProject.Models;
using SaftHR.API.Models;
using SaftCompany.API.Models;
using SaftFMS.API.Models.FMS;
using SaftHR.API.DAL.Define;
using SaftHR.API.DAL.Transaction;
using SaftHR.API.Interface.Define;
using SaftHR.API.Interface.Transaction;
using SaftFMS.API.DAL.Define;
using SaftFMS.API.Interface.Define;
using SaftFMS.API.DAL.Define.Features;
using SaftFMS.API.Interface.Define.Features;
using SaftFMS.API.DAL.Transaction;
using SaftFMS.API.Interface.Transaction;
using SaftProject.Interface.Login;
using SaftProject.DAL.Login;
using SaftMobile.API.Interface;
using SaftMobile.API.DAL;
using SaftMobile.API.Services;
using SaftCompany.API.Interface.Define;
using SaftCompany.API.DAL.Define;
using SaftCompany.API.Interface.Transaction;
using SaftCompany.API.DAL.Transaction;
// ── Permission System ──
using SaftProject.Filters;
using SaftProject.Interface;
using SaftProject.Services;

// Configure QuestPDF License
QuestPDF.Settings.License = QuestPDF.Infrastructure.LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// ──────────────────────────────────────────────────────────────────────
// SERVICES
// ──────────────────────────────────────────────────────────────────────

builder.Services.AddEndpointsApiExplorer();

// Swagger with Bearer token support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "SaftProject API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name         = "Authorization",
        Type         = SecuritySchemeType.Http,
        Scheme       = "bearer",
        BearerFormat = "JWT",
        In           = ParameterLocation.Header,
        Description  = "Enter your JWT token. Example: Bearer eyJhbGci..."
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// JWT Authentication
var jwtKey    = builder.Configuration["Jwt:Key"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;
var jwtAud    = builder.Configuration["Jwt:Audience"]!;

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAud,
            IssuerSigningKey         = new SymmetricSecurityKey(
                                            Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero   // no grace period on expiry
        };
    });

builder.Services.AddAuthorization();

// ── Permission Engine (User Rights) ──
builder.Services.AddMemoryCache();
builder.Services.AddScoped<IPermissionService, PermissionService>();
builder.Services.AddScoped<SaftHR.API.Interface.ISiteInfoService, SiteInfoService>();

// DbContexts
builder.Services.AddDbContext<CommonDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CommonConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddDbContext<HRMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("HRMSConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddDbContext<CPCRM.API.Models.CRMDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("CRMConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddScoped<CPCRM.API.Interface.ICrmDAL, CPCRM.API.DAL.CrmDAL>();
builder.Services.AddScoped<CPCRM.API.Services.CrmLifecycleService>();
builder.Services.AddScoped<CPCRM.API.Services.SalesOverviewService>();
builder.Services.AddScoped<CPCRM.API.Interface.ICrmAccessService, SaftProject.Services.CrmAccessService>();
builder.Services.AddScoped<CPCRM.API.Services.CrmProjectService>();

builder.Services.AddDbContext<FMSDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("FMSConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddDbContext<CompanyDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("InventoryConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddDbContext<SaftHR.API.Models.Machine.MachineDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MachineConnection"),
        o => o.UseCompatibilityLevel(120)));

builder.Services.AddScoped<SaftHR.API.Interface.Transaction.IAttendanceService, SaftHR.API.Services.AttendanceService>();


// DAL Services
builder.Services.AddScoped<SaftCompany.API.Interface.IPayableReceivableDAL, SaftCompany.API.DAL.PayableReceivableDAL>();
builder.Services.AddScoped<SaftCompany.API.Interface.IChartOfAccountDAL, SaftCompany.API.DAL.ChartOfAccountDAL>();
builder.Services.AddScoped<IItemDAL, ItemDAL>();
builder.Services.AddScoped<IItemReportDAL, ItemReportDAL>();
builder.Services.AddScoped<IInventoryIntelligenceDAL, InventoryIntelligenceDAL>();
builder.Services.AddScoped<IDepartmentDAL, DepartmentDAL>();
builder.Services.AddScoped<ILocationDAL, LocationDAL>();
builder.Services.AddScoped<ISupplierDAL, SupplierDAL>();
builder.Services.AddScoped<IDefineDAL, DefineDAL>();

// Inventory Transaction DAL Services
builder.Services.AddScoped<IDemandTransactionDAL, DemandTransactionDAL>();
builder.Services.AddScoped<IPurchaseOrderTransactionDAL, PurchaseOrderTransactionDAL>();
builder.Services.AddScoped<IStoreReceiveTransactionDAL, StoreReceiveTransactionDAL>();
builder.Services.AddScoped<IStoreIssueTransactionDAL, StoreIssueTransactionDAL>();
builder.Services.AddScoped<IGatePassTransactionDAL, GatePassTransactionDAL>();
builder.Services.AddScoped<ILoginDAL, LoginDAL>();
builder.Services.AddScoped<IAttendanceDAL, AttendanceDAL>();
builder.Services.AddScoped<ILeaveDAL, LeaveDAL>();
builder.Services.AddScoped<ISalaryDAL, SalaryDAL>();
builder.Services.AddScoped<ILoanDAL, LoanDAL>();
builder.Services.AddScoped<ISettlementDAL, SettlementDAL>();
builder.Services.AddScoped<IRestDayDAL, RestDayDAL>();
builder.Services.AddScoped<IDutyTimingDAL, DutyTimingDAL>();
builder.Services.AddScoped<SaftHR.API.Services.HrDashboardService>();
builder.Services.AddScoped<SaftHR.API.Services.LeaveReportService>();
builder.Services.AddScoped<SaftHR.API.Services.EmployeeReportService>();
builder.Services.AddScoped<SaftHR.API.Services.SalaryReportService>();
builder.Services.AddScoped<SaftHR.API.Services.SettlementReportService>();
builder.Services.AddScoped<SaftHR.API.Services.AttendanceReportService>();
builder.Services.AddScoped<SaftHR.API.Services.LoanReportService>();

// FMS Feature DAL Services
builder.Services.AddScoped<IStudentDefineDAL, StudentDefineDAL>();
builder.Services.AddScoped<IClassDefineDAL, ClassDefineDAL>();
builder.Services.AddScoped<ISectionDefineDAL, SectionDefineDAL>();
builder.Services.AddScoped<IConcessionDefineDAL, ConcessionDefineDAL>();
builder.Services.AddScoped<IProfessionDefineDAL, ProfessionDefineDAL>();
builder.Services.AddScoped<ICompanyDefineDAL, CompanyDefineDAL>();
builder.Services.AddScoped<IFeeStructureDefineDAL, FeeStructureDefineDAL>();

// FMS DAL Services
builder.Services.AddScoped<IDefineDALFMS, DefineDALFMS>();
builder.Services.AddScoped<ITeacherCoordinatorEmailDALFMS, TeacherCoordinatorEmailDALFMS>();
builder.Services.AddScoped<IOtherDefineDALFMS, OtherDefineDALFMS>();
builder.Services.AddScoped<IFeeTransactionDAL, FeeTransactionDAL>();
builder.Services.AddScoped<ITeacherClassAssignDAL, TeacherClassAssignDAL>();
builder.Services.AddScoped<IExamMarksDAL, ExamMarksDAL>();
builder.Services.AddScoped<IMatricCambridgeDAL, MatricCambridgeDAL>();
builder.Services.AddScoped<IQuizMCQDAL, QuizMCQDAL>();
builder.Services.AddScoped<IPreSchoolLeavingDAL, PreSchoolLeavingDAL>();
builder.Services.AddScoped<IWarningCommendationDAL, WarningCommendationDAL>();
builder.Services.AddScoped<IFmsHelperDAL, FmsHelperDAL>();
builder.Services.AddScoped<ISummerVocationGradeDAL, SummerVocationGradeDAL>();
builder.Services.AddScoped<ISchoolEventDAL, SchoolEventDAL>();
builder.Services.AddScoped<IComplaintDAL, ComplaintDAL>();
builder.Services.AddScoped<IExaminationReportDAL, ExaminationReportDAL>();
builder.Services.AddScoped<IAssessmentReportDAL, AssessmentReportDAL>();
builder.Services.AddScoped<IAssessmentDAL, AssessmentDAL>();
builder.Services.AddScoped<IAssessmentMarksDAL, AssessmentMarksDAL>();
builder.Services.AddScoped<IAssessmentSubjectTemplateDAL, AssessmentSubjectTemplateDAL>();
builder.Services.AddScoped<IExamSubjectTemplateDAL, ExamSubjectTemplateDAL>();
builder.Services.AddScoped<SaftFMS.API.Interface.Transaction.ITeacherUserMappingService, TeacherUserMappingService>();

// SaftMobile.API Services
builder.Services.AddScoped<IParentDAL, ParentDAL>();
builder.Services.AddScoped<IParentService, ParentService>();
builder.Services.AddScoped<IAnnouncementDAL, AnnouncementDAL>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IPasswordService, SaftProject.Services.MobilePasswordService>();
builder.Services.AddScoped<IEmployeeAuthDAL, EmployeeAuthDAL>();
builder.Services.AddScoped<IEmployeeAuthService, EmployeeAuthService>();
builder.Services.AddScoped<IHrDAL, HrDAL>();
builder.Services.AddScoped<IHrService, HrService>();

// Initialize Firebase Admin SDK (if credentials exist or default env)
try
{
    var firebaseCredentialsPath = builder.Configuration["Firebase:CredentialsPath"];
    if (!string.IsNullOrWhiteSpace(firebaseCredentialsPath) && System.IO.File.Exists(firebaseCredentialsPath))
    {
        FirebaseAdmin.FirebaseApp.Create(new FirebaseAdmin.AppOptions
        {
            Credential = Google.Apis.Auth.OAuth2.GoogleCredential.FromFile(firebaseCredentialsPath)
        });
    }
}
catch (Exception ex)
{
    Console.WriteLine($"[Firebase Init Warning] FirebaseApp could not be initialized at startup: {ex.Message}");
}

// CORS Configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Controllers (all assemblies) + global permission filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<PermissionAuthorizeFilter>();
})
    .AddApplicationPart(typeof(HRMSDbContext).Assembly)
    .AddApplicationPart(typeof(FMSDbContext).Assembly)
    .AddApplicationPart(typeof(ParentDAL).Assembly)
    .AddApplicationPart(typeof(CompanyDbContext).Assembly)
    .AddApplicationPart(typeof(CPCRM.API.Models.CRMDbContext).Assembly);

// ──────────────────────────────────────────────────────────────────────
// MIDDLEWARE PIPELINE
// ──────────────────────────────────────────────────────────────────────

var app = builder.Build();

// Ensure Sch_UserDeviceTokens table exists in FMS database
using (var scope = app.Services.CreateScope())
{
    try
    {
        var fmsDb = scope.ServiceProvider.GetRequiredService<FMSDbContext>();
        var createTableSql = @"
            IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Sch_UserDeviceTokens]') AND type in (N'U'))
            BEGIN
                CREATE TABLE [dbo].[Sch_UserDeviceTokens] (
                    [Id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    [FatherCnic] NVARCHAR(50) NOT NULL,
                    [FcmToken] NVARCHAR(500) NOT NULL,
                    [DeviceType] NVARCHAR(50) NULL,
                    [Site] NVARCHAR(50) NULL,
                    [IsActive] BIT NOT NULL DEFAULT 1,
                    [CreatedAt] DATETIME2 NULL DEFAULT GETDATE(),
                    [UpdatedAt] DATETIME2 NULL DEFAULT GETDATE()
                );
                CREATE INDEX [IX_SchUserDeviceTokens_FatherCnic] ON [dbo].[Sch_UserDeviceTokens]([FatherCnic]);
            END";
        fmsDb.Database.ExecuteSqlRaw(createTableSql);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to auto-create Sch_UserDeviceTokens table.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.Use(async (context, next) =>
{
    context.Response.OnStarting(() =>
    {
        context.Response.Headers["Cache-Control"] = "no-cache, no-store, must-revalidate";
        context.Response.Headers["Pragma"] = "no-cache";
        context.Response.Headers["Expires"] = "0";
        return Task.CompletedTask;
    });
    await next();
});

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (UnauthorizedAccessException) when (!context.Response.HasStarted)
    {
        context.Response.StatusCode = 401;
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync("{\"message\":\"Unauthorized\"}");
    }
    catch (ArgumentException ex) when (!context.Response.HasStarted)
    {
        context.Response.StatusCode = 400;
        context.Response.ContentType = "application/json";
        var json = System.Text.Json.JsonSerializer.Serialize(new { message = ex.Message });
        await context.Response.WriteAsync(json);
    }
});

app.UseAuthentication();   // ← must come before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();
