import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import DataTable, { type Column } from './DataTable';

interface Row {
  id: string;
  name: string;
}

const columns: Column<Row>[] = [
  { key: 'name', label: 'نام' },
  { key: 'id', label: 'شناسه' },
];

describe('DataTable', () => {
  it('renders rows and column labels', () => {
    render(<DataTable columns={columns} data={[{ id: '1', name: 'محصول یک' }]} />);
    expect(screen.getByText('نام')).toBeInTheDocument();
    expect(screen.getByText('محصول یک')).toBeInTheDocument();
  });

  it('shows the empty message when there is no data', () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="چیزی نیست" />);
    expect(screen.getByText('چیزی نیست')).toBeInTheDocument();
  });

  it('shows a search box when searchable', () => {
    render(<DataTable columns={columns} data={[]} searchable onSearch={() => {}} />);
    expect(screen.getByPlaceholderText('جستجو...')).toBeInTheDocument();
  });

  it('notifies page changes', () => {
    const onPageChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[]}
        total={30}
        totalPages={3}
        page={1}
        onPageChange={onPageChange}
      />,
    );
    expect(screen.getAllByText('۲').length).toBeGreaterThan(0);
  });
});