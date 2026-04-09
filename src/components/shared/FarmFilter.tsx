import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useFarmsStore } from "@/stores"
import { cn } from "@/lib/utils"
import { Icon } from "@/hooks/useIcon"

interface FarmFilterProps {
    value?: string | null
    onValueChange?: (value: string | null) => void
    showAllOption?: boolean
    allOptionLabel?: string
    className?: string
    variant?: "default" | "minimal"
}

/**
 * Shared FarmFilter component
 * Standardizes farm selection across the application using shadcn/ui Select
 */
export function FarmFilter({
    value,
    onValueChange,
    showAllOption = true,
    allOptionLabel = "All Farms",
    className,
    variant = "default"
}: FarmFilterProps) {
    const { farms, selectedFarmId, selectFarm } = useFarmsStore()

    // Use controlled value if provided, otherwise fallback to store
    const currentValue = value !== undefined ? (value || "all") : (selectedFarmId || "all")

    const handleValueChange = (newValue: string) => {
        const val = newValue === "all" ? null : newValue
        if (onValueChange) {
            onValueChange(val)
        } else {
            selectFarm(val)
        }
    }

    return (
        <Select value={currentValue} onValueChange={handleValueChange}>
            <SelectTrigger className={cn(
                "h-10 min-w-[180px] bg-card border-border/40 hover:border-primary/50 transition-colors transition-[width] transition-[height]",
                variant === "minimal" && "h-8 px-2 py-0 border-transparent bg-transparent hover:bg-muted/50",
                className
            )}>
                <div className="flex items-center gap-2">
                    <Icon name="FarmIcon" size={14} className="text-muted-foreground" />
                    <SelectValue placeholder="Select Farm" />
                </div>
            </SelectTrigger>
            <SelectContent align="end" className="min-w-50">
                <SelectGroup>
                    <SelectLabel className="text-micro font-bold uppercase tracking-widest text-muted-foreground py-2">
                        Farms
                    </SelectLabel>
                    {showAllOption && (
                        <SelectItem value="all" className="text-micro focus:bg-primary/10 focus:text-primary">
                            <div className="flex flex-col">
                                <span className="font-bold uppercase tracking-wider">{allOptionLabel}</span>
                                <span className="text-micro text-muted-foreground group-focus:text-primary italic">View all farm data</span>
                            </div>
                        </SelectItem>
                    )}
                    {farms.map((farm) => (
                        <SelectItem
                            key={farm.id}
                            value={farm.id}
                            className="text-micro focus:bg-primary/10 focus:text-primary"
                        >
                            <div className="flex flex-col py-0.5">
                                <span className="font-bold uppercase tracking-wider">{farm.name}</span>
                                <span className="text-micro text-muted-foreground group-focus:text-primary">
                                    {farm.region} • {farm.status.toUpperCase()}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    )
}
