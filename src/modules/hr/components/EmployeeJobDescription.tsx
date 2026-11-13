import { Control, Controller, UseFormRegister } from "react-hook-form";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Employee } from "../services/employeeService";

interface EmployeeJobDescriptionProps {
    control: Control<Employee>;
    register: UseFormRegister<Employee>;
}

export const EmployeeJobDescription = ({ control, register }: EmployeeJobDescriptionProps) => {
    return (
        <div className="space-y-6">
            <div className="border-b pb-2 mb-4">
                <h3 className="text-sm font-bold">Job Description Details</h3>
                <p className="text-xs text-muted-foreground mt-1">Complete job description and role responsibilities</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Position Title</Label>
                        <Input {...register('jobDescription.positionTitle')} placeholder="e.g. Senior Project Manager" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Reports To</Label>
                        <Input {...register('jobDescription.reportsTo')} placeholder="Supervisor/Manager Name" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Department</Label>
                        <Input {...register('jobDescription.department')} placeholder="Department Name" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Prepared On</Label>
                        <Input {...register('jobDescription.preparedOn')} placeholder="Date" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Staff Supervised</Label>
                        <Input {...register('jobDescription.staffSupervised')} placeholder="Number and role of staff" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Shift Timing</Label>
                        <Input {...register('jobDescription.shiftTiming')} placeholder="e.g. 9 AM - 5 PM" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Required Qualification</Label>
                        <Textarea {...register('jobDescription.qualification')} placeholder="Educational qualifications required" className="min-h-[60px] resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Required Experience</Label>
                        <Textarea {...register('jobDescription.experience')} placeholder="Years and type of experience" className="min-h-[60px] resize-none" />
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Job Purpose</Label>
                        <Textarea {...register('jobDescription.jobPurpose')} placeholder="Primary purpose of the role" className="min-h-[80px] resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Job Description</Label>
                        <Textarea {...register('jobDescription.description')} placeholder="Detailed description of responsibilities" className="min-h-[120px] resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Product/Service</Label>
                        <Input {...register('jobDescription.product')} placeholder="Products or services involved" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Nature of Business</Label>
                        <Input {...register('jobDescription.natureOfBusiness')} placeholder="Business nature" className="h-9" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Internal Relations</Label>
                        <Textarea {...register('jobDescription.internalRelations')} placeholder="Internal departments/teams collaborated with" className="min-h-[60px] resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">External Relations</Label>
                        <Textarea {...register('jobDescription.externalRelations')} placeholder="External parties/clients interacted with" className="min-h-[60px] resize-none" />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold">Required Skills</Label>
                        <Textarea {...register('jobDescription.skills')} placeholder="Technical and soft skills required" className="min-h-[80px] resize-none" />
                    </div>
                </div>
            </div>
        </div>
    );
};
