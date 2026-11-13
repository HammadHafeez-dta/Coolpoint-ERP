using CPCRM.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Text.RegularExpressions;

static class SchemaContract
{
    public static int VerifyDdl(CRMDbContext db)
    {
        var root = new DirectoryInfo(AppContext.BaseDirectory);
        while (root != null && !Directory.Exists(Path.Combine(root.FullName, "sql"))) root = root.Parent;
        if (root == null) throw new Exception("Cannot locate SQL folder.");
        var ddl = File.ReadAllText(Path.Combine(root.FullName, "sql/00_crm_base_tables.sql")) + "\n" +
            File.ReadAllText(Path.Combine(root.FullName, "sql/02_crm_schema.sql")) + "\n" +
            File.ReadAllText(Path.Combine(root.FullName, "sql/09_crm_projects.sql"));
        var columns = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        foreach (Match table in Regex.Matches(ddl, @"CREATE TABLE dbo\.(\w+)\s*\((.*?)\r?\n \);", RegexOptions.Singleline | RegexOptions.IgnoreCase))
            foreach (Match column in Regex.Matches(table.Groups[2].Value, @"\b(\w+)\s+(?:int|nvarchar|decimal|bit|datetime2|rowversion)\b", RegexOptions.IgnoreCase))
                columns.Add(table.Groups[1].Value + "." + column.Groups[1].Value);
        foreach (Match alter in Regex.Matches(ddl, @"ALTER TABLE dbo\.(\w+) ADD (\w+)\s+(?:int|nvarchar|decimal|bit|datetime2|rowversion)\b", RegexOptions.IgnoreCase))
            columns.Add(alter.Groups[1].Value + "." + alter.Groups[2].Value);
        var checks = 0;
        foreach (var entity in db.Model.GetEntityTypes())
        {
            var table = StoreObjectIdentifier.Table(entity.GetTableName()!, entity.GetSchema());
            foreach (var property in entity.GetProperties())
            {
                var column = entity.GetTableName() + "." + property.GetColumnName(table);
                if (!columns.Contains(column)) throw new Exception("SQL scripts do not declare mapped column: " + column);
                checks++;
            }
        }
        return checks;
    }

    public static void Write(string path)
    {
        using var db = new CRMDbContext(new DbContextOptionsBuilder<CRMDbContext>()
            .UseSqlServer("Server=unused;Database=unused;Integrated Security=true;TrustServerCertificate=true").Options);
        var expected = db.Model.GetEntityTypes().OrderBy(e => e.GetTableName()).SelectMany(entity => {
            var table = StoreObjectIdentifier.Table(entity.GetTableName()!, entity.GetSchema());
            return entity.GetProperties().OrderBy(p => p.GetColumnName(table))
                .Select(p => $"(N'{entity.GetTableName()}',N'{p.GetColumnName(table)}')");
        });
        var sql = """
-- Generated from CRMDbContext: every mapped CRM table/column. Read-only.
USE [Coolpoint_CRM];
GO
SET NOCOUNT ON;
IF DB_NAME() <> N'Coolpoint_CRM' THROW 51000, 'Select the intended CRM database.', 1;
SELECT CAST(SERVERPROPERTY('ServerName') AS nvarchar(128)) AS ServerName, DB_NAME() AS DatabaseName;
DECLARE @Expected TABLE(TableName sysname NOT NULL, ColumnName sysname NOT NULL);
INSERT @Expected(TableName,ColumnName) VALUES
""" + "\n" + string.Join(",\n", expected) + ";\n" + """
SELECT e.TableName,e.ColumnName AS MissingColumn
FROM @Expected e
WHERE NOT EXISTS (
 SELECT 1 FROM sys.tables t JOIN sys.schemas s ON s.schema_id=t.schema_id
 JOIN sys.columns c ON c.object_id=t.object_id
 WHERE s.name=N'dbo' AND t.name=e.TableName AND c.name=e.ColumnName
)
ORDER BY e.TableName,e.ColumnName;
DECLARE @Missing nvarchar(max) = N'';
SELECT @Missing = @Missing + CASE WHEN LEN(@Missing)>0 THEN N', ' ELSE N'' END
 + QUOTENAME(e.TableName) + N'.' + QUOTENAME(e.ColumnName)
FROM @Expected e WHERE NOT EXISTS (
  SELECT 1 FROM sys.tables t JOIN sys.schemas s ON s.schema_id=t.schema_id
  JOIN sys.columns c ON c.object_id=t.object_id
  WHERE s.name=N'dbo' AND t.name=e.TableName AND c.name=e.ColumnName
)
ORDER BY e.TableName,e.ColumnName;
IF LEN(@Missing)>0
BEGIN
 DECLARE @Message nvarchar(2048) = LEFT(N'CRM schema mismatch in ' + QUOTENAME(DB_NAME())
  + N'. Missing: ' + @Missing + N'. No changes made by this check.',2048);
 THROW 51002, @Message, 1;
END;
PRINT 'All EF-mapped CRM tables and columns are present. This checks existence, not types, permissions or lifecycle transactions.';
""";
        File.WriteAllText(path, sql);
    }
}
