import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"


import { Button } from "@/shared/components/ui/button"
import { Calendar } from "@/shared/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/components/ui/popover"
import { cn } from "@/shared/utils/utils"

interface DatePickerProps {
    date?: string
    setDate: (date: string) => void
    placeholder?: string
    className?: string
}

export function DatePicker({ date, setDate, placeholder = "Pick a date", className }: DatePickerProps) {
    const selectedDate = date ? new Date(date) : undefined

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal h-9",
                        !date && "text-muted-foreground",
                        className
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(selectedDate!, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl z-[100]" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => {
                        if (d) {
                            // Adjust for timezone to keep the date consistent
                            const offset = d.getTimezoneOffset()
                            const adjustedDate = new Date(d.getTime() - (offset * 60 * 1000))
                            setDate(adjustedDate.toISOString().split('T')[0])
                        }
                    }}
                    initialFocus
                    className="rounded-md border bg-white shadow-md"
                />
            </PopoverContent>
        </Popover>
    )
}
