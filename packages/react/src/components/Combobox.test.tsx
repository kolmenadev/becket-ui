import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Combobox, type ComboboxOption } from './Combobox';

const fruits: ComboboxOption[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'apricot', label: 'Apricot', disabled: true },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

const products: ComboboxOption[] = [
  { value: 'BLT-M6', label: 'BLT-M6', description: 'Hex bolt, M6' },
  { value: 'NUT-M6', label: 'NUT-M6', description: 'Hex nut, M6' },
  { value: 'WSH-M6', label: 'WSH-M6', description: 'Flat washer, M6' },
];

function input() {
  return screen.getByRole('combobox', { name: 'Fruit' });
}

function activeOption() {
  const id = input().getAttribute('aria-activedescendant');
  return id ? document.getElementById(id) : null;
}

function status() {
  return screen.getByRole('status');
}

describe('Combobox', () => {
  it('wires the ARIA 1.2 combobox attributes to its listbox', async () => {
    const { container } = render(
      <Combobox label="Fruit" helperText="Pick one." options={fruits} />,
    );
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input().getAttribute('aria-autocomplete')).toBe('list');
    expect(input().getAttribute('autocomplete')).toBe('off');
    expect(
      document.getElementById(input().getAttribute('aria-controls') ?? '')?.getAttribute('role'),
    ).toBe('listbox');
    expect(screen.getByText('Pick one.').id).toBe(input().getAttribute('aria-describedby'));
    await assertNoAxeViolations(container);
  });

  it('filters as you type, ignoring case and accents', async () => {
    render(
      <Combobox
        label="Fruit"
        options={[...fruits, { value: 'acai', label: 'Açaí' }]}
      />,
    );
    await userEvent.setup().type(input(), 'ACA');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual(['Açaí']);
    expect(status().textContent).toBe('1 result');
    await assertNoAxeViolations(document.body);
  });

  it('moves the active option with the arrows, wrapping and skipping disabled options', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={fruits} />);
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(activeOption()?.textContent).toBe('Apple');
    expect(activeOption()?.getAttribute('aria-selected')).toBe('true');
    await user.keyboard('{ArrowDown}');
    expect(activeOption()?.textContent).toBe('Banana');
    await user.keyboard('{ArrowDown}{ArrowDown}');
    expect(activeOption()?.textContent).toBe('Apple');
    await user.keyboard('{ArrowUp}');
    expect(activeOption()?.textContent).toBe('Cherry');
    expect(
      screen.getAllByRole('option').filter((option) => option.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(1);
    expect(screen.getByRole('option', { name: 'Apricot' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('opens from the input with Up on the last option, and with Alt+Down on none', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={fruits} />);
    await user.click(input());
    await user.keyboard('{ArrowUp}');
    expect(activeOption()?.textContent).toBe('Cherry');
    await user.keyboard('{Escape}');
    await user.keyboard('{Alt>}{ArrowDown}{/Alt}');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(activeOption()).toBeNull();
  });

  it('chooses the active option with Enter and shows its label', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Combobox label="Fruit" name="fruit" options={fruits} onValueChange={onValueChange} />);
    await user.type(input(), 'ban');
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(fruits[2]);
    expect(input()).toHaveProperty('value', 'Banana');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(document.querySelector<HTMLInputElement>('input[type="hidden"][name="fruit"]')?.value).toBe(
      'banana',
    );
    // Reopened on a chosen option, the list isn't filtered by its label, and marks the choice.
    await user.keyboard('{ArrowDown}');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('chooses with a click without moving focus out of the input', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={fruits} />);
    await user.type(input(), 'c');
    await user.click(screen.getByRole('option', { name: 'Cherry' }));
    expect(input()).toHaveProperty('value', 'Cherry');
    expect(document.activeElement).toBe(input());
  });

  it('closes on Escape, and a second Escape clears the text and the choice', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Combobox label="Fruit" options={fruits} defaultValue={fruits[0]} onValueChange={onValueChange} />,
    );
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    expect(input().getAttribute('aria-expanded')).toBe('true');
    await user.keyboard('{Escape}');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(input()).toHaveProperty('value', 'Apple');
    await user.keyboard('{Escape}');
    expect(input()).toHaveProperty('value', '');
    expect(onValueChange).toHaveBeenCalledWith(null);
  });

  it('sends Home and End to the text, as in the APG editable combobox', async () => {
    const user = userEvent.setup();
    render(<Combobox label="Fruit" options={fruits} />);
    await user.type(input(), 'an');
    await user.keyboard('{ArrowDown}');
    expect(activeOption()?.textContent).toBe('Banana');
    await user.keyboard('{Home}');
    expect(activeOption()).toBeNull();
    expect(input()).toHaveProperty('selectionStart', 0);
    await user.keyboard('{ArrowDown}{End}');
    expect(activeOption()).toBeNull();
    expect(input()).toHaveProperty('selectionStart', 2);
  });

  it('closes on Tab, moves on, and puts back the chosen label', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Combobox label="Fruit" options={fruits} defaultValue={fruits[3]} />
        <button type="button">Next</button>
      </>,
    );
    await user.clear(input());
    await user.type(input(), 'ban');
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Next' }));
    expect(input()).toHaveProperty('value', 'Cherry');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('names two-line options with both lines', async () => {
    render(<Combobox label="Fruit" options={products} />);
    await userEvent.setup().type(input(), 'washer');
    expect(screen.getByRole('option', { name: 'WSH-M6 Flat washer, M6' })).toBeTruthy();
  });

  it('shows suggestions in a labelled group above the results', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Combobox
        label="Fruit"
        options={fruits}
        suggestions={fruits.slice(3)}
        suggestionsLabel="Recently used"
      />,
    );
    await user.click(input());
    await user.keyboard('{ArrowDown}');
    const [suggested, results] = screen.getAllByRole('group');
    expect(suggested && within(suggested).getAllByRole('option')[0]?.textContent).toBe('Cherry');
    expect(screen.getByRole('group', { name: 'Recently used' })).toBe(suggested);
    expect(screen.getByRole('group', { name: 'Results' })).toBe(results);
    // Cherry appears once, in the suggestions.
    expect(screen.getAllByRole('option', { name: 'Cherry' })).toHaveLength(1);
    expect(activeOption()?.textContent).toBe('Cherry');
    await assertNoAxeViolations(container);
  });

  it('says politely when nothing matches', async () => {
    render(<Combobox label="Fruit" options={fruits} emptyMessage="Nothing found" />);
    await userEvent.setup().type(input(), 'zz');
    expect(status().textContent).toBe('Nothing found');
    expect(input().getAttribute('aria-expanded')).toBe('false');
  });

  it('debounces onSearch, shows loading, then the server results', async () => {
    const onSearch = vi.fn(async (query: string) =>
      products.filter((product) => product.description?.toLowerCase().includes(query)),
    );
    render(<Combobox label="Fruit" onSearch={onSearch} searchDelay={50} />);
    await userEvent.setup().type(input(), 'nut');
    expect(status().textContent).toBe('Searching…');
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch.mock.calls[0]?.[0]).toBe('nut');
    expect(status().textContent).toBe('1 result');
  });

  it('ignores an older answer that arrives after a newer one', async () => {
    const user = userEvent.setup();
    const answers: Record<string, (options: ComboboxOption[]) => void> = {};
    const signals: Record<string, AbortSignal> = {};
    render(
      <Combobox
        label="Fruit"
        searchDelay={0}
        onSearch={(query, { signal }) => {
          signals[query] = signal;
          return new Promise((resolve) => {
            answers[query] = resolve;
          });
        }}
      />,
    );
    await user.type(input(), 'h');
    await waitFor(() => expect(answers.h).toBeTruthy());
    await user.type(input(), 'e');
    await waitFor(() => expect(answers.he).toBeTruthy());
    expect(signals.h?.aborted).toBe(true);
    answers.he?.(products.slice(0, 1));
    await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1));
    answers.h?.(products);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
      'BLT-M6Hex bolt, M6',
    ]);
  });

  it('reports a failed search and skips queries under minQueryLength', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn(async () => {
      throw new Error('down');
    });
    render(
      <Combobox
        label="Fruit"
        searchDelay={0}
        minQueryLength={2}
        onSearch={onSearch}
        errorMessage="Search is unavailable"
      />,
    );
    await user.type(input(), 'a');
    expect(onSearch).not.toHaveBeenCalled();
    await user.type(input(), 'b');
    await waitFor(() => expect(status().textContent).toBe('Search is unavailable'));
    expect(screen.getByText('Search is unavailable', { selector: '[aria-hidden="true"]' })).toBeTruthy();
  });

  it('can be controlled', async () => {
    // style-check keep: a controlled parent has to be a component to hold the state.
    function Controlled() {
      const [fruit, setFruit] = useState<ComboboxOption | null>(fruits[0] ?? null);
      return (
        <>
          <Combobox label="Fruit" options={fruits} value={fruit} onValueChange={setFruit} />
          <button type="button" onClick={() => setFruit(fruits[3] ?? null)}>
            Pick cherry
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(input()).toHaveProperty('value', 'Apple');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Pick cherry' }));
    expect(input()).toHaveProperty('value', 'Cherry');
  });

  it('is skipped by Tab when disabled, and shows invalid and required', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Combobox label="Fruit" options={fruits} disabled />
        <Combobox label="Color" options={fruits} invalid required helperText="Pick a color." />
      </>,
    );
    await user.tab();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('combobox', { name: 'Color' }));
    const color = screen.getByRole('combobox', { name: 'Color' });
    expect(color.getAttribute('aria-invalid')).toBe('true');
    expect(color).toHaveProperty('required', true);
    expect(screen.getByRole('alert').textContent).toBe('Pick a color.');
    await assertNoAxeViolations(document.body);
  });

  it('submits the chosen value, not the typed text', async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Order">
        <Combobox label="Fruit" name="fruit" options={fruits} />
      </form>,
    );
    await user.type(input(), 'cher');
    await user.keyboard('{ArrowDown}{Enter}');
    const form = screen.getByRole('form', { name: 'Order' });
    if (!(form instanceof HTMLFormElement)) throw new Error('Order is not a form element');
    expect([...new FormData(form).entries()]).toEqual([['fruit', 'cherry']]);
  });
});
