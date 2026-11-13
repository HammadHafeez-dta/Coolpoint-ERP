# CRM checks

The checks also compare every EF-mapped column against its table's declarations in SQL scripts 00/02, including `CRM_Leads.CustomerName` and `CRM_Leads.Notes`. Regenerate the SSMS model-column check with `dotnet run --project backend/CPCRM.API.Tests/CPCRM.API.Tests.csproj -- --write-schema-check sql/06_crm_model_contract_check.sql`. This generates a file only; it does not connect to SQL Server.

Run `dotnet run --project backend/CPCRM.API.Tests/CPCRM.API.Tests.csproj` from the repository root. This dependency-free executable checks real lifecycle rules, request validation, EF concurrency metadata, generated site-scoped SQL, missing identity, site spoofing and denied rights. It never connects to a database.

Run `node scripts/verify-crm.mjs http://127.0.0.1:5173` from frontend against Vite for browser checks using mocked API responses. Images/results are written to `.taste-skill/crm-check`.

SQL Server integration checks remain required after the supplied scripts are installed in a disposable test database: simultaneous acceptance of different quotations, replay, revision replay, failure between decision and audit save, and rollback of every write. Unit checks and mocked browser responses do not prove database transaction/locking behavior.
