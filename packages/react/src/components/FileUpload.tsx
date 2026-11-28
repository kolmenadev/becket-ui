'use client';

import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import { fileUpload as fileUploadRecipe } from '@becket-ui/tokens/recipes';

import { assignRef } from '../helpers/nativeDialog';
import { Field, FieldError, FieldHelper, FieldLabel } from './Field';
import { CloseIcon, UploadIcon } from './Glyphs';

export type FileUploadErrorCode = 'file-too-large' | 'file-invalid-type' | 'too-many-files';

export type FileRejection = {
  file: File;
  errors: FileUploadErrorCode[];
};

export type FileUploadProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'type' | 'value' | 'defaultValue' | 'onChange' | 'size' | 'children' | 'accept' | 'multiple'
> & {
  label?: ReactNode;
  /** Shown under the drop zone; read as the error when `invalid`. */
  helperText?: ReactNode;
  invalid?: boolean;
  /** Default `true`: a drop zone needs the room. `false` uses token `sizes.field`. */
  fullWidth?: boolean;
  /** Accepted types, as in the native attribute: extensions and MIME types, e.g. ".pdf,image/*". */
  accept?: string;
  /** Largest accepted file, in bytes. */
  maxSize?: number;
  /** Most files kept at once, when `multiple`. */
  maxFiles?: number;
  /** Lets the user add several files; new picks are added to the list instead of replacing it. */
  multiple?: boolean;
  /** The accepted files (controlled). */
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Files that weren't added, with every reason. Their messages also show under the zone. */
  onFilesReject?: (rejections: FileRejection[]) => void;
  /** Text of the picker button. Default "Choose file" or "Choose files". */
  buttonLabel?: ReactNode;
  /** Text next to the button. Default "or drop it here" or "or drop them here". */
  dropLabel?: ReactNode;
  /** Name of the list of chosen files. Default "Selected files". */
  listLabel?: string;
  /** Accessible name of each remove button. Default `Remove ${file.name}`. */
  removeLabel?: (file: File) => string;
  /** One message per file and reason. */
  formatError?: (code: FileUploadErrorCode, file: File) => string;
  /** Sizes in the file list and in the default messages. Default: B, kB, MB or GB. */
  formatSize?: (bytes: number) => string;
};

function fileKey(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * A drop zone with a native file picker. Checks type, size and count, lists the chosen files with
 * a remove button each, and explains every rejected file next to the control.
 */
export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      label,
      helperText,
      invalid = false,
      fullWidth = true,
      accept,
      maxSize,
      maxFiles,
      multiple = false,
      files,
      defaultFiles = [],
      onFilesChange,
      onFilesReject,
      buttonLabel = multiple ? 'Choose files' : 'Choose file',
      dropLabel = multiple ? 'or drop them here' : 'or drop it here',
      listLabel = 'Selected files',
      removeLabel = (file) => `Remove ${file.name}`,
      formatSize = (bytes) => {
        const [unit, divisor] =
          bytes >= 1e9 ? ['gigabyte', 1e9] : bytes >= 1e6 ? ['megabyte', 1e6] : bytes >= 1e3 ? ['kilobyte', 1e3] : ['byte', 1];
        return new Intl.NumberFormat(undefined, {
          style: 'unit',
          unit,
          unitDisplay: 'short',
          maximumFractionDigits: 1,
        }).format(bytes / divisor);
      },
      formatError = (code, file) =>
        ({
          'file-too-large': `${file.name} is larger than ${formatSize(maxSize ?? 0)}.`,
          'file-invalid-type': `${file.name} isn't an accepted file type.`,
          'too-many-files': `${file.name} wasn't added: ${
            multiple && maxFiles !== 1 ? `the limit is ${maxFiles} files` : 'only one file can be added'
          }.`,
        })[code],
      id,
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    // style-check keep: a hook can't run conditionally, so `id ?? useId()` isn't allowed.
    const autoID = useId();
    const inputID = id ?? autoID;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledFiles, setUncontrolledFiles] = useState(defaultFiles);
    const current = files ?? uncontrolledFiles;
    const [rejections, setRejections] = useState<FileRejection[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const styles = fileUploadRecipe();
    const isInvalid = invalid || rejections.length > 0;

    // style-check keep: keeps the native input's files equal to the list, so a form submits them.
    useEffect(() => {
      // jsdom and older browsers can't build a FileList; the list still works without it.
      if (!inputRef.current || typeof DataTransfer === 'undefined') return;
      const transfer = new DataTransfer();
      for (const file of current) transfer.items.add(file);
      inputRef.current.files = transfer.files;
    }, [current]);

    // style-check keep: the picker and a drop share these checks; two copies would drift apart.
    const add = (incoming: File[]) => {
      const kept = multiple ? current : [];
      const accepted: File[] = [];
      const rejected: FileRejection[] = [];
      for (const file of incoming) {
        if (kept.some((each) => fileKey(each) === fileKey(file))) continue;
        const types = (accept ?? '')
          .split(',')
          .map((type) => type.trim().toLowerCase())
          .filter(Boolean);
        const errors: FileUploadErrorCode[] = [];
        if (
          types.length > 0 &&
          !types.some((type) =>
            type.startsWith('.')
              ? file.name.toLowerCase().endsWith(type)
              : type.endsWith('/*')
                ? file.type.toLowerCase().startsWith(type.slice(0, -1))
                : file.type.toLowerCase() === type,
          )
        )
          errors.push('file-invalid-type');
        if (maxSize !== undefined && file.size > maxSize) errors.push('file-too-large');
        if (
          errors.length === 0 &&
          kept.length + accepted.length >= (multiple ? (maxFiles ?? Number.POSITIVE_INFINITY) : 1)
        )
          errors.push('too-many-files');
        if (errors.length > 0) rejected.push({ file, errors });
        else accepted.push(file);
      }
      setRejections(rejected);
      if (rejected.length > 0) onFilesReject?.(rejected);
      if (accepted.length === 0) return;
      if (files === undefined) setUncontrolledFiles([...kept, ...accepted]);
      onFilesChange?.([...kept, ...accepted]);
    };

    return (
      <Field id={inputID} invalid={invalid} fullWidth={fullWidth} className={className}>
        {label != null ? <FieldLabel>{label}</FieldLabel> : null}
        <div
          className={styles.dropzone}
          data-dragging={isDragging || undefined}
          data-invalid={isInvalid || undefined}
          data-disabled={disabled || undefined}
          onDragEnter={(event) => {
            if (disabled) return;
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            // Without this the browser opens the file instead of dropping it here, even when
            // disabled; `none` shows that nothing will be added.
            event.preventDefault();
            event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
          }}
          onDragLeave={(event) => {
            if (
              !(
                event.relatedTarget instanceof Node &&
                event.currentTarget.contains(event.relatedTarget)
              )
            )
              setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            if (!disabled) add([...event.dataTransfer.files]);
          }}
        >
          <UploadIcon size="lg" />
          <span>
            <input
              ref={(node) => {
                inputRef.current = node;
                assignRef(ref, node);
              }}
              {...props}
              id={inputID}
              type="file"
              accept={accept}
              multiple={multiple}
              disabled={disabled}
              aria-invalid={isInvalid || undefined}
              aria-describedby={
                [
                  props['aria-describedby'],
                  accept || maxSize !== undefined ? `${inputID}-hint` : null,
                  helperText != null ? `${inputID}-${invalid ? 'error' : 'helper'}` : null,
                  rejections.length > 0 ? `${inputID}-rejections` : null,
                ]
                  .filter(Boolean)
                  .join(' ') || undefined
              }
              className={styles.input}
              onChange={(event) => add([...(event.target.files ?? [])])}
            />
            {/* A second label for the same input: it opens the picker and adds to its name. */}
            <label htmlFor={inputID} className={styles.trigger}>
              {buttonLabel}
            </label>{' '}
            {dropLabel}
          </span>
          {(accept || maxSize !== undefined) && (
            <span id={`${inputID}-hint`} className={styles.hint}>
              {[accept?.split(',').join(', '), maxSize !== undefined ? `≤ ${formatSize(maxSize)}` : null]
                .filter(Boolean)
                .join(' · ')}
            </span>
          )}
        </div>
        {current.length > 0 && (
          <ul aria-label={listLabel} className={styles.files}>
            {current.map((file) => (
              <li key={fileKey(file)} className={styles.file}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatSize(file.size)}</span>
                <button
                  type="button"
                  aria-label={removeLabel(file)}
                  disabled={disabled}
                  className={styles.remove}
                  onClick={() => {
                    const next = current.filter((each) => each !== file);
                    if (files === undefined) setUncontrolledFiles(next);
                    onFilesChange?.(next);
                    // The button is about to go; the picker is the next useful stop.
                    inputRef.current?.focus();
                  }}
                >
                  <CloseIcon size="sm" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* Present from the first render, so a rejection is announced as it appears. */}
        <div id={`${inputID}-rejections`} role="alert">
          {rejections.length > 0 && (
            <ul className={styles.errors}>
              {rejections.flatMap((rejection) =>
                rejection.errors.map((code) => (
                  <li key={`${fileKey(rejection.file)}-${code}`}>{formatError(code, rejection.file)}</li>
                )),
              )}
            </ul>
          )}
        </div>
        {helperText != null ? (
          invalid ? (
            <FieldError>{helperText}</FieldError>
          ) : (
            <FieldHelper>{helperText}</FieldHelper>
          )
        ) : null}
      </Field>
    );
  },
);

FileUpload.displayName = 'FileUpload';
