import api from '@/shared/services/api';
import axios from 'axios';
import { encodeRestDaySchedule, formatRestDaySchedule } from '../utils/restDaySchedule';

export interface Employee {
    deptId: any;
    empCardNo: number;
    site: string;
    unit?: string;
    employeeUnit?: string;
    salaryUnit?: string;
    city?: string;
    region?: string;
    gradeId?: number;
    gradeName?: string;
    section?: string;
    shift?: string;
    empOldNo?: string;
    empPrefix?: string;
    empName?: string;
    firstName?: string;
    middleName?: string;
    lastName?: string;
    empFatherName?: string;
    empMotherName?: string;
    departmentCode?: string;
    deptName?: string;
    designationCode?: number;
    designationName?: string;
    qualification?: string;
    certification?: string;
    experience?: string;
    experience2?: string;
    temporaryAddress?: string;
    permanentAddress?: string;
    address?: string;
    remarks?: string;
    emailPersonal?: string;
    emailCompany?: string;
    email?: string;
    employeeCategory?: string;
    employmentStatus?: string;
    bankId?: number;
    bankName?: string;
    bankAccount?: string;
    bankSalaryStatus?: boolean;
    gender?: string;
    cnicType?: string;
    cnicNo?: string;
    maritalStatus?: string;
    bloodGroup?: string;
    phoneNo?: string;
    emergencyNo?: string;
    extensionNo?: string;
    birthDate?: string;
    joiningDate?: string;
    confirmationDate?: string;
    contractExpiryDate?: string;
    cardExpiryDate?: string;
    timeInDefine?: string;
    timeOutDefine?: string;
    reportingTimingDefine?: string;
    workingHours?: number;
    religion?: string;
    restDay?: string;
    eobiStatus?: boolean;
    eobiNo?: string;
    socialSecurityStatus?: boolean;
    socialSecurityNo?: string;
    overTimeStatus?: boolean;
    complianceStatus?: boolean;
    relaxationTime?: number;
    specialDutyStatus?: boolean;
    outdoorDutyStatus?: boolean;
    singleMachineStatus?: boolean;
    dualMachineStatus?: boolean;
    guardianName?: string;
    guardianCnic?: string;
    status?: boolean;
    stuckOffStatus?: boolean;
    stuckOffDate?: string;
    leftType?: string;
    resigned?: boolean;
    resignDate?: string;
    approved?: boolean;
    rejected?: boolean;
    reInstated?: boolean;
    reInstatedDate?: string;
    finalSettlementStatus?: boolean;
    salaryBankCash?: boolean;
    location?: string;
    providentFundStatus?: boolean;
    securityDeduction?: boolean;
    ramzanTimeInDefine?: string;
    ramzanTimeOutDefine?: string;
    ramzanWorkingHours?: number;
    accomodation?: boolean;
    bonus?: boolean;
    idCardIssueDate?: string;
    isHod?: boolean;
    isToken?: boolean;
    tokenCategory?: string;
    tokenAmount?: number;
    empPicture?: string;
    branchCode?: string;
    branchName?: string;
    passportNumber?: string;
    policeVerification?: string;
    cnicImage?: string;
    category: string;
    scale?: string;
    salary?: EmployeeSalary;
    educations?: EmployeeEducation[];
    histories?: EmployeeHistory[];
    dependents?: string | EmployeeDependent[];
    benefits?: EmployeeBenefit[];
    relatives?: EmployeeRelative[];
    nextToKins?: EmployeeNextToKin[];
    scanDocuments?: EmployeeScanDocument[];
    jobDescription?: EmployeeJobDescription;
}

export interface EmployeeSalary {
    grossPay?: number;
    basicPay?: number;
    startingPay?: number;
    salLec?: number;
    a01?: number; a02?: number; a03?: number; a04?: number; a05?: number; a06?: number;
    a07?: number; a08?: number; a09?: number; a10?: number; a11?: number; a12?: number;
    d01?: number; d02?: number; d03?: number; d04?: number; d05?: number; d06?: number;
    d07?: number; d08?: number; d09?: number; d10?: number; d11?: number; d12?: number;
    d13?: number; d14?: number; d15?: number; d16?: number; d17?: number; d18?: number;
    d19?: number; d20?: number; d21?: number; d22?: number;
    netPay?: number;
    pfSchoolShare?: number;
    eobiSchoolShare?: number;
}

export interface EmployeeEducation {
    serialNo?: number;
    educationName?: string;
    educationFrom?: string;
    educationTo?: string;
    educationQualification?: string;
    educationGrade?: string;
    educationMajor?: string;
}

export interface EmployeeHistory {
    serialNo?: number;
    organizationName?: string;
    designation?: string;
    periodFrom?: string;
    periodTo?: string;
    salary?: number;
    reasonForLeaving?: string;
}

export interface EmployeeDependent {
    serialNo?: number;
    dependentName?: string;
    relation?: string;
    birthDate?: string;
    cnicNo?: string;
}

export interface EmployeeBenefit {
    serialNo?: number;
    benefitName?: string;
    amount?: number;
}

export interface EmployeeRelative {
    serialNo?: number;
    relativeName?: string;
    relation?: string;
    contactNo?: string;
    address?: string;
}

export interface EmployeeNextToKin {
    serialNo?: number;
    beneficiaryName?: string;
    beneficiaryAddress?: string;
    beneficiaryRelation?: string;
    beneficiaryPercent?: string;
    beneficiaryCnic?: string;
}

export interface EmployeeScanDocument {
    documentNo: number;
    serialNo?: number;
    documentName?: string;
    scanDocument?: string;
}

export interface EmployeeJobDescription {
    positionTitle?: string;
    reportsTo?: string;
    preparedOn?: string;
    department?: string;
    jobPurpose?: string;
    staffSupervised?: string;
    description?: string;
    product?: string;
    natureOfBusiness?: string;
    shiftTiming?: string;
    internalRelations?: string;
    externalRelations?: string;
    qualification?: string;
    experience?: string;
    skills?: string;
}

export interface EmployeeStruckOff {
    empCardNo: number;
    site: string;
    leftType?: string;
    stuckOffStatus?: boolean;
    stuckOffDate?: string;
    status?: boolean;
    reInstated?: boolean;
    reInstatedDate?: string;
}

const parseNameAndPrefix = (empName: string = "", empSex: string = "", maritalStatus: string = "") => {
    let rawName = empName.trim();
    let prefix = "";

    const prefixMatch = rawName.match(/^(Mr\.|Mr|Mrs\.|Mrs|Ms\.|Ms|Miss\.?)\s+/i);
    if (prefixMatch) {
        const raw = prefixMatch[1].toLowerCase().replace('.', '');
        if (raw === 'mrs') prefix = 'Mrs';
        else if (raw === 'ms' || raw === 'miss') prefix = 'Ms';
        else if (raw === 'mr') prefix = 'Mr';
        rawName = rawName.substring(prefixMatch[0].length).trim();
    } else {
        const isFemale = empSex === "2" || empSex === "F" || empSex === "Female";
        const isMale = empSex === "1" || empSex === "M" || empSex === "Male";
        if (isFemale) {
            prefix = (maritalStatus && maritalStatus.toLowerCase() === "single") ? "Ms" : "Mrs";
        } else if (isMale) {
            prefix = "Mr";
        } else {
            prefix = "Mr";
        }
    }

    return { prefix, cleanName: rawName };
};

export const splitCleanName = (name: string): { firstName: string; middleName: string; lastName: string } => {
    const tokens = (name || '').trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
    if (tokens.length === 0) {
        return { firstName: '', middleName: '', lastName: '' };
    }
    if (tokens.length === 1) {
        return { firstName: tokens[0], middleName: '', lastName: '' };
    }
    if (tokens.length === 2) {
        return { firstName: tokens[0], middleName: '', lastName: tokens[1] };
    }
    return {
        firstName: tokens[0],
        middleName: tokens.slice(1, -1).join(' '),
        lastName: tokens[tokens.length - 1],
    };
};

const mapFromApi = (e: any, site: string): Employee => {
    const { prefix, cleanName } = parseNameAndPrefix(e.empName, e.empSex, e.maritalStatus);
    const gender = e.empSex === "1" || e.empSex === "M" || e.empSex === "Male" ? "Male"
          : e.empSex === "2" || e.empSex === "F" || e.empSex === "Female" ? "Female"
          : (prefix === "Mrs" || prefix === "Ms") ? "Female" : "Male";

    const hasExplicitParts = e.firstName !== undefined && e.firstName !== null && String(e.firstName).trim() !== '';
    const parts = hasExplicitParts
        ? {
            firstName: String(e.firstName).trim(),
            middleName: (e.middleName ? String(e.middleName).trim() : ''),
            lastName: (e.lastName ? String(e.lastName).trim() : '')
        }
        : splitCleanName(cleanName);

    return {
        empCardNo: e.empCardNo,
        site,
        empOldNo: String(e.empOldCardNo ?? ""),
        empPrefix: e.empPrefix || prefix,
        empName: cleanName,
        firstName: parts.firstName,
        middleName: parts.middleName,
        lastName: parts.lastName,
        empFatherName: e.empFatherName,
        employeeCategory: e.empCategory || e.empType || "",
        category: e.empCategory || "",
        location: String(e.locationCode ?? ""),
        unit: e.salaryUnit || "",
        employeeUnit: e.unit || "",
        salaryUnit: e.salaryUnit || "",
        city: e.city || "",
        region: e.region || "",
        gradeId: e.gradeID,
        gradeName: e.grade || "",
        section: e.section || "",
        departmentCode: String(e.departmentCode ?? ""),
        deptName: e.departmentName,
        designationCode: e.designationCode,
        designationName: e.designationName,
        religion: e.religion,
        qualification: e.qualification,
        certification: e.certification,
        experience: e.experience,
        experience2: e.experience2 || "",
        permanentAddress: e.address,
        temporaryAddress: e.temporaryAddress || e.address,
        address: e.address,
        remarks: e.remarks,
        emailCompany: e.email,
        emailPersonal: e.emailPersonal || "",
        email: e.email,
        timeInDefine: e.inTime,
        timeOutDefine: e.outTime,
        reportingTimingDefine: e.reportingTiming,
        workingHours: e.workingHours,
        gender: gender,
        cnicNo: e.empCNIC,
        shift: e.empShift,
        birthDate: e.birthDate,
        joiningDate: e.joiningDate,
        confirmationDate: e.confirmationDate,
        bloodGroup: e.bloodGroup,
        maritalStatus: e.maritalStatus,
        bankId: e.bankID ?? e.bankId,
        bankName: e.bankName || "",
        bankAccount: e.bankAccount || "",
        employmentStatus: e.empType,
        phoneNo: e.phoneNo,
        emergencyNo: e.emergencyNo,
        extensionNo: e.extensionNo,
        dependents: e.dependents,
        eobiStatus: e.isEOBI,
        eobiNo: e.eobiNo,
        socialSecurityStatus: e.isSS,
        socialSecurityNo: e.ssNo,
        restDay: formatRestDaySchedule(e.restDay) || (e.restDay && e.restDay !== "None" ? e.restDay : "Sunday"),
        overTimeStatus: e.overTime,
        complianceStatus: e.isCompliance,
        relaxationTime: e.relaxationTime,
        status: e.status,
        scale: e.scale || "",
        stuckOffStatus: e.struckOff,
        stuckOffDate: e.struckOffDate,
        leftType: e.leftType,
        deptId: e.departmentCode,
        empPicture: e.empPicture ? (typeof e.empPicture === 'string' ? e.empPicture : (e.empPicture.data ? btoa(String.fromCharCode(...new Uint8Array(e.empPicture.data))) : e.empPicture)) : undefined,
    };
};

const formatTimeForSave = (timeStr?: string | null): string => {
    if (!timeStr) return "";
    const str = timeStr.trim();
    if (!str) return "";
    if (/AM|PM/i.test(str)) return str;

    const match = str.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        if (hours === 0) hours = 12;

        return `${hours.toString().padStart(2, '0')}:${minutes} ${ampm}`;
    }

    return str;
};

const toOptionalIsoDate = (dateStr?: string): string | null => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapToSavePayload = (employee: Partial<Employee>): any => {
    let empSex = employee.gender || "";
    if (!empSex) {
        empSex = (employee.empPrefix === "Mrs" || employee.empPrefix === "Ms") ? "Female" : "Male";
    }

    const nameParts = [employee.firstName, employee.middleName, employee.lastName]
        .map(p => (p ?? '').trim())
        .filter(Boolean);
    const combinedEmpName = nameParts.length > 0 ? nameParts.join(' ') : (employee.empName || '');
    const parsedLocationCode = Number(employee.location);
    const locationCode = Number.isSafeInteger(parsedLocationCode) && parsedLocationCode >= 0
        ? parsedLocationCode
        : 0;

    return {
        empCardNo: Number(employee.empCardNo || 0),
        empOldCardNo: Number(employee.empOldNo || 0),
        empName: combinedEmpName,
        firstName: employee.firstName?.trim() || "",
        middleName: employee.middleName?.trim() || "",
        lastName: employee.lastName?.trim() || "",
        empFatherName: employee.empFatherName || "",
        empCategory: employee.category || employee.employeeCategory || "",
        locationCode,
        unit: employee.employeeUnit || null,
        city: employee.city || null,
        region: employee.region || "",
        empPrefix: employee.empPrefix || "",
        salaryUnit: employee.unit || employee.salaryUnit || "",
        departmentCode: Number(employee.departmentCode || 0),
        designationCode: Number(employee.designationCode || 0),
        gradeID: employee.gradeId || null,
        section: employee.section || "",
        religion: employee.religion || "",
        positionTitle: employee.jobDescription?.positionTitle || "",
        qualification: employee.qualification || "",
        certification: employee.certification || "",
        experience: employee.experience || "",
        experience2: employee.experience2 || "",
        address: employee.permanentAddress || "",
        temporaryAddress: employee.temporaryAddress || "",
        remarks: employee.remarks || "",
        email: employee.emailCompany || "",
        emailPersonal: employee.emailPersonal || "",
        inTime: formatTimeForSave(employee.timeInDefine || ""),
        outTime: formatTimeForSave(employee.timeOutDefine || ""),
        reportingTiming: formatTimeForSave(employee.reportingTimingDefine || ""),
        workingHours: Number(employee.workingHours || 0),
        empSex: empSex,
    empCNIC: employee.cnicNo || "",
    empShift: employee.shift || "",
    birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString() : new Date().toISOString(),
    joiningDate: employee.joiningDate ? new Date(employee.joiningDate).toISOString() : new Date().toISOString(),
    confirmationDate: employee.confirmationDate ? new Date(employee.confirmationDate).toISOString() : new Date().toISOString(),
    contractExpiryDate: toOptionalIsoDate(employee.contractExpiryDate),
    cardExpiryDate: toOptionalIsoDate(employee.cardExpiryDate),
    clearContractExpiryDate: !employee.contractExpiryDate,
    clearCardExpiryDate: !employee.cardExpiryDate,
    bloodGroup: employee.bloodGroup || "",
    maritalStatus: employee.maritalStatus || "",
    bankID: Number(employee.bankId || 0),
    bankAccount: employee.bankAccount || "",
    empType: employee.employmentStatus || "",
    phoneNo: employee.phoneNo || "",
    emergencyNo: employee.emergencyNo || "",
    extensionNo: employee.extensionNo || "",
    dependents: typeof employee.dependents === "string" ? employee.dependents : "",
    isEOBI: !!employee.eobiStatus,
    eobiNo: employee.eobiNo || "",
    isSS: !!employee.socialSecurityStatus,
    ssNo: employee.socialSecurityNo || "",
    restDay: encodeRestDaySchedule(employee.restDay || "Sunday") || "D:0",
    overTime: !!employee.overTimeStatus,
    isCompliance: !!employee.complianceStatus,
    relaxationTime: Number(employee.relaxationTime || 0),
    status: employee.status !== undefined ? employee.status : true,
    empPicture: employee.empPicture || null,
    scale: employee.scale || "",
    };
};

export const employeeService = {
    getAll: async (site: string): Promise<Employee[]> => {
        const response = await api.get('/hr/define/employee/list', {
            params: { site, Type: 'All', Name: 'All', Id: 0 },
            timeout: 30000,
        });
        return (response.data || []).map((e: unknown) => mapFromApi(e, site));
    },

    getByCardNo: async (empCardNo: number, site: string): Promise<Employee> => {
        const response = await api.get(`/hr/define/employee/${empCardNo}`, { params: { site } });
        const employee = mapFromApi(response.data, site);
        try {
            const salRes = await api.get(`/hr/define/employee/${empCardNo}/salary`, { params: { site } });
            if (salRes.data) {
                const s = salRes.data;
                employee.salary = {
                    grossPay: s.grossPay ?? 0,
                    basicPay: s.basicPay ?? 0,
                    salLec: s.salLec ?? 0,
                    a01: s.a01 ?? 0, a02: s.a02 ?? 0, a03: s.a03 ?? 0,
                    a04: s.a04 ?? 0, a05: s.a05 ?? 0, a06: s.a06 ?? 0,
                    a07: s.a07 ?? 0, a08: s.a08 ?? 0, a09: s.a09 ?? 0,
                    a10: s.a10 ?? 0, a11: s.a11 ?? 0, a12: s.a12 ?? 0,
                    d01: s.d01 ?? 0, d02: s.d02 ?? 0, d03: s.d03 ?? 0,
                    d04: s.d04 ?? 0, d05: s.d05 ?? 0, d06: s.d06 ?? 0,
                    d07: s.d07 ?? 0, d08: s.d08 ?? 0, d09: s.d09 ?? 0,
                    d10: s.d10 ?? 0, d11: s.d11 ?? 0, d12: s.d12 ?? 0,
                    netPay: s.netPay ?? 0,
                    pfSchoolShare: s.pfSchoolShare ?? 0,
                    eobiSchoolShare: s.eobiSchoolShare ?? 0,
                };
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return employee;
            throw error;
        }
        return employee;
    },

    getSalary: async (empCardNo: number, site: string): Promise<EmployeeSalary | null> => {
        try {
            const res = await api.get(`/hr/define/employee/${empCardNo}/salary`, { params: { site } });
            return res.data ?? null;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) return null;
            throw error;
        }
    },

    saveSalary: async (empCardNo: number, site: string, salary: EmployeeSalary): Promise<void> => {
        const payload = {
            empCardNo,
            grossPay: Number(salary.grossPay || 0),
            basicPay: Number(salary.basicPay || 0),
            salLec: Number(salary.salLec || 0),
            a01: Number(salary.a01 || 0), a02: Number(salary.a02 || 0), a03: Number(salary.a03 || 0),
            a04: Number(salary.a04 || 0), a05: Number(salary.a05 || 0), a06: Number(salary.a06 || 0),
            a07: Number(salary.a07 || 0), a08: Number(salary.a08 || 0), a09: Number(salary.a09 || 0),
            a10: Number(salary.a10 || 0), a11: Number(salary.a11 || 0), a12: Number(salary.a12 || 0),
            d01: Number(salary.d01 || 0), d02: Number(salary.d02 || 0), d03: Number(salary.d03 || 0),
            d04: Number(salary.d04 || 0), d05: Number(salary.d05 || 0), d06: Number(salary.d06 || 0),
            d07: Number(salary.d07 || 0), d08: Number(salary.d08 || 0), d09: Number(salary.d09 || 0),
            d10: Number(salary.d10 || 0), d11: Number(salary.d11 || 0), d12: Number(salary.d12 || 0),
            netPay: Number(salary.netPay || 0),
            pfSchoolShare: Number(salary.pfSchoolShare || 0),
            eobiSchoolShare: Number(salary.eobiSchoolShare || 0),
        };
        await api.post('/hr/define/employee/salary/save', payload, { params: { site } });
    },

    create: async (employee: Partial<Employee>): Promise<Employee> => {
        const site = employee.site || "";
        await api.post('/hr/define/employee/save', mapToSavePayload(employee), { params: { site } });
        if (employee.empCardNo && employee.salary) {
            await employeeService.saveSalary(employee.empCardNo, site, employee.salary);
        }
        return employee as Employee;
    },

    update: async (empCardNo: number, site: string, employee: Partial<Employee>): Promise<void> => {
        await api.post('/hr/define/employee/save', mapToSavePayload({ ...employee, empCardNo }), { params: { site } });
        if (employee.salary) {
            await employeeService.saveSalary(empCardNo, site, employee.salary);
        }
    },

    updateStruckOff: async (empCardNo: number, site: string, data: Partial<EmployeeStruckOff>): Promise<void> => {
        await api.put('/hr/define/employee/struckoff', {
            empCardNo,
            leftType: data.leftType,
            struckOff: data.stuckOffStatus,
            struckOffDate: data.stuckOffDate,
            deactivate: data.status ?? false,
        }, { params: { site } });
    },

    updateDepartmentTimings: async (site: string, departmentCode: number, inTime: string, outTime: string, workingHours: number, reportingTiming?: string): Promise<void> => {
        await api.put('/hr/define/employee/timings', {
            departmentCode,
            inTime,
            outTime,
            reportingTiming: reportingTiming || "",
            workingHours,
        }, { params: { site } });
    },

    updateDepartmentRestDay: async (site: string, departmentCode: number, restDay: string): Promise<void> => {
        await api.put('/hr/define/employee/restday', {
            departmentCode,
            restDay: encodeRestDaySchedule(restDay),
        }, { params: { site } });
    },

    delete: async (empCardNo: number, site: string): Promise<void> => {
        await api.delete(`/hr/define/employee/${empCardNo}`, { params: { site } });
    },

    getNextCode: async (site: string): Promise<number> => {
        const response = await api.get('/hr/define/employee/maxno', { params: { site } });
        return response.data;
    },

    getPictureUrl: (_empCardNo: number, _site: string) => "",

    getCnicImageUrl: (_empCardNo: number, _site: string) => "",

    getPoliceVerificationUrl: (_empCardNo: number, _site: string) => "",

    viewEmployeeListPdf: async (site: string, status?: boolean, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/list', {
            params: { site, status, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeesByDesignationReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/designation', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeesByDepartmentReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/department', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewGroupedHierarchyReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/department', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewNewAppointmentsReport: async (site: string, fromDate: string, toDate: string, deptCode?: string, desigCode?: number, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/new-appointments', {
            params: { site, fromDate, toDate, deptCode, desigCode, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewAdvanceReport: async (empCardNo: number, site: string, userName: string): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/advance', {
            params: { empCardNo, site, userName },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeesLeftReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/left', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeeOpeningBalancesReport: async (site: string): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/opening-balances', {
            params: { site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeePfLedgerReport: async (empCardNo: number, site: string): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/pf-ledger', {
            params: { empCardNo, site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeesByReligionReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/religion', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeesByServiceReport: async (site: string, withImage?: boolean): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/service', {
            params: { site, withImage },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeePfLedgerAllReport: async (site: string): Promise<void> => {
        const response = await api.get('/hr/define/employee/report/pf-ledger-all', {
            params: { site },
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    viewEmployeeDobReport: async (
        site: string,
        fromDate?: string,
        toDate?: string,
        deptCode?: string | number,
        desigCode?: number,
        withImage?: boolean
    ): Promise<void> => {
        const params: Record<string, any> = { site, withImage: !!withImage };
        if (fromDate) params.fromDate = fromDate;
        if (toDate) params.toDate = toDate;
        if (deptCode && deptCode !== 'all') params.deptCode = deptCode;
        if (desigCode && desigCode !== 0) params.desigCode = desigCode;

        const response = await api.get('/hr/define/employee/report/dob', {
            params,
            responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000 * 60);
    },

    getRosterReport: async (site: string, search?: string, category?: string): Promise<any[]> => {
        const response = await api.get('/hr/define/employee/roster-report', {
            params: { site, search, category }
        });
        return response.data;
    },

    getContractExpiryAlerts: async (site: string): Promise<any[]> => {
        const response = await api.get('/hr/define/employee/contract-expiry', {
            params: { site }
        });
        return response.data;
    },
};
