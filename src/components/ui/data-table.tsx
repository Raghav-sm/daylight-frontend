'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export type DataTableColumnType = 'STRING' | 'NUMBER' | 'ACTIONS';

export type DataTableColumn<T> = {
  label: string;
  fieldName: string;
  type?: DataTableColumnType;
  formatter?: (value: unknown, row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data?: T[];
  getRowId: (row: T) => string;
  getRowHref?: (row: T) => string | undefined;
  isLoading?: boolean;
  loadingRows?: number;
  error?: unknown;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  className?: string;
  tableClassName?: string;
  surface?: 'card' | 'transparent';
};

const emptyFallback = <span className="text-muted-foreground">—</span>;

function getValueByFieldName(fieldName: string, row: unknown): unknown {
  if (!fieldName) return row;
  return fieldName.split('.').reduce<unknown>((acc, key) => {
    if (acc == null || typeof acc !== 'object') return null;
    return (acc as Record<string, unknown>)[key];
  }, row);
}

function resolveColumnValue<T>(column: DataTableColumn<T>, row: T): unknown {
  if (column.type === 'ACTIONS') return row;
  return getValueByFieldName(column.fieldName, row);
}

function renderCellContent<T>(column: DataTableColumn<T>, row: T): ReactNode {
  const value = resolveColumnValue(column, row);
  if (column.formatter) {
    const formatted = column.formatter(value, row);
    if (formatted == null || formatted === '') return emptyFallback;
    return formatted;
  }
  if (value == null || value === '') return emptyFallback;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return emptyFallback;
}

export function DataTable<T>({
  columns,
  data = [],
  getRowId,
  getRowHref,
  isLoading = false,
  loadingRows = 4,
  error,
  onRetry,
  emptyMessage = 'No results.',
  className,
  tableClassName,
  surface = 'card',
}: DataTableProps<T>) {
  const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';

  return (
    <Card className={cn('p-0', surface === 'transparent' && 'border border-border bg-transparent shadow-none ring-0', className)}>
      <CardContent className="p-0">
        <Table className={tableClassName}>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={`${column.fieldName}-${column.label}`}
                  className={column.headerClassName}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: loadingRows }, (_, rowIndex) => (
                <TableRow key={`loading-row-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell
                      key={`${column.fieldName}-${column.label}`}
                      className={column.className}
                    >
                      <Skeleton
                        className={cn(
                          'h-4',
                          column.type === 'ACTIONS' ? 'ml-auto w-8' : 'w-24',
                        )}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <div
                    role="alert"
                    className="flex flex-wrap items-center justify-center gap-3 text-sm text-destructive"
                  >
                    <span>{errorMessage}</span>
                    {onRetry && (
                      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                        Retry
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const rowHref = getRowHref?.(row);
                return (
                  <TableRow
                    key={getRowId(row)}
                    className={cn(rowHref ? 'cursor-pointer' : undefined)}
                  >
                    {columns.map((column) => {
                      const content = renderCellContent(column, row);
                      const isActions = column.type === 'ACTIONS';
                      return (
                        <TableCell
                          key={`${column.fieldName}-${column.label}`}
                          className={column.className}
                          onClick={isActions ? (event) => event.stopPropagation() : undefined}
                        >
                          {rowHref && !isActions ? (
                            <Link href={rowHref} className="block min-w-0 text-inherit no-underline">
                              {content}
                            </Link>
                          ) : (
                            content
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
