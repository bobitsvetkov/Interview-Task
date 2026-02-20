import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable from '../../components/DataTable/DataTable'
import { SAMPLE_RECORDS } from '../fixtures'

const COLUMNS = [
  { key: 'order_number', label: 'Order #' },
  { key: 'customer_name', label: 'Customer' },
  { key: 'sales', label: 'Sales', format: (v: unknown) => `$${Number(v).toLocaleString()}` },
  { key: 'country', label: 'Country', sortable: false },
]

describe('DataTable', () => {
  const defaultProps = {
    records: SAMPLE_RECORDS,
    columns: COLUMNS,
    sortBy: 'order_number',
    sortDir: 'asc' as const,
    onSort: vi.fn(),
  }

  it('shows empty message when there are no records', () => {
    render(<DataTable {...defaultProps} records={[]} />)

    expect(screen.getByText('No records found.')).toBeInTheDocument()
  })

  it('calls onSort when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    render(<DataTable {...defaultProps} onSort={onSort} />)

    await user.click(screen.getByText('Customer'))

    expect(onSort).toHaveBeenCalledWith('customer_name')
  })

  it('does not call onSort when a non-sortable header is clicked', async () => {
    const user = userEvent.setup()
    const onSort = vi.fn()
    render(<DataTable {...defaultProps} onSort={onSort} />)

    await user.click(screen.getByText('Country'))

    expect(onSort).not.toHaveBeenCalled()
  })

  it('applies column format functions to cell values', () => {
    render(<DataTable {...defaultProps} />)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]
    const cells = within(firstDataRow).getAllByRole('cell')

    expect(cells[2].textContent).toBe('$3,000')
  })
})
