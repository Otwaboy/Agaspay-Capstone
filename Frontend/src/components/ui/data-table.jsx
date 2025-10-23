import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Button } from "./button";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search
} from "lucide-react";
import { cn } from "../../lib/utils";

/**
 * DataTable Component - Reusable table with sorting, pagination, and search
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of data objects to display
 * @param {Array} props.columns - Column configuration array
 * @param {boolean} props.enableSorting - Enable column sorting (default: true)
 * @param {boolean} props.enablePagination - Enable pagination (default: true)
 * @param {boolean} props.enableSearch - Enable search functionality (default: true)
 * @param {Array} props.searchableColumns - Array of column IDs to search through (default: all)
 * @param {number} props.pageSize - Number of rows per page (default: 10)
 * @param {string} props.emptyMessage - Message to display when no data (default: "No results found")
 * @param {string} props.searchPlaceholder - Placeholder for search input
 * @param {Function} props.onRowClick - Callback when row is clicked
 * 
 * Column Configuration:
 * {
 *   id: string,              // Unique column identifier
 *   header: string,          // Column header text
 *   accessorKey: string,     // Key to access data from row object
 *   cell: function,          // Custom cell rendering function (optional)
 *   enableSorting: boolean,  // Enable sorting for this column (default: true)
 *   sortFn: function,        // Custom sort function (optional)
 *   className: string,       // Additional CSS classes for cells
 *   headerClassName: string, // Additional CSS classes for header
 * }
 */
export function DataTable({
  data = [],
  columns = [],
  enableSorting = true,
  enablePagination = true,
  enableSearch = true,
  searchableColumns = null,
  pageSize: initialPageSize = 10,
  emptyMessage = "No results found",
  searchPlaceholder = "Search...",
  onRowClick = null,
  className = "",
}) {
  const [sorting, setSorting] = useState({ column: null, direction: null });
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Determine searchable columns
  const searchColumns = useMemo(() => {
    if (searchableColumns) return searchableColumns;
    return columns.filter(col => col.accessorKey).map(col => col.accessorKey);
  }, [columns, searchableColumns]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!enableSearch || !searchQuery.trim()) return data;

    return data.filter(row => {
      return searchColumns.some(columnKey => {
        const value = row[columnKey];
        if (value == null) return false;
        return String(value).toLowerCase().includes(searchQuery.toLowerCase());
      });
    });
  }, [data, searchQuery, searchColumns, enableSearch]);

  // Sort filtered data
  const sortedData = useMemo(() => {
    if (!enableSorting || !sorting.column) return filteredData;

    const column = columns.find(col => col.id === sorting.column);
    if (!column) return filteredData;

    const sorted = [...filteredData].sort((a, b) => {
      // Use custom sort function if provided
      if (column.sortFn) {
        return column.sortFn(a, b, sorting.direction);
      }

      // Default sorting
      const aValue = a[column.accessorKey];
      const bValue = b[column.accessorKey];

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sorting.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (sorting.direction === 'asc') {
        return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
      } else {
        return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
      }
    });

    return sorted;
  }, [filteredData, sorting, columns, enableSorting]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    if (!enablePagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, currentPage, pageSize, enablePagination]);

  // Calculate pagination info
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startRow = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, sortedData.length);

  // Handle sorting
  const handleSort = (columnId) => {
    const column = columns.find(col => col.id === columnId);
    if (!column || column.enableSorting === false) return;

    setSorting(prev => {
      if (prev.column !== columnId) {
        return { column: columnId, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { column: columnId, direction: 'desc' };
      }
      return { column: null, direction: null };
    });
  };

  // Reset to first page when search changes
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  // Get sort icon for column
  const getSortIcon = (columnId) => {
    if (sorting.column !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sorting.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  // Render cell content
  const renderCell = (row, column) => {
    if (column.cell) {
      return column.cell(row);
    }
    const value = row[column.accessorKey];
    return value != null ? String(value) : "-";
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Controls */}
      {enableSearch && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
              data-testid="input-table-search"
            />
          </div>
          
          {enablePagination && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Rows per page:
              </span>
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[70px]" data-testid="select-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.id}
                  className={cn(
                    column.headerClassName,
                    enableSorting && column.enableSorting !== false && "cursor-pointer select-none"
                  )}
                  onClick={() => enableSorting && handleSort(column.id)}
                  data-testid={`header-${column.id}`}
                >
                  <div className="flex items-center">
                    {column.header}
                    {enableSorting && column.enableSorting !== false && getSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                  data-testid="cell-empty"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  className={onRowClick ? "cursor-pointer" : ""}
                  onClick={() => onRowClick && onRowClick(row)}
                  data-testid={`row-${row.id || index}`}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      className={column.className}
                      data-testid={`cell-${column.id}-${row.id || index}`}
                    >
                      {renderCell(row, column)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {enablePagination && sortedData.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground" data-testid="text-pagination-info">
            Showing {startRow} to {endRow} of {sortedData.length} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              data-testid="button-first-page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              <span className="text-sm" data-testid="text-current-page">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              data-testid="button-last-page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}