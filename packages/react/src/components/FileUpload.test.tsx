import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { FileUpload } from './FileUpload';

const pdf = new File(['%PDF-1.7'], 'report.pdf', { type: 'application/pdf', lastModified: 1 });
const image = new File(['png'], 'photo.png', { type: 'image/png', lastModified: 2 });
const big = new File([new Uint8Array(2048)], 'scan.pdf', { type: 'application/pdf', lastModified: 3 });

function picker(name: RegExp = /Document/) {
  return screen.getByLabelText(name, { selector: 'input' });
}

// user-event drops files that don't match `accept` by default; the component's own check is the
// one under test.
const setup = () => userEvent.setup({ applyAccept: false });

describe('FileUpload', () => {
  it('is a labelled native file input reachable with Tab', async () => {
    const { container } = render(
      <FileUpload label="Document" helperText="PDF only." accept=".pdf" maxSize={1024} />,
    );
    await setup().tab();
    expect(document.activeElement).toBe(picker());
    expect(picker()).toHaveProperty('type', 'file');
    expect(picker().getAttribute('accept')).toBe('.pdf');
    // Both labels name it: the field label and the visible button.
    expect(screen.getByLabelText('Choose file')).toBe(picker());
    expect(picker().getAttribute('aria-describedby')).toContain(screen.getByText('PDF only.').id);
    await assertNoAxeViolations(container);
  });

  it('lists accepted files with a remove button each', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileUpload label="Document" multiple onFilesChange={onFilesChange} />,
    );
    await setup().upload(picker(), [pdf, image]);
    expect(onFilesChange).toHaveBeenLastCalledWith([pdf, image]);
    const list = screen.getByRole('list', { name: 'Selected files' });
    expect(list.textContent).toContain('report.pdf');
    expect(list.textContent).toContain('photo.png');
    expect(screen.getByRole('button', { name: 'Remove photo.png' })).toBeTruthy();
    await assertNoAxeViolations(container);
  });

  it('adds new picks to the list when multiple, and replaces the file when not', async () => {
    const user = setup();
    const { unmount } = render(<FileUpload label="Document" multiple />);
    await user.upload(picker(), pdf);
    await user.upload(picker(), image);
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    unmount();

    render(<FileUpload label="Document" />);
    await user.upload(picker(), pdf);
    await user.upload(picker(), image);
    expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual([
      expect.stringContaining('photo.png'),
    ]);
  });

  it('rejects a file that is too large or of the wrong type, and says why next to the control', async () => {
    const onFilesReject = vi.fn();
    const { container } = render(
      <FileUpload
        label="Document"
        multiple
        accept=".pdf,application/pdf"
        maxSize={1024}
        onFilesReject={onFilesReject}
      />,
    );
    await setup().upload(picker(), [pdf, big, image]);
    expect(onFilesReject).toHaveBeenCalledWith([
      { file: big, errors: ['file-too-large'] },
      { file: image, errors: ['file-invalid-type'] },
    ]);
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toContain('scan.pdf is larger than');
    expect(alert.textContent).toContain("photo.png isn't an accepted file type.");
    expect(picker().getAttribute('aria-describedby')?.split(' ')).toContain(alert.id);
    expect(picker().getAttribute('aria-invalid')).toBe('true');
    expect(screen.getAllByRole('listitem').filter((item) => item.closest('[role="alert"]') === null)).toHaveLength(1);
    await assertNoAxeViolations(container);
  });

  it('matches MIME wildcards and extensions without case', async () => {
    const onFilesChange = vi.fn();
    render(<FileUpload label="Document" multiple accept="image/*,.PDF" onFilesChange={onFilesChange} />);
    await setup().upload(picker(), [pdf, image]);
    expect(onFilesChange).toHaveBeenLastCalledWith([pdf, image]);
  });

  it('rejects files past maxFiles', async () => {
    const onFilesReject = vi.fn();
    render(<FileUpload label="Document" multiple maxFiles={1} onFilesReject={onFilesReject} />);
    await setup().upload(picker(), [pdf, image]);
    expect(onFilesReject).toHaveBeenCalledWith([{ file: image, errors: ['too-many-files'] }]);
    expect(screen.getByRole('alert').textContent).toContain("photo.png wasn't added");
  });

  it('removes a file from the keyboard and returns focus to the picker', async () => {
    render(<FileUpload label="Document" multiple defaultFiles={[pdf, image]} />);
    screen.getByRole('button', { name: 'Remove report.pdf' }).focus();
    await setup().keyboard('{Enter}');
    expect(screen.queryByText('report.pdf')).toBeNull();
    expect(document.activeElement).toBe(picker());
  });

  it('accepts dropped files and shows the drag state', () => {
    const onFilesChange = vi.fn();
    render(<FileUpload label="Document" onFilesChange={onFilesChange} />);
    const zone = picker().closest('div');
    if (!zone) throw new Error('no drop zone');
    fireEvent.dragEnter(zone, { dataTransfer: { files: [pdf] } });
    expect(zone.hasAttribute('data-dragging')).toBe(true);
    fireEvent.drop(zone, { dataTransfer: { files: [pdf] } });
    expect(zone.hasAttribute('data-dragging')).toBe(false);
    expect(onFilesChange).toHaveBeenCalledWith([pdf]);
  });

  it('ignores drops and the keyboard when disabled', async () => {
    const onFilesChange = vi.fn();
    render(
      <>
        <FileUpload label="Document" disabled onFilesChange={onFilesChange} />
        <button type="button">After</button>
      </>,
    );
    expect(picker()).toHaveProperty('disabled', true);
    await setup().tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
    const zone = picker().closest('div');
    if (!zone) throw new Error('no drop zone');
    fireEvent.drop(zone, { dataTransfer: { files: [pdf] } });
    expect(onFilesChange).not.toHaveBeenCalled();
  });

  it('can be controlled, and reads helperText as the error when invalid', async () => {
    const onFilesChange = vi.fn();
    const { container } = render(
      <FileUpload
        label="Document"
        files={[pdf]}
        onFilesChange={onFilesChange}
        invalid
        helperText="Attach the signed copy."
      />,
    );
    expect(screen.getByText('report.pdf')).toBeTruthy();
    await setup().click(screen.getByRole('button', { name: 'Remove report.pdf' }));
    expect(onFilesChange).toHaveBeenCalledWith([]);
    // Controlled: the file stays until the parent removes it.
    expect(screen.getByText('report.pdf')).toBeTruthy();
    expect(picker().getAttribute('aria-describedby')).toContain(
      screen.getByText('Attach the signed copy.').id,
    );
    expect(picker().getAttribute('aria-invalid')).toBe('true');
    await assertNoAxeViolations(container);
  });
});
