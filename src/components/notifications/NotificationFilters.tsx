import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icon } from '@/hooks/useIcon';

export interface NotificationFilterState {
  search: string;
  urgency: 'all' | 'critical' | 'warning' | 'info';
  type: string;
}

interface NotificationFiltersProps {
  filters: NotificationFilterState;
  onChange: (filters: NotificationFilterState) => void;
}

export function NotificationFilters({ filters, onChange }: NotificationFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Search */}
      <div className="relative flex-1 min-w-50">
        <Icon
          name="SearchIcon"
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search notifications..."
          className="pl-9 h-9"
          value={filters.search}
          onChange={(e) =>
            onChange({ ...filters, search: e.target.value })
          }
        />
      </div>

      {/* Urgency filter */}
      <Select
        value={filters.urgency}
        onValueChange={(v) =>
          onChange({ ...filters, urgency: v as NotificationFilterState['urgency'] })
        }
      >
        <SelectTrigger className="w-35 h-9">
          <SelectValue placeholder="Urgency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All urgency</SelectItem>
          <SelectItem value="critical">Critical</SelectItem>
          <SelectItem value="warning">Warning</SelectItem>
          <SelectItem value="info">Info</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {(filters.search || filters.urgency !== 'all' || filters.type) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 text-muted-foreground"
          onClick={() =>
            onChange({ search: '', urgency: 'all', type: '' })
          }
        >
          <Icon name="Cancel01Icon" size={14} className="mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
}
