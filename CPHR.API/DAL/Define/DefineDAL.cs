using Microsoft.EntityFrameworkCore;
using SaftHR.API.DTO.Define;
using SaftHR.API.Interface.Define;
using SaftHR.API.Models;
using SaftHR.API.Utilities;

namespace SaftHR.API.DAL.Define
{
    public class DefineDAL : IDefineDAL
    {
        private readonly HRMSDbContext _db;

        public DefineDAL(HRMSDbContext db)
        {
            _db = db;
        }

        // ══════════════════════════════════════════════════════════════════════
        // EMPLOYEE
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> EmpMaxNoAsync(string site)
        {
            var max = await _db.Employees
                .Where(u => u.Site == site)
                .Select(p => (int?)p.EmpCardNo)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<string> EmpInTimeAsync(int empCardNo)
        {
            return await _db.Employees
                .Where(u => u.EmpCardNo == empCardNo)
                .Select(u => u.InTime)
                .FirstOrDefaultAsync() ?? "";
        }

        public async Task SaveEmployeeAsync(EmployeeRequestDto dto, string site, string userId)
        {
            var temp = await _db.Employees
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new Employee
                {
                    EmpCardNo = dto.EmpCardNo,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.Employees.Add(temp);
            }
            else
            {
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            static string Trunc(string? val, int maxLen)
            {
                if (string.IsNullOrEmpty(val)) return "";
                return val.Length <= maxLen ? val : val.Substring(0, maxLen);
            }

            temp.EmpOldCardNo = dto.EmpOldCardNo;

            temp.FirstName = Trunc(dto.FirstName, 150);
            temp.MiddleName = Trunc(dto.MiddleName, 150);
            temp.LastName = Trunc(dto.LastName, 150);

            var nameParts = new[] { dto.FirstName, dto.MiddleName, dto.LastName }
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Select(s => s!.Trim())
                .ToArray();

            if (nameParts.Length > 0)
            {
                temp.EmpName = Trunc(string.Join(" ", nameParts), 150);
            }
            else
            {
                // Fallback for legacy clients sending only EmpName
                temp.EmpName = Trunc(dto.EmpName, 150);
            }

            temp.EmpFatherName = Trunc(dto.EmpFatherName, 150);
            temp.Category = Trunc(dto.EmpCategory, 50);
            if (dto.LocationCode.HasValue) temp.LocationCode = dto.LocationCode.Value;
            if (dto.Unit != null) temp.Unit = Trunc(dto.Unit, 10);
            if (dto.City != null) temp.City = Trunc(dto.City, 10);
            if (dto.Region != null) temp.Region = Trunc(dto.Region, 50);
            if (dto.EmpPrefix != null) temp.EmpPrefix = Trunc(dto.EmpPrefix, 10);
            temp.SalaryUnit = Trunc(dto.SalaryUnit, 50);
            temp.DeptCode = dto.DepartmentCode;
            temp.DesgCode = dto.DesignationCode;
            if (dto.GradeID.HasValue) temp.GradeId = dto.GradeID;
            if (dto.Section != null) temp.Section = Trunc(dto.Section, 50);
            temp.PositionTitle = Trunc(dto.PositionTitle, 50);
            temp.Qualification = Trunc(dto.Qualification, 500);
            temp.Certification = Trunc(dto.Certification, 500);
            temp.Experience = Trunc(dto.Experience, 500);
            if (dto.Experience2 != null) temp.Experience2 = Trunc(dto.Experience2, 500);
            temp.Address = Trunc(dto.Address, 500);
            if (dto.TemporaryAddress != null) temp.TemporaryAddress = Trunc(dto.TemporaryAddress, 500);
            temp.Remarks = Trunc(dto.Remarks, 500);
            temp.Email = Trunc(dto.Email, 50);
            if (dto.EmailPersonal != null) temp.EmailPersonal = Trunc(dto.EmailPersonal, 50);
            temp.InTime = Trunc(dto.InTime, 20);
            temp.OutTime = Trunc(dto.OutTime, 20);
            temp.ReportingTiming = Trunc(dto.ReportingTiming, 20);
            temp.WorkingHours = dto.WorkingHours;

            // Safe formatting for Sex: max 2 chars (e.g., "M", "F", "Male" -> "M")
            var sexVal = dto.EmpSex?.Trim() ?? "";
            if (sexVal.Equals("Male", StringComparison.OrdinalIgnoreCase)) sexVal = "M";
            else if (sexVal.Equals("Female", StringComparison.OrdinalIgnoreCase)) sexVal = "F";
            temp.Sex = Trunc(sexVal, 2);

            temp.Cnic = Trunc(dto.EmpCNIC, 50);
            temp.Shift = Trunc(dto.EmpShift, 2);
            temp.BirthDate = dto.BirthDate;
            temp.JoiningDate = dto.JoiningDate;
            temp.ConfirmationDate = dto.ConfirmationDate;
            if (dto.ContractExpiryDate.HasValue) temp.ContractExpiryDate = dto.ContractExpiryDate;
            else if (dto.ClearContractExpiryDate) temp.ContractExpiryDate = null;
            if (dto.CardExpiryDate.HasValue) temp.CardExpiryDate = dto.CardExpiryDate;
            else if (dto.ClearCardExpiryDate) temp.CardExpiryDate = null;
            temp.BloodGroup = Trunc(dto.BloodGroup, 10);
            temp.MaritalStatus = Trunc(dto.MaritalStatus, 50);
            temp.BankId = dto.BankID;
            temp.BankAccount = Trunc(dto.BankAccount, 50);
            temp.EmpStatus = Trunc(dto.EmpType, 50);
            temp.PhoneNo = Trunc(dto.PhoneNo, 150);
            temp.EmergencyNo = Trunc(dto.EmergencyNo, 50);
            temp.ExtensionNo = Trunc(dto.ExtensionNo, 50);
            temp.Dependents = Trunc(dto.Dependents, 50);
            temp.IsEobi = dto.IsEOBI;
            temp.EobiNo = Trunc(dto.EOBINo, 13);
            temp.IsSs = dto.IsSS;
            temp.SsNo = Trunc(dto.SSNo, 13);
            temp.RestDay = string.IsNullOrWhiteSpace(dto.RestDay) ? "D:0" : Trunc(dto.RestDay, 15);
            temp.IsOverTime = dto.OverTime;
            if (dto.IsCompliance.HasValue) temp.IsCompliance = dto.IsCompliance;
            if (dto.RelaxationTime.HasValue) temp.RelaxationTime = dto.RelaxationTime;
            temp.Status = dto.Status;
            temp.EmpPicture = dto.EmpPicture;
            temp.Scale = Trunc(dto.Scale, 50);
            temp.Religion = Trunc(dto.Religion, 50);

            if (temp.EnterBy != null) temp.EnterBy = Trunc(temp.EnterBy, 10);
            if (temp.EditBy != null) temp.EditBy = Trunc(temp.EditBy, 10);

            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteEmployeeAsync(int empCardNo, string site)
        {
            try
            {
                var salary = await _db.EmpSalaries.FirstOrDefaultAsync(s => s.EmpCardNo == empCardNo && s.Site == site);
                if (salary != null)
                {
                    _db.EmpSalaries.Remove(salary);
                }

                var emp = await _db.Employees.FirstOrDefaultAsync(e => e.EmpCardNo == empCardNo && e.Site == site);
                if (emp != null)
                {
                    _db.Employees.Remove(emp);
                }

                await _db.SaveChangesAsync();
                return true;
            }
            catch
            {
                try
                {
                    await _db.Database.ExecuteSqlRawAsync("DELETE FROM Emp_Salary WHERE Emp_Card_No = {0} AND Site = {1}", empCardNo, site);
                    await _db.Database.ExecuteSqlRawAsync("DELETE FROM Employee WHERE Emp_Card_No = {0} AND Site = {1}", empCardNo, site);
                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }

        public async Task SaveEmployeeSalaryAsync(EmployeeSalaryDto dto, string site, string userId)
        {
            var temp = await _db.EmpSalaries
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new EmpSalary { EmpCardNo = dto.EmpCardNo, Site = site, EnterBy = userId };
                _db.EmpSalaries.Add(temp);
            }
            else
            {
                temp.EnterBy = userId;
            }

            temp.GrossPay = dto.GrossPay;
            temp.BasicPay = dto.BasicPay;
            temp.SalLec = dto.SalLec;
            temp.A01 = dto.A01; temp.A02 = dto.A02; temp.A03 = dto.A03;
            temp.A04 = dto.A04; temp.A05 = dto.A05; temp.A06 = dto.A06;
            temp.A07 = dto.A07; temp.A08 = dto.A08; temp.A09 = dto.A09;
            temp.A10 = dto.A10; temp.A11 = dto.A11; temp.A12 = dto.A12;
            temp.D01 = dto.D01; temp.D02 = dto.D02; temp.D03 = dto.D03;
            temp.D04 = dto.D04; temp.D05 = dto.D05; temp.D06 = dto.D06;
            temp.D07 = dto.D07; temp.D08 = dto.D08; temp.D09 = dto.D09;
            temp.D10 = dto.D10; temp.D11 = dto.D11;
            if (dto.D12.HasValue) temp.D12 = dto.D12;
            temp.NetPay = dto.NetPay;
            temp.PfSchoolShare = dto.PFSchoolShare;
            temp.EobiSchoolShare = dto.EOBISchoolShare;

            await _db.SaveChangesAsync();
        }

        public async Task SaveEmployeeSalaryIncrementAsync(EmployeeSalaryIncrementDto dto, string site, string userId)
        {
            var temp = await _db.HrmSalaryIncrements
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.IncrementDate == dto.IncrementDate && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new HrmSalaryIncrement
                {
                    EmpCardNo = dto.EmpCardNo,
                    IncrementDate = dto.IncrementDate,
                    Site = site,
                    EnterBy = userId,
                    EnteryTime = DateTime.Now
                };
                _db.HrmSalaryIncrements.Add(temp);
            }
            else
            {
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
            }

            temp.Increment = dto.Increment;
            temp.OldBasicPay = dto.OldBasicPay;
            temp.CurrentBasicPay = dto.BasicPay;
            temp.A01 = dto.A01;
            temp.A10 = dto.A10;
            temp.D01 = dto.D01;
            temp.OldGrossPay = dto.OldGrossPay;
            temp.CurrentGrossPay = dto.GrossPay;

            await _db.SaveChangesAsync();
        }

        public async Task<List<HrmVewSalaryIncrementDto>> GetEmployeeSalaryIncrementAsync(DateTime incrementDate, string site)
        {
            return await _db.HrmVewSalaryIncrements
                .Where(u => u.IncrementDate == incrementDate && u.Site == site)
                .OrderBy(o => o.EmpCardNo)
                .Select(u => new HrmVewSalaryIncrementDto
                {
                    EmpCardNo = u.EmpCardNo,
                    EmpName = u.EmpName,
                    IncrementDate = u.IncrementDate,
                    Increment = u.Increment,
                    OldBasicPay = u.OldBasicPay,
                    CurrentBasicPay = u.CurrentBasicPay,
                    OldGrossPay = u.OldGrossPay,
                    CurrentGrossPay = u.CurrentGrossPay,
                    Site = u.Site
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteEmployeeSalaryIncrementAsync(DateTime incrementDate)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM HRM_SalaryIncrement WHERE Increment_Date={0}", incrementDate);
                return true;
            }
            catch { return false; }
        }

        public async Task UpdateEmployeeSalaryAsync(EmployeeSalaryDto dto, string site)
        {
            var temp = await _db.EmpSalaries
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp != null)
            {
                temp.BasicPay = dto.BasicPay;
                temp.A01 = dto.A01;
                temp.A10 = dto.A10;
                temp.D01 = dto.D01;
                await _db.SaveChangesAsync();
            }

            await _db.Database.ExecuteSqlRawAsync(
                "UPDATE Emp_Salary SET Gross_Pay=Basic_Pay+ISNULL(A01,0)+ISNULL(A02,0)+ISNULL(A03,0)+ISNULL(A04,0)+ISNULL(A05,0)+ISNULL(A06,0)+ISNULL(A07,0)+ISNULL(A08,0)+ISNULL(A09,0)+ISNULL(A10,0)+ISNULL(A11,0)+ISNULL(A12,0)");
            await _db.Database.ExecuteSqlRawAsync(
                "UPDATE Emp_Salary SET Net_Pay=Gross_Pay-ISNULL(D01,0)-ISNULL(D02,0)-ISNULL(D03,0)-ISNULL(D04,0)-ISNULL(D05,0)-ISNULL(D06,0)-ISNULL(D07,0)-ISNULL(D08,0)-ISNULL(D09,0)-ISNULL(D10,0)-ISNULL(D11,0)-ISNULL(D12,0)");
        }

        public async Task<EmployeeResponseDto?> GetEmployeeInfoAsync(int empId, string site)
        {
            var response = await _db.VewEmployees
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .Select(u => new EmployeeResponseDto
                {
                    EmpCardNo = u.EmpCardNo,
                    EmpOldCardNo = u.EmpOldCardNo ?? 0,
                    EmpName = u.EmpName ?? "",
                    FirstName = u.FirstName,
                    MiddleName = u.MiddleName,
                    LastName = u.LastName,
                    EmpFatherName = u.EmpFatherName ?? "",
                    EmpCategory = u.Category ?? "",
                    LocationCode = u.LocationCode ?? 0,
                    SalaryUnit = u.SalaryUnit ?? "",
                    DepartmentCode = u.DeptCode ?? 0,
                    DepartmentName = u.DepartmentName ?? "",
                    DesignationCode = u.DesgCode ?? 0,
                    DesignationName = u.DesignationName ?? "",
                    Religion = u.Religion,
                    PositionTitle = u.PositionTitle ?? "",
                    Qualification = u.Qualification ?? "",
                    Certification = u.Certification ?? "",
                    Experience = u.Experience ?? "",
                    Address = u.Address ?? "",
                    Remarks = u.Remarks ?? "",
                    Email = u.Email ?? "",
                    InTime = u.InTime ?? "",
                    OutTime = u.OutTime ?? "",
                    ReportingTiming = u.ReportingTiming ?? "",
                    WorkingHours = u.WorkingHours ?? 0,
                    EmpSex = u.Sex ?? "",
                    EmpCNIC = u.Cnic ?? "",
                    EmpShift = u.Shift ?? "",
                    BirthDate = u.BirthDate ?? DateTime.Today,
                    JoiningDate = u.JoiningDate ?? DateTime.Today,
                    ConfirmationDate = u.ConfirmationDate ?? DateTime.Today,
                    BloodGroup = u.BloodGroup ?? "",
                    MaritalStatus = u.MaritalStatus ?? "",
                    BankID = u.BankId ?? 0,
                    BankName = u.BankName ?? "",
                    BankAccount = u.BankAccount ?? "",
                    EmpType = u.EmpStatus ?? "",
                    PhoneNo = u.PhoneNo ?? "",
                    EmergencyNo = u.EmergencyNo ?? "",
                    ExtensionNo = u.ExtensionNo ?? "",
                    Dependents = u.Dependents ?? "",
                    IsEOBI = u.IsEobi ?? false,
                    EOBINo = u.EobiNo ?? "",
                    IsSS = u.IsSs ?? false,
                    SSNo = u.SsNo ?? "",
                    RestDay = RestDaySchedule.Format(u.RestDay),
                    OverTime = u.IsOverTime ?? false,
                    Status = u.Status ?? false,
                    EmpPicture = u.EmpPicture,
                    Scale = u.Scale ?? "",
                    LeftType = u.LeftType ?? "",
                    StruckOff = u.StuckOff ?? false,
                    StruckOffDate = u.StuckOffDate ?? DateTime.Today,
                    GradeID = u.Grade ?? 0,
                    Grade = u.GradeName ?? "",
                    GrossPay = u.GrossPay ?? 0,
                    IsSalaryBlocked = u.IsSalaryBlocked ?? false,
                })
                .FirstOrDefaultAsync();

            if (response == null) return null;

            var employee = await _db.Employees
                .AsNoTracking()
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .Select(u => new
                {
                    u.Unit,
                    u.City,
                    u.Region,
                    u.EmpPrefix,
                    u.GradeId,
                    GradeName = _db.Grades
                        .Where(grade => grade.GradeCode == u.GradeId)
                        .Select(grade => grade.GradeName)
                        .FirstOrDefault(),
                    u.Section,
                    u.Experience2,
                    u.TemporaryAddress,
                    u.EmailPersonal,
                    u.ContractExpiryDate,
                    u.CardExpiryDate,
                    u.IsCompliance,
                    u.RelaxationTime
                })
                .FirstOrDefaultAsync();

            if (employee != null)
            {
                response.Unit = employee.Unit ?? "";
                response.City = employee.City ?? "";
                response.Region = employee.Region ?? "";
                response.EmpPrefix = employee.EmpPrefix ?? "";
                response.GradeID = employee.GradeId ?? response.GradeID;
                response.Grade = employee.GradeName ?? response.Grade;
                response.Section = employee.Section ?? "";
                response.Experience2 = employee.Experience2 ?? "";
                response.TemporaryAddress = employee.TemporaryAddress ?? "";
                response.EmailPersonal = employee.EmailPersonal ?? "";
                response.ContractExpiryDate = employee.ContractExpiryDate;
                response.CardExpiryDate = employee.CardExpiryDate;
                response.IsCompliance = employee.IsCompliance ?? false;
                response.RelaxationTime = employee.RelaxationTime ?? 0;
            }

            return response;
        }

        public async Task<EmployeeResponseDto?> GetEmployeeInfoLittleAsync(int empId, string site)
        {
            return await _db.VewEmployees
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .Select(u => new EmployeeResponseDto
                {
                    EmpCardNo = u.EmpCardNo,
                    EmpOldCardNo = u.EmpOldCardNo ?? 0,
                    EmpName = u.EmpName ?? "",
                    FirstName = u.FirstName,
                    MiddleName = u.MiddleName,
                    LastName = u.LastName,
                    EmpFatherName = u.EmpFatherName ?? "",
                    EmpCategory = u.Category ?? "",
                    EmpType = u.EmpStatus ?? "",
                    GradeID = u.Grade ?? 0,
                    Grade = u.GradeName ?? "",
                    WorkingHours = u.WorkingHours ?? 0,
                    Religion = u.Religion,
                    SalaryUnit = u.SalaryUnit ?? "",
                    DesignationCode = u.DesgCode ?? 0,
                    DepartmentName = u.DepartmentName ?? "",
                    DesignationName = u.DesignationName ?? "",
                    EmpShift = u.Shift ?? "",
                    RestDay = RestDaySchedule.Format(u.RestDay),
                    InTime = u.InTime ?? "",
                    OutTime = u.OutTime ?? "",
                    ReportingTiming = u.ReportingTiming ?? "",
                    JoiningDate = u.JoiningDate ?? DateTime.Today,
                    PhoneNo = u.PhoneNo ?? "",
                    LeftType = u.LeftType ?? "",
                    OverTime = u.IsOverTime ?? false,
                    StruckOff = u.StuckOff ?? false,
                    StruckOffDate = u.StuckOffDate ?? DateTime.Today,
                    Status = u.Status ?? false,
                    GrossPay = u.GrossPay ?? 0,
                    Scale = u.Scale ?? "",
                })
                .FirstOrDefaultAsync();
        }

        public async Task<EmployeeSalaryDto?> GetEmployeeSalaryInfoAsync(int empId, string site)
        {
            return await _db.EmpSalaries
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .Select(u => new EmployeeSalaryDto
                {
                    EmpCardNo = u.EmpCardNo,
                    GrossPay = u.GrossPay ?? 0,
                    BasicPay = u.BasicPay ?? 0,
                    SalLec = u.SalLec ?? 0,
                    A01 = u.A01 ?? 0, A02 = u.A02 ?? 0, A03 = u.A03 ?? 0,
                    A04 = u.A04 ?? 0, A05 = u.A05 ?? 0, A06 = u.A06 ?? 0,
                    A07 = u.A07 ?? 0, A08 = u.A08 ?? 0, A09 = u.A09 ?? 0,
                    A10 = u.A10 ?? 0, A11 = u.A11 ?? 0, A12 = u.A12 ?? 0,
                    D01 = u.D01 ?? 0, D02 = u.D02 ?? 0, D03 = u.D03 ?? 0,
                    D04 = u.D04 ?? 0, D05 = u.D05 ?? 0, D06 = u.D06 ?? 0,
                    D07 = u.D07 ?? 0, D08 = u.D08 ?? 0, D09 = u.D09 ?? 0,
                    D10 = u.D10 ?? 0, D11 = u.D11 ?? 0, D12 = u.D12 ?? 0,
                    NetPay = u.NetPay ?? 0,
                    PFSchoolShare = u.PfSchoolShare ?? 0,
                    EOBISchoolShare = u.EobiSchoolShare ?? 0,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> UpdateEmployeeStruckOffAsync(EmployeeStruckOffDto dto, string site)
        {
            var temp = await _db.Employees
                .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                .FirstOrDefaultAsync();
            if (temp == null) return false;

            temp.LeftType = dto.LeftType;
            temp.StuckOff = dto.StruckOff;
            temp.StuckOffDate = dto.StruckOffDate;
            temp.Status = dto.Deactivate;
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task UpdateEmployeeTimingsAsync(EmployeeTimingsDto dto, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "UPDATE Employee SET In_Time={0}, Out_Time={1}, Reporting_Timing={2}, Working_Hours={3} WHERE Status=1 AND Dept_Code={4} AND Site={5}",
                dto.InTime, dto.OutTime, dto.ReportingTiming, dto.WorkingHours, dto.DepartmentCode, site);
        }

        public async Task UpdateEmployeeRestDayAsync(EmployeeRestDayDto dto, string site)
        {
            await _db.Database.ExecuteSqlRawAsync(
                "UPDATE Employee SET Rest_Day={0} WHERE Status=1 AND Dept_Code={1} AND Site={2}",
                dto.RestDay, dto.DepartmentCode, site);
        }

        public async Task<int> GetEmployeeNosAsync(string site)
        {
            return await _db.Employees.CountAsync(u => u.Site == site);
        }

        public async Task<List<EmployeeResponseDto>> GetEmployeeListAsync(EmployeeListRequestDto request, string site)
        {
            var query = _db.VewEmployees.Where(u => u.Site == site);

            query = request.Type switch
            {
                "Employee Name Wise" => query.Where(u => u.EmpName!.Contains(request.Name)),
                "Department Wise" => query.Where(u => u.DeptCode == request.Id).OrderBy(o => o.EmpCardNo),
                "Designation Wise" => query.Where(u => u.DesignationName!.Contains(request.Name)),
                "Scale Wise" => query.Where(u => u.Scale == request.Name),
                "Employee Card Wise" => query.Where(u => u.EmpCardNo == request.Id).OrderBy(o => o.EmpCardNo),
                _ => query.OrderBy(o => o.EmpCardNo)
            };

            return await query.Select(u => new EmployeeResponseDto
            {
                EmpCardNo = u.EmpCardNo,
                EmpOldCardNo = u.EmpOldCardNo ?? 0,
                EmpName = u.EmpName ?? "",
                FirstName = u.FirstName,
                MiddleName = u.MiddleName,
                LastName = u.LastName,
                EmpFatherName = u.EmpFatherName ?? "",
                EmpCategory = u.Category ?? "",
                LocationCode = u.LocationCode ?? 0,
                SalaryUnit = u.SalaryUnit ?? "",
                DepartmentCode = u.DeptCode ?? 0,
                DepartmentName = u.DepartmentName ?? "",
                DesignationCode = u.DesgCode ?? 0,
                DesignationName = u.DesignationName ?? "",
                Religion = u.Religion,
                PositionTitle = u.PositionTitle ?? "",
                Qualification = u.Qualification ?? "",
                Certification = u.Certification ?? "",
                Experience = u.Experience ?? "",
                Address = u.Address ?? "",
                Remarks = u.Remarks ?? "",
                Email = u.Email ?? "",
                InTime = u.InTime ?? "",
                OutTime = u.OutTime ?? "",
                ReportingTiming = u.ReportingTiming ?? "",
                WorkingHours = u.WorkingHours ?? 0,
                EmpSex = u.Sex ?? "",
                EmpCNIC = u.Cnic ?? "",
                EmpShift = u.Shift ?? "",
                BirthDate = u.BirthDate ?? DateTime.Today,
                JoiningDate = u.JoiningDate ?? DateTime.Today,
                ConfirmationDate = u.ConfirmationDate ?? DateTime.Today,
                BloodGroup = u.BloodGroup ?? "",
                MaritalStatus = u.MaritalStatus ?? "",
                BankID = u.BankId ?? 0,
                BankName = u.BankName ?? "",
                BankAccount = u.BankAccount ?? "",
                EmpType = u.EmpStatus ?? "",
                PhoneNo = u.PhoneNo ?? "",
                EmergencyNo = u.EmergencyNo ?? "",
                ExtensionNo = u.ExtensionNo ?? "",
                Dependents = u.Dependents ?? "",
                IsEOBI = u.IsEobi ?? false,
                EOBINo = u.EobiNo ?? "",
                IsSS = u.IsSs ?? false,
                SSNo = u.SsNo ?? "",
                RestDay = RestDaySchedule.Format(u.RestDay),
                OverTime = u.IsOverTime ?? false,
                Status = u.Status ?? false,
                Scale = u.Scale ?? "",
                LeftType = u.LeftType ?? "",
                StruckOff = u.StuckOff ?? false,
                StruckOffDate = u.StuckOffDate ?? DateTime.Today,
                GradeID = u.Grade ?? 0,
                Grade = u.GradeName ?? "",
                GrossPay = u.GrossPay ?? 0,
                IsSalaryBlocked = u.IsSalaryBlocked ?? false,
            }).ToListAsync();
        }
        
        public async Task<List<EmployeeResponseDto>> GetStaffRosterReportAsync(string? search, string? category, string site)
        {
            var query = _db.VewEmployees.Where(u => u.Site == site);

            if (!string.IsNullOrWhiteSpace(category))
            {
                if (category.Equals("Teaching", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(u => 
                        (u.Category != null && !u.Category.Contains("Non") && (u.Category.Contains("Teacher") || u.Category.Contains("Teaching") || u.Category.Contains("Teach"))) ||
                        (
                            (u.Category == null || (!u.Category.Contains("Non") && !u.Category.Contains("Teacher") && !u.Category.Contains("Teaching") && !u.Category.Contains("Teach"))) &&
                            (
                                (u.DepartmentName != null && !u.DepartmentName.Contains("Non") && (u.DepartmentName.Contains("Teacher") || u.DepartmentName.Contains("Teaching") || u.DepartmentName.Contains("Teach"))) ||
                                (u.DesignationName != null && !u.DesignationName.Contains("Non") && (u.DesignationName.Contains("Teacher") || u.DesignationName.Contains("Teaching") || u.DesignationName.Contains("Teach")))
                            )
                        )
                    );
                }
                else if (category.Equals("Non-Teaching", StringComparison.OrdinalIgnoreCase) || category.Equals("Non Teaching", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(u => 
                        (u.Category != null && u.Category.Contains("Non")) ||
                        (u.DepartmentName != null && u.DepartmentName.Contains("Non")) ||
                        (u.DesignationName != null && u.DesignationName.Contains("Non")) ||
                        (
                            (u.Category == null || (!u.Category.Contains("Teacher") && !u.Category.Contains("Teaching") && !u.Category.Contains("Teach"))) &&
                            (u.DepartmentName == null || (!u.DepartmentName.Contains("Teacher") && !u.DepartmentName.Contains("Teaching") && !u.DepartmentName.Contains("Teach"))) &&
                            (u.DesignationName == null || (!u.DesignationName.Contains("Teacher") && !u.DesignationName.Contains("Teaching") && !u.DesignationName.Contains("Teach")))
                        )
                    );
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                search = search.ToLower();
                query = query.Where(u => (u.EmpName != null && u.EmpName.ToLower().Contains(search)) ||
                                        (u.DesignationName != null && u.DesignationName.ToLower().Contains(search)) ||
                                        (u.DepartmentName != null && u.DepartmentName.ToLower().Contains(search)) ||
                                        u.EmpCardNo.ToString().Contains(search));
            }

            return await query.OrderBy(o => o.EmpCardNo)
                .Select(u => new EmployeeResponseDto
                {
                    EmpCardNo = u.EmpCardNo,
                    EmpOldCardNo = u.EmpOldCardNo ?? 0,
                    EmpName = u.EmpName ?? "",
                    EmpFatherName = u.EmpFatherName ?? "",
                    EmpCategory = u.Category ?? "",
                    LocationCode = u.LocationCode ?? 0,
                    SalaryUnit = u.SalaryUnit ?? "",
                    DepartmentCode = u.DeptCode ?? 0,
                    DepartmentName = u.DepartmentName ?? "",
                    DesignationCode = u.DesgCode ?? 0,
                    DesignationName = u.DesignationName ?? "",
                    Religion = u.Religion,
                    PositionTitle = u.PositionTitle ?? "",
                    Qualification = u.Qualification ?? "",
                    Certification = u.Certification ?? "",
                    Experience = u.Experience ?? "",
                    Address = u.Address ?? "",
                    Remarks = u.Remarks ?? "",
                    Email = u.Email ?? "",
                    InTime = u.InTime ?? "",
                    OutTime = u.OutTime ?? "",
                    ReportingTiming = u.ReportingTiming ?? "",
                    WorkingHours = (int)(u.WorkingHours ?? 0),
                    EmpSex = u.Sex ?? "",
                    EmpCNIC = u.Cnic ?? "",
                    EmpShift = u.Shift ?? "",
                    BirthDate = u.BirthDate ?? DateTime.Today,
                    JoiningDate = u.JoiningDate ?? DateTime.Today,
                    ConfirmationDate = u.ConfirmationDate ?? DateTime.Today,
                    BloodGroup = u.BloodGroup ?? "",
                    MaritalStatus = u.MaritalStatus ?? "",
                    BankID = u.BankId ?? 0,
                    BankAccount = u.BankAccount ?? "",
                    EmpType = u.EmpStatus ?? "",
                    PhoneNo = u.PhoneNo ?? "",
                    EmergencyNo = u.EmergencyNo ?? "",
                    ExtensionNo = u.ExtensionNo ?? "",
                    Dependents = u.Dependents ?? "",
                    IsEOBI = u.IsEobi ?? false,
                    EOBINo = u.EobiNo ?? "",
                    IsSS = u.IsSs ?? false,
                    SSNo = u.SsNo ?? "",
                    RestDay = RestDaySchedule.Format(u.RestDay),
                    OverTime = u.IsOverTime ?? false,
                    Status = u.Status ?? false,
                    Scale = u.Scale ?? "",
                    LeftType = u.LeftType ?? "",
                    StruckOff = u.StuckOff ?? false,
                    StruckOffDate = u.StuckOffDate ?? DateTime.Today,
                    GradeID = u.Grade ?? 0,
                    Grade = u.GradeName ?? "",
                    GrossPay = u.GrossPay ?? 0,
                    IsSalaryBlocked = u.IsSalaryBlocked ?? false,
                }).ToListAsync();
        }

        public async Task UpdateEmployeeSalaryBlockedAsync(EmployeeSalaryBlockDto dto, string userId)
        {
            var temp = await _db.Employees.Where(u => u.EmpCardNo == dto.EmpCardNo).FirstOrDefaultAsync();
            if (temp != null)
            {
                temp.IsSalaryBlocked = dto.IsSalaryBlocked;
                temp.EditBy = userId;
                temp.EditTime = DateTime.Now;
                await _db.SaveChangesAsync();
            }
        }

        public async Task<List<ContractExpiryAlertDto>> GetContractExpiryAlertsAsync(string site)
        {
            var employees = await _db.Employees
                .Where(e => e.Site == site && e.Status == true && (e.EmpStatus == "Contract" || e.EmpStatus == "Contractual"))
                .Select(e => new
                {
                    e.EmpCardNo,
                    e.EmpName,
                    e.EmpStatus,
                    e.JoiningDate,
                    DeptName = _db.Departments.Where(d => d.DepartmentCode == e.DeptCode && d.Site == site).Select(d => d.DepartmentName).FirstOrDefault() ?? "",
                    DesigName = _db.Designations.Where(d => d.DesignationCode == e.DesgCode && d.Site == site).Select(d => d.DesignationName).FirstOrDefault() ?? ""
                })
                .ToListAsync();

            var today = DateTime.Today;
            var alerts = employees.Select(e =>
            {
                var joiningDate = e.JoiningDate ?? today;
                var nextExpiry = joiningDate.AddYears(1);
                while (nextExpiry < today)
                {
                    nextExpiry = nextExpiry.AddYears(1);
                }
                var daysRemaining = (nextExpiry - today).Days;

                return new ContractExpiryAlertDto
                {
                    EmpCardNo = e.EmpCardNo,
                    EmpName = e.EmpName ?? "",
                    EmpStatus = e.EmpStatus ?? "Contract",
                    JoiningDate = joiningDate,
                    ExpiryDate = nextExpiry,
                    DaysRemaining = daysRemaining,
                    DepartmentName = e.DeptName,
                    DesignationName = e.DesigName
                };
            })
            .Where(a => a.DaysRemaining <= 90)
            .OrderBy(a => a.DaysRemaining)
            .ToList();

            return alerts;
        }

        // ══════════════════════════════════════════════════════════════════════
        // EMPLOYEE OPENING BALANCES
        // ══════════════════════════════════════════════════════════════════════

        public async Task<EmployeeOpeningBalancesDto?> GetEmployeeOpeningBalancesAsync(int empId, string site)
        {
            return await _db.EmpOpeningBalances
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .Select(u => new EmployeeOpeningBalancesDto
                {
                    EmpCardNo = u.EmpCardNo,
                    OpeningDate = u.OpeningDate ?? DateTime.Now,
                    EOBIOpening = u.EobiOpening ?? 0,
                    SSOpening = u.SocialSecurityOpening ?? 0,
                    PFundOpening = u.ProvidantFundOpening ?? 0,
                })
                .FirstOrDefaultAsync();
        }

        public async Task<bool> SaveEmployeeOpeningBalancesAsync(EmployeeOpeningBalancesDto dto, string site, string userId)
        {
            try
            {
                var temp = await _db.EmpOpeningBalances
                    .Where(u => u.EmpCardNo == dto.EmpCardNo && u.Site == site)
                    .FirstOrDefaultAsync();

                if (temp == null)
                {
                    temp = new EmpOpeningBalance
                    {
                        EmpCardNo = dto.EmpCardNo,
                        Site = site,
                        EnterBy = userId,
                        EnteryTime = DateTime.Now
                    };
                    _db.EmpOpeningBalances.Add(temp);
                }
                else
                {
                    temp.EditBy = userId;
                    temp.EditTime = DateTime.Now;
                }

                temp.OpeningDate = dto.OpeningDate;
                temp.EobiOpening = dto.EOBIOpening;
                temp.SocialSecurityOpening = dto.SSOpening;
                temp.ProvidantFundOpening = dto.PFundOpening;

                await _db.SaveChangesAsync();
                return true;
            }
            catch { return false; }
        }

        public async Task<decimal> GetPFundOpeningAsync(int empId, string site)
        {
            return await _db.EmpOpeningBalances
                .Where(u => u.EmpCardNo == empId && u.Site == site)
                .SumAsync(p => p.ProvidantFundOpening ?? 0);
        }

        // ══════════════════════════════════════════════════════════════════════
        // DEPARTMENT
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetDepartmentMaxNoAsync(string site)
        {
            var max = await _db.Departments
                .Where(u => u.Site == site)
                .Select(p => (int?)p.DepartmentCode)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveDepartmentAsync(DepartmentRequestDto dto, string site)
        {
            var temp = await _db.Departments
                .Where(u => u.DepartmentCode == dto.DepartmentNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                _db.Departments.Add(new Department
                {
                    DepartmentCode = dto.DepartmentNo,
                    DepartmentName = dto.DepartmentName,
                    Site = site
                });
            }
            else
            {
                temp.DepartmentCode = dto.DepartmentNo;
                temp.DepartmentName = dto.DepartmentName;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<DepartmentResponseDto?> GetDepartmentAsync(int departmentId, string site)
        {
            return await _db.Departments
                .Where(u => u.DepartmentCode == departmentId && u.Site == site)
                .Select(u => new DepartmentResponseDto
                {
                    DepartmentNo = u.DepartmentCode,
                    DepartmentName = u.DepartmentName ?? ""
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<DepartmentResponseDto>> GetDepartmentListAsync(string site)
        {
            return await _db.Departments
                .Where(u => u.Site == site)
                .OrderBy(o => o.DepartmentName)
                .Select(u => new DepartmentResponseDto
                {
                    DepartmentNo = u.DepartmentCode,
                    DepartmentName = u.DepartmentName ?? ""
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteDepartmentAsync(int departmentId, string site)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Department WHERE Department_Code={0} AND Site={1}", departmentId, site);
                return true;
            }
            catch { return false; }
        }

        // ══════════════════════════════════════════════════════════════════════
        // DESIGNATION
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetDesignationMaxNoAsync(string site)
        {
            var max = await _db.Designations
                .Where(u => u.Site == site)
                .Select(p => (int?)p.DesignationCode)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task<int> SaveDesignationAsync(DesignationRequestDto dto, string site)
        {
            var temp = await _db.Designations
                .Where(u => u.DesignationCode == dto.DesignationNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                temp = new Designation
                {
                    DesignationCode = dto.DesignationNo,
                    DesignationName = dto.DesignationName,
                    Grade = dto.GradeID,
                    Site = site
                };
                _db.Designations.Add(temp);
            }
            else
            {
                temp.DesignationName = dto.DesignationName;
                temp.Grade = dto.GradeID;
            }

            await _db.SaveChangesAsync();
            return temp.DesignationCode;
        }

        public async Task<DesignationResponseDto?> GetDesignationAsync(int designationId, string site)
        {
            return await _db.Designations
                .Where(u => u.DesignationCode == designationId && u.Site == site)
                .Select(u => new DesignationResponseDto
                {
                    DesignationNo = u.DesignationCode,
                    DesignationName = u.DesignationName ?? "",
                    GradeID = u.Grade ?? 0
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<DesignationResponseDto>> GetDesignationListAsync(string site)
        {
            return await _db.Designations
                .Where(u => u.Site == site)
                .OrderBy(o => o.DesignationName)
                .Select(u => new DesignationResponseDto
                {
                    DesignationNo = u.DesignationCode,
                    DesignationName = u.DesignationName ?? "",
                    GradeID = u.Grade ?? 0
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteDesignationAsync(int designationId, string site)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Designation WHERE Designation_Code={0} AND Site={1}", designationId, site);
                return true;
            }
            catch { return false; }
        }

        // ══════════════════════════════════════════════════════════════════════
        // LOCATION
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetLocationMaxNoAsync()
        {
            var max = await _db.Locations.Select(p => (int?)p.LocationCode).MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveLocationAsync(LocationRequestDto dto)
        {
            var temp = await _db.Locations.Where(u => u.LocationCode == dto.LocationNo).FirstOrDefaultAsync();
            if (temp == null)
            {
                _db.Locations.Add(new Location { LocationCode = dto.LocationNo, LocationName = dto.LocationName });
            }
            else
            {
                temp.LocationName = dto.LocationName;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<LocationResponseDto?> GetLocationAsync(int locationId)
        {
            return await _db.Locations
                .Where(u => u.LocationCode == locationId)
                .Select(u => new LocationResponseDto { LocationNo = u.LocationCode, LocationName = u.LocationName ?? "" })
                .FirstOrDefaultAsync();
        }

        public async Task<List<LocationResponseDto>> GetLocationsListAsync()
        {
            return await _db.Locations
                .OrderBy(o => o.LocationName)
                .Select(u => new LocationResponseDto { LocationNo = u.LocationCode, LocationName = u.LocationName ?? "" })
                .ToListAsync();
        }

        public async Task<List<SalaryUnitResponseDto>> GetSalaryUnitsListAsync(CancellationToken cancellationToken)
        {
            return await _db.SalaryUnits
                .AsNoTracking()
                .Where(unit => unit.UnitName != null)
                .OrderBy(unit => unit.UnitName)
                .Select(unit => new SalaryUnitResponseDto(unit.UnitId, unit.UnitName!))
                .ToListAsync(cancellationToken);
        }

        // ══════════════════════════════════════════════════════════════════════
        // GRADE
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetGradeMaxNoAsync()
        {
            var max = await _db.Grades.Select(p => (int?)p.GradeCode).MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveGradeAsync(GradeRequestDto dto)
        {
            var temp = await _db.Grades.Where(u => u.GradeCode == dto.GradeNo).FirstOrDefaultAsync();
            if (temp == null)
            {
                _db.Grades.Add(new Grade
                {
                    GradeCode = dto.GradeNo,
                    GradeName = dto.GradeName,
                    MinimumSalary = dto.MinimumSalary,
                    MaximumSalary = dto.MaximumSalary
                });
            }
            else
            {
                temp.GradeName = dto.GradeName;
                temp.MinimumSalary = dto.MinimumSalary;
                temp.MaximumSalary = dto.MaximumSalary;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<GradeResponseDto?> GetGradeAsync(int gradeId)
        {
            return await _db.Grades
                .Where(u => u.GradeCode == gradeId)
                .Select(u => new GradeResponseDto
                {
                    GradeNo = u.GradeCode,
                    GradeName = u.GradeName ?? "",
                    MinimumSalary = u.MinimumSalary ?? 0,
                    MaximumSalary = u.MaximumSalary ?? 0
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<GradeResponseDto>> GetGradesListAsync()
        {
            return await _db.Grades
                .OrderBy(o => o.GradeName)
                .Select(u => new GradeResponseDto
                {
                    GradeNo = u.GradeCode,
                    GradeName = u.GradeName ?? "",
                    MinimumSalary = u.MinimumSalary ?? 0,
                    MaximumSalary = u.MaximumSalary ?? 0
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteGradeAsync(int gradeId)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM Grade WHERE Grade_Code={0}", gradeId);
                return true;
            }
            catch { return false; }
        }

        // ══════════════════════════════════════════════════════════════════════
        // SHIFT
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetShiftMaxNoAsync()
        {
            var max = await _db.Shifts.Select(p => (int?)p.ShiftId).MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveShiftAsync(ShiftRequestDto dto)
        {
            var temp = await _db.Shifts.Where(u => u.ShiftId == dto.ShiftNo).FirstOrDefaultAsync();
            if (temp == null)
            {
                _db.Shifts.Add(new Shift { ShiftId = dto.ShiftNo, ShiftType = dto.ShiftType, ShiftName = dto.ShiftName });
            }
            else
            {
                temp.ShiftType = dto.ShiftType;
                temp.ShiftName = dto.ShiftName;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<ShiftResponseDto?> GetShiftAsync(int shiftId)
        {
            return await _db.Shifts
                .Where(u => u.ShiftId == shiftId)
                .Select(u => new ShiftResponseDto { ShiftNo = u.ShiftId, ShiftType = u.ShiftType ?? "", ShiftName = u.ShiftName ?? "" })
                .FirstOrDefaultAsync();
        }

        public async Task<List<ShiftResponseDto>> GetShiftsListAsync()
        {
            return await _db.Shifts
                .OrderBy(o => o.ShiftType)
                .Select(u => new ShiftResponseDto { ShiftNo = u.ShiftId, ShiftType = u.ShiftType ?? "", ShiftName = u.ShiftName ?? "" })
                .ToListAsync();
        }

        // ══════════════════════════════════════════════════════════════════════
        // BANK
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetBankMaxNoAsync()
        {
            var max = await _db.Banks.Select(p => (int?)p.BankCode).MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveBankAsync(BankRequestDto dto)
        {
            var temp = await _db.Banks.Where(u => u.BankCode == dto.BankNo).FirstOrDefaultAsync();
            if (temp == null)
            {
                _db.Banks.Add(new Bank { BankCode = dto.BankNo, BankName = dto.BankName });
            }
            else
            {
                temp.BankName = dto.BankName;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<BankResponseDto?> GetBankAsync(int bankId)
        {
            return await _db.Banks
                .Where(u => u.BankCode == bankId)
                .Select(u => new BankResponseDto { BankNo = u.BankCode, BankName = u.BankName ?? "" })
                .FirstOrDefaultAsync();
        }

        public async Task<List<BankResponseDto>> GetBanksListAsync()
        {
            return await _db.Banks
                .OrderBy(o => o.BankName)
                .Select(u => new BankResponseDto { BankNo = u.BankCode, BankName = u.BankName ?? "" })
                .ToListAsync();
        }

        // ══════════════════════════════════════════════════════════════════════
        // SCALE
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetScaleMaxNoAsync(string site)
        {
            var max = await _db.HrmScales
                .Where(u => u.Site == site)
                .Select(p => (int?)p.ScaleId)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveScaleAsync(ScaleRequestDto dto, string site)
        {
            var temp = await _db.HrmScales
                .Where(u => u.ScaleId == dto.ScaleId && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                _db.HrmScales.Add(new HrmScale
                {
                    ScaleId = dto.ScaleId,
                    ScaleName = dto.ScaleName,
                    Site = site
                });
            }
            else
            {
                temp.ScaleName = dto.ScaleName;
            }
            await _db.SaveChangesAsync();
        }

        public async Task<ScaleResponseDto?> GetScaleAsync(int scaleId, string site)
        {
            return await _db.HrmScales
                .Where(u => u.ScaleId == scaleId && u.Site == site)
                .Select(u => new ScaleResponseDto
                {
                    ScaleId = u.ScaleId,
                    ScaleName = u.ScaleName,
                    Site = u.Site
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<ScaleResponseDto>> GetScaleListAsync(string site)
        {
            return await _db.HrmScales
                .Where(u => u.Site == site)
                .OrderBy(o => o.ScaleId)
                .Select(u => new ScaleResponseDto { ScaleId = u.ScaleId, ScaleName = u.ScaleName, Site = u.Site })
                .ToListAsync();
        }

        public async Task<bool> DeleteScaleAsync(int scaleId, string site)
        {
            try
            {
                await _db.Database.ExecuteSqlRawAsync(
                    "DELETE FROM HRM_Scale WHERE Scale_ID={0} AND Site={1}", scaleId, site);
                return true;
            }
            catch { return false; }
        }

        // ══════════════════════════════════════════════════════════════════════
        // CATEGORY
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetCategoryMaxNoAsync(string site)
        {
            var max = await _db.HrmCategories
                .Where(u => u.Site == site)
                .Select(p => (int?)p.CategoryCode)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveCategoryAsync(CategoryRequestDto dto, string site, string? userId = null)
        {
            var temp = await _db.HrmCategories
                .Where(u => u.CategoryCode == dto.CategoryNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                _db.HrmCategories.Add(new HrmCategory
                {
                    CategoryCode = dto.CategoryNo,
                    CategoryName = dto.CategoryName,
                    Site = site,
                    EnterBy = userId ?? ""
                });
            }
            else
            {
                temp.CategoryName = dto.CategoryName;
                if (!string.IsNullOrEmpty(userId))
                {
                    temp.EnterBy = userId;
                }
            }

            await _db.SaveChangesAsync();
        }

        public async Task<CategoryResponseDto?> GetCategoryAsync(int categoryId, string site)
        {
            return await _db.HrmCategories
                .Where(u => u.CategoryCode == categoryId && u.Site == site)
                .Select(u => new CategoryResponseDto
                {
                    CategoryNo = u.CategoryCode,
                    CategoryName = u.CategoryName ?? ""
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<CategoryResponseDto>> GetCategoryListAsync(string site)
        {
            return await _db.HrmCategories
                .Where(u => u.Site == site)
                .OrderBy(o => o.CategoryName)
                .Select(u => new CategoryResponseDto
                {
                    CategoryNo = u.CategoryCode,
                    CategoryName = u.CategoryName ?? ""
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteCategoryAsync(int categoryId, string site)
        {
            try
            {
                var item = await _db.HrmCategories
                    .Where(u => u.CategoryCode == categoryId && u.Site == site)
                    .FirstOrDefaultAsync();
                if (item != null)
                {
                    _db.HrmCategories.Remove(item);
                    await _db.SaveChangesAsync();
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // STATUS
        // ══════════════════════════════════════════════════════════════════════

        public async Task<int> GetStatusMaxNoAsync(string site)
        {
            var max = await _db.HrmStatuses
                .Where(u => u.Site == site)
                .Select(p => (int?)p.StatusCode)
                .MaxAsync() ?? 0;
            return max + 1;
        }

        public async Task SaveStatusAsync(StatusRequestDto dto, string site, string? userId = null)
        {
            var temp = await _db.HrmStatuses
                .Where(u => u.StatusCode == dto.StatusNo && u.Site == site)
                .FirstOrDefaultAsync();

            if (temp == null)
            {
                _db.HrmStatuses.Add(new HrmStatus
                {
                    StatusCode = dto.StatusNo,
                    StatusName = dto.StatusName,
                    Site = site,
                    EnterBy = userId ?? ""
                });
            }
            else
            {
                temp.StatusName = dto.StatusName;
                if (!string.IsNullOrEmpty(userId))
                {
                    temp.EnterBy = userId;
                }
            }

            await _db.SaveChangesAsync();
        }

        public async Task<StatusResponseDto?> GetStatusAsync(int statusId, string site)
        {
            return await _db.HrmStatuses
                .Where(u => u.StatusCode == statusId && u.Site == site)
                .Select(u => new StatusResponseDto
                {
                    StatusNo = u.StatusCode,
                    StatusName = u.StatusName ?? ""
                })
                .FirstOrDefaultAsync();
        }

        public async Task<List<StatusResponseDto>> GetStatusListAsync(string site)
        {
            return await _db.HrmStatuses
                .Where(u => u.Site == site)
                .OrderBy(o => o.StatusName)
                .Select(u => new StatusResponseDto
                {
                    StatusNo = u.StatusCode,
                    StatusName = u.StatusName ?? ""
                })
                .ToListAsync();
        }

        public async Task<bool> DeleteStatusAsync(int statusId, string site)
        {
            try
            {
                var item = await _db.HrmStatuses
                    .Where(u => u.StatusCode == statusId && u.Site == site)
                    .FirstOrDefaultAsync();
                if (item != null)
                {
                    _db.HrmStatuses.Remove(item);
                    await _db.SaveChangesAsync();
                    return true;
                }
                return false;
            }
            catch
            {
                return false;
            }
        }
    }
}
