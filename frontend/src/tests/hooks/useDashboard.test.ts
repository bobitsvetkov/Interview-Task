import { renderHook, act, waitFor } from '@testing-library/react'
import { useDashboard } from '../../hooks/useDashboard'
import { READY_DATASET } from '../fixtures'

// ---------------------------------------------------------------------------
// Mock the dataset API
// ---------------------------------------------------------------------------
vi.mock('../../api/dataset', () => ({
  uploadCSV: vi.fn(),
  listDatasets: vi.fn(),
  getDatasetStatus: vi.fn(),
}))

import { uploadCSV, listDatasets } from '../../api/dataset'

const mockListDatasets = vi.mocked(listDatasets)
const mockUploadCSV = vi.mocked(uploadCSV)

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockListDatasets.mockResolvedValue({ datasets: [] })
  })

  it('fetches datasets on mount', async () => {
    mockListDatasets.mockResolvedValue({ datasets: [READY_DATASET] })

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => {
      expect(result.current.datasets).toHaveLength(1)
    })

    expect(result.current.datasets[0].filename).toBe('sales_2024.csv')
    expect(mockListDatasets).toHaveBeenCalledOnce()
  })

  it('sets error when the initial fetch fails', async () => {
    mockListDatasets.mockRejectedValue(new Error('Network error'))

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => {
      expect(result.current.error).toBe('Failed to load datasets')
    })
  })

  it('uploads a file and stores the result', async () => {
    mockUploadCSV.mockResolvedValue({
      dataset_id: 10,
      status: 'ready',
      row_count: 500,
      rows_dropped: 3,
      date_min: '2024-01-01',
      date_max: '2024-12-31',
      total_sales: 50000,
    })

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(mockListDatasets).toHaveBeenCalled())

    const file = new File(['data'], 'test.csv', { type: 'text/csv' })

    await act(async () => {
      result.current.handleUpload(file)
    })

    await waitFor(() => {
      expect(result.current.uploadResult).not.toBeNull()
    })

    expect(mockUploadCSV).toHaveBeenCalledWith(file)
    expect(result.current.uploadResult!.row_count).toBe(500)
  })

  it('sets error message when upload fails', async () => {
    mockUploadCSV.mockRejectedValue(new Error('File too large'))

    const { result } = renderHook(() => useDashboard())

    await waitFor(() => expect(mockListDatasets).toHaveBeenCalled())

    const file = new File(['data'], 'test.csv', { type: 'text/csv' })

    await act(async () => {
      result.current.handleUpload(file)
    })

    await waitFor(() => {
      expect(result.current.error).toBe('File too large')
    })
  })
})
