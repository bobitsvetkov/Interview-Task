import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUpload from '../../components/FileUpload/FileUpload'

describe('FileUpload', () => {
  it('renders the upload button', () => {
    render(<FileUpload onFileSelected={vi.fn()} />)

    expect(screen.getByText('Upload CSV')).toBeInTheDocument()
  })

  it('calls onFileSelected with the chosen file', async () => {
    const user = userEvent.setup()
    const onFileSelected = vi.fn()
    render(<FileUpload onFileSelected={onFileSelected} />)

    const file = new File(['col1,col2\na,b'], 'data.csv', { type: 'text/csv' })
    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    await user.upload(input, file)

    expect(onFileSelected).toHaveBeenCalledOnce()
    expect(onFileSelected).toHaveBeenCalledWith(file)
  })

  it('shows "Uploading..." and disables the input when disabled', () => {
    render(<FileUpload onFileSelected={vi.fn()} disabled />)

    expect(screen.getByText('Uploading...')).toBeInTheDocument()
    expect(screen.queryByText('Upload CSV')).not.toBeInTheDocument()

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeDisabled()
  })
})
