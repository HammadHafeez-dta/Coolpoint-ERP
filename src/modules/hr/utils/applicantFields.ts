import {
    LucideIcon,
    User,
    Users,
    CreditCard,
    Calendar,
    Phone,
    PhoneCall,
    PhoneForwarded,
    Mail,
    MapPin,
    Heart,
    BookOpen,
    Activity,
    Users2,
    Hash
} from "lucide-react";
import { Employee } from "../services/employeeService";

// Personal Info Field Configuration
// To add, remove, or modify personal fields displayed in the Applicants list or drawer,
// edit this file only. Both the table columns and drawer field groups are derived from here.

export type PersonalFieldGroup = "Basic" | "Contact" | "Other";
export type PersonalFieldFormat = "date" | "text";

export interface PersonalFieldConfig {
    key: keyof Employee;
    label: string;
    group: PersonalFieldGroup;
    format?: PersonalFieldFormat;
    icon?: LucideIcon;
}

export const PERSONAL_FIELDS: PersonalFieldConfig[] = [
    // Basic Group
    {
        key: "empCardNo",
        label: "Card No",
        group: "Basic",
        format: "text",
        icon: Hash
    },
    {
        key: "empName",
        label: "Full Name",
        group: "Basic",
        format: "text",
        icon: User
    },
    {
        key: "firstName",
        label: "First Name",
        group: "Basic",
        format: "text",
        icon: User
    },
    {
        key: "middleName",
        label: "Middle Name",
        group: "Basic",
        format: "text",
        icon: User
    },
    {
        key: "lastName",
        label: "Last Name",
        group: "Basic",
        format: "text",
        icon: User
    },
    {
        key: "empFatherName",
        label: "Father Name",
        group: "Basic",
        format: "text",
        icon: Users
    },
    {
        key: "cnicNo",
        label: "CNIC",
        group: "Basic",
        format: "text",
        icon: CreditCard
    },
    {
        key: "gender",
        label: "Gender",
        group: "Basic",
        format: "text",
        icon: User
    },
    {
        key: "birthDate",
        label: "Date of Birth",
        group: "Basic",
        format: "date",
        icon: Calendar
    },

    // Contact Group
    {
        key: "phoneNo",
        label: "Phone Number",
        group: "Contact",
        format: "text",
        icon: Phone
    },
    {
        key: "emergencyNo",
        label: "Emergency No",
        group: "Contact",
        format: "text",
        icon: PhoneCall
    },
    {
        key: "extensionNo",
        label: "Extension No",
        group: "Contact",
        format: "text",
        icon: PhoneForwarded
    },
    {
        key: "email",
        label: "Email",
        group: "Contact",
        format: "text",
        icon: Mail
    },
    {
        key: "address",
        label: "Address",
        group: "Contact",
        format: "text",
        icon: MapPin
    },

    // Other Group
    {
        key: "maritalStatus",
        label: "Marital Status",
        group: "Other",
        format: "text",
        icon: Heart
    },
    {
        key: "religion",
        label: "Religion",
        group: "Other",
        format: "text",
        icon: BookOpen
    },
    {
        key: "bloodGroup",
        label: "Blood Group",
        group: "Other",
        format: "text",
        icon: Activity
    },
    {
        key: "dependents",
        label: "Dependents",
        group: "Other",
        format: "text",
        icon: Users2
    }
];

// Columns to showcase on the Applicants table list
export const LIST_COLUMNS: (keyof Employee)[] = [
    "empCardNo",
    "empName",
    "empFatherName",
    "cnicNo",
    "gender",
    "phoneNo"
];
