import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import { Field } from './Field';
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
