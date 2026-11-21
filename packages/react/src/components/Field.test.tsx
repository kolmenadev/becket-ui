import { StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Field, FieldControl, FieldError, FieldHelper, FieldLabel } from './Field';
import { Radio, RadioGroup } from './Radio';
import { TextField } from './TextField';

describe('Field describedBy', () => {
  it('omits aria-describedby when TextField has no helper', () => {
    render(<TextField label="Offset" />);
    expect(screen.getByLabelText('Offset').getAttribute('aria-describedby')).toBeNull();
  });

  it('points at FieldHelper when valid with helperText', () => {
    render(<TextField label="Offset" helperText="Optional hint" />);
    const describedBy = screen.getByLabelText('Offset').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe('Optional hint');
  });

  it('points at FieldError when invalid with helperText', () => {
    render(<TextField label="Email" invalid helperText="Enter a valid email address" />);
    const describedBy = screen.getByLabelText('Email').getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    const node = document.getElementById(describedBy as string);
    expect(node?.getAttribute('role')).toBe('alert');
    expect(node?.textContent).toBe('Enter a valid email address');
  });

  it('does not give RadioGroup a dangling describedBy', () => {
    render(
      <Field>
        <RadioGroup legend="Side">
          <Radio value="yes" label="Yes" />
        </RadioGroup>
      </Field>,
    );
    expect(screen.getByRole('group', { name: 'Side' }).getAttribute('aria-describedby')).toBeNull();
  });
});

describe('Field error messages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('warns once in development when an invalid field has no message', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // In development, StrictMode runs effects twice on mount; the warning must still fire once.
    render(
      <StrictMode>
        <TextField label="Email" invalid />
      </StrictMode>,
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain('invalid field has no error message');
  });

  it('does not warn when an invalid field has a message', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(<TextField label="Email" invalid helperText="Enter a valid email address" />);
    render(
      <Field invalid>
        <FieldLabel>Name</FieldLabel>
        <FieldControl />
        <FieldError>Enter your name</FieldError>
      </Field>,
    );
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('shows helper and error together, error first in aria-describedby', () => {
    render(<TextField label="Email" invalid helperText="Hint" errorText="Required" />);
    const helper = screen.getByText('Hint');
    expect(helper.getAttribute('role')).toBeNull();
    expect(screen.getByRole('alert').textContent).toBe('Required');
    expect(screen.getByLabelText('Email').getAttribute('aria-describedby')).toBe(
      `${screen.getByRole('alert').id} ${helper.id}`,
    );
  });

  it('keeps helperText as the only alert when invalid without errorText', () => {
    render(<TextField label="Email" invalid helperText="Required" />);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert').textContent).toBe('Required');
    expect(screen.getByLabelText('Email').getAttribute('aria-describedby')).toBe(
      screen.getByRole('alert').id,
    );
  });

  it('shows only the hint when errorText is given but the field is valid', () => {
    render(<TextField label="Email" helperText="Hint" errorText="Required" />);
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByText('Required')).toBeNull();
    expect(screen.getByText('Hint')).toBeTruthy();
  });

  it('marks FieldError with a hidden glyph and keeps the message as its text', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
        <FieldHelper>Work address</FieldHelper>
        <FieldError>Enter a valid email address</FieldError>
      </Field>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Enter a valid email address');
    expect(alert.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it('renders dangerouslySetInnerHTML as the FieldError message, after the glyph', () => {
    render(
      <Field invalid>
        <FieldLabel>Email</FieldLabel>
        <FieldControl />
        <FieldError dangerouslySetInnerHTML={{ __html: 'Enter a <strong>valid</strong> email' }} />
      </Field>,
    );
    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Enter a valid email');
    expect(alert.querySelector('strong')?.textContent).toBe('valid');
    expect(alert.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it('keeps helperText as the alert when errorText is false', () => {
    render(<TextField label="Email" invalid helperText="Required" errorText={false} />);
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.getByRole('alert').textContent).toBe('Required');
  });

  it('renders an invalid field without throwing when process is undefined', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Unbundled ESM in a browser has no process; stub it away for this render only.
    vi.stubGlobal('process', undefined);
    try {
      render(<TextField label="Email" invalid />);
    } finally {
      vi.unstubAllGlobals();
    }
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeTruthy();
  });
});
