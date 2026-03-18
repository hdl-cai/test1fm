import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface DataTablePaginationProps {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    pageSize: number
    onPageSizeChange?: (size: number) => void
    totalItems: number
    itemName?: string
    className?: string
}

export function DataTablePagination({
    currentPage,
    totalPages,
    onPageChange,
    pageSize,
    onPageSizeChange,
    totalItems,
    itemName = "items",
    className,
}: DataTablePaginationProps) {
    if (totalItems === 0) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
        <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-1", className)}>
            <div className="text-micro font-semibold text-muted-foreground uppercase tracking-widest italic">
                Showing <span className="text-foreground font-bold tabular-nums">{start}</span> — <span className="text-foreground font-bold tabular-nums">{end}</span> of <span className="text-primary font-bold tabular-nums">{totalItems}</span> {itemName}
            </div>

            <div className="flex items-center space-x-6 lg:space-x-8">
                {onPageSizeChange && (
                    <div className="flex items-center space-x-2">
                        <p className="text-micro font-semibold uppercase tracking-wider text-muted-foreground">Rows per page</p>
                        <Select
                            value={`${pageSize}`}
                            onValueChange={(value) => {
                                onPageSizeChange(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px] bg-card border-border/40 text-micro">
                                <SelectValue placeholder={pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 40, 50].map((size) => (
                                    <SelectItem key={size} value={`${size}`} className="text-micro">
                                        {size}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-border/40 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/60"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-border/40 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/60"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                            // Simple pagination logic for showing a window of pages
                            let pageNum = i + 1;
                            if (totalPages > 5) {
                                if (currentPage > 3) {
                                    pageNum = currentPage - 2 + i;
                                }
                                if (currentPage > totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                }
                            }

                            if (pageNum > totalPages || pageNum < 1) return null;

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => onPageChange(pageNum)}
                                    className={cn(
                                        "h-8 min-w-[32px] px-2 rounded-lg text-micro font-bold transition-colors transition-[width] transition-[height] border",
                                        currentPage === pageNum
                                            ? "bg-primary/10 text-primary border-primary/30 z-10"
                                            : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:border-border/60"
                                    )}
                                >
                                    {String(pageNum).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        variant="outline"
                        className="h-8 w-8 p-0 border-border/40 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/60"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex border-border/40 bg-card/50 text-muted-foreground hover:text-primary hover:border-primary/60"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
