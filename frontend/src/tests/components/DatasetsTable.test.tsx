import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DatasetsTable from '../../components/DatasetsTable/DatasetsTable'
import { READY_DATASET, PROCESSING_DATASET } from '../fixtures'

describe('DatasetsTable', () => {
  it('shows a prompt when there are no datasets', () => {
    render(<DatasetsTable datasets={[]} onSelect={vi.fn()} />)

    expect(screen.getByText(/no datasets yet/i)).toBeInTheDocument()
  })

  it('shows dashes instead of data for non-ready datasets', () => {
    render(<DatasetsTable datasets={[PROCESSING_DATASET]} onSelect={vi.fn()} />)

    const cells = screen.getAllByRole('cell')
    const dashCells = cells.filter((c) => c.textContent === '—')
    expect(dashCells.length).toBeGreaterThanOrEqual(3)
  })

  it('calls onSelect with dataset id when a ready row is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DatasetsTable datasets={[READY_DATASET]} onSelect={onSelect} />)

    const row = screen.getByText('sales_2024.csv').closest('tr')!
    await user.click(row)

    expect(onSelect).toHaveBeenCalledWith(1)
  })

  it('does not call onSelect when a non-ready row is clicked', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<DatasetsTable datasets={[PROCESSING_DATASET]} onSelect={onSelect} />)

    const row = screen.getByText('q3_report.csv').closest('tr')!
    await user.click(row)

    expect(onSelect).not.toHaveBeenCalled()
  })
})
