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
import { combobox as comboboxRecipe } from '@becket-ui/tokens/recipes';

import { assignRef } from '../helpers/nativeDialog';
import { Field, FieldControl, FieldError, FieldHelper, FieldLabel, type FieldSize } from './Field';
import { CheckIcon, ChevronDownIcon } from './Glyphs';
import { VisuallyHidden } from './VisuallyHidden';

export type ComboboxOption = {
  /** Submitted with the form and used to tell options apart. */
  value: string;
  /** First line, and the text the input shows once the option is chosen. */
  label: string;
  /** Second line, e.g. a description under a code. Matched by the built-in filter too. */
  description?: string;
  disabled?: boolean;
};

export type ComboboxProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  'size' | 'value' | 'defaultValue' | 'onChange' | 'type' | 'role' | 'children'
> & {
  label?: ReactNode;
  /** Shown under the input; read as the error when `invalid`. */
  helperText?: ReactNode;
  size?: FieldSize;
  invalid?: boolean;
  /** Stretch to the parent width. Default is token `sizes.field` (12.5rem). */
  fullWidth?: boolean;
  /** The options. Filtered as the user types, unless `filter={false}` or `onSearch` is set. */
  options?: ComboboxOption[];
  /** A labelled group above the options, e.g. recent or frequent picks. Always filtered locally. */
  suggestions?: ComboboxOption[];
  /** Name of the suggestions group. Default "Suggested". */
  suggestionsLabel?: string;
  /** Name of the options group, shown only next to suggestions. Default "Results". */
  resultsLabel?: string;
  /** The chosen option (controlled). `null` for none. */
  value?: ComboboxOption | null;
  defaultValue?: ComboboxOption | null;
  onValueChange?: (option: ComboboxOption | null) => void;
  /** Every change of the typed text, e.g. to load `options` yourself (then set `filter={false}`). */
  onInputChange?: (query: string) => void;
  /**
   * Server-side search. Called `searchDelay` ms after typing stops, with a signal that aborts when
   * a newer search starts; an answer to an older query is ignored even if it isn't aborted.
   */
  onSearch?: (query: string, options: { signal: AbortSignal }) => Promise<ComboboxOption[]>;
  /** Debounce for `onSearch`, in milliseconds. Default 300. */
  searchDelay?: number;
  /** Shortest query `onSearch` is called with. Default 1. */
  minQueryLength?: number;
  /** Replaces the built-in match (label, description or value contains the text, ignoring case and accents). `false` shows `options` as given. */
  filter?: false | ((option: ComboboxOption, query: string) => boolean);
  /** Shows the loading message, when you load `options` yourself. */
  loading?: boolean;
  /** Default "Searching…". */
  loadingMessage?: string;
  /** Default "No results". */
  emptyMessage?: string;
  /** Shown when `onSearch` rejects. Default "Couldn't load results". */
  errorMessage?: string;
  /** Announced to screen readers as results change. Default "1 result" / "n results". */
  countMessage?: (count: number) => string;
  /** Accessible name of the button that opens the list. Default "Show options". */
  toggleLabel?: string;
};

/**
 * A text input with a list of options to pick from (ARIA 1.2 combobox, list autocomplete with
 * manual selection). Typing filters the list or searches a server; a hidden input submits the
 * chosen option's `value` under `name`.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(
  (
    {
      label,
      helperText,
      size = 'md',
      invalid = false,
      fullWidth = false,
      options = [],
      suggestions = [],
      suggestionsLabel = 'Suggested',
      resultsLabel = 'Results',
      value,
      defaultValue = null,
      onValueChange,
      onInputChange,
      onSearch,
      searchDelay = 300,
      minQueryLength = 1,
      filter,
      loading = false,
      loadingMessage = 'Searching…',
      emptyMessage = 'No results',
      errorMessage = "Couldn't load results",
      countMessage = (count) => (count === 1 ? '1 result' : `${count} results`),
      toggleLabel = 'Show options',
      id,
      name,
      form,
      disabled,
      onKeyDown,
      onBlur,
      ...props
    },
    ref,
  ) => {
    // style-check keep: a hook can't run conditionally, so `id ?? useId()` isn't allowed.
    const autoID = useId();
    const inputID = id ?? autoID;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const current = value !== undefined ? value : uncontrolledValue;
    const [query, setQuery] = useState(current?.label ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const [hasTyped, setHasTyped] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [results, setResults] = useState<ComboboxOption[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasError, setHasError] = useState(false);
    const search = useRef<{ timer?: ReturnType<typeof setTimeout>; controller?: AbortController }>(
      {},
    );
    const styles = comboboxRecipe();

    // A new controlled value shows its label. Keyed by `value`, so a parent that recreates the same
    // option on every render doesn't reset what the user is typing.
    const [shownValue, setShownValue] = useState(current?.value ?? null);
    if ((current?.value ?? null) !== shownValue) {
      setShownValue(current?.value ?? null);
      setQuery(current?.label ?? '');
    }

    // style-check keep: cancels a pending search timer and request when the combobox unmounts.
    useEffect(
      () => () => {
        clearTimeout(search.current.timer);
        search.current.controller?.abort();
      },
      [],
    );

    // Matching starts once the user types; opening the list on a chosen option shows all of them.
    const [shownSuggestions, matchingOptions] = [suggestions, options].map((list) =>
      list.filter((option) => {
        if (!hasTyped || query.trim() === '') return true;
        if (filter) return filter(option, query);
        const [text, ...fields] = [
          query.trim(),
          option.label,
          option.description ?? '',
          option.value,
        ].map((each) => each.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase());
        return fields.some((field) => field.includes(text));
      }),
    );
    const shownResults = (
      onSearch ? (isSearching ? [] : results) : filter === false ? options : matchingOptions
    ).filter((option) => !shownSuggestions.some((suggestion) => suggestion.value === option.value));
    const items = [...shownSuggestions, ...shownResults];
    const message =
      loading || isSearching
      ? loadingMessage
      : hasError
        ? errorMessage
        : items.length === 0 && hasTyped && query.trim() !== ''
          ? emptyMessage
          : '';
    const isExpanded = isOpen && items.length > 0;
    const optionID = (index: number) => `${inputID}-option-${index}`;

    // style-check keep: keeps the active option in view inside the scrolling popup (DOM).
    useEffect(() => {
      if (activeIndex < 0) return;
      // jsdom has no scrollIntoView.
      document.getElementById(optionID(activeIndex))?.scrollIntoView?.({
        block: 'nearest',
      });
    }, [activeIndex, inputID]);

    const choose = (option: ComboboxOption | null) => {
      if (value === undefined) setUncontrolledValue(option);
      if ((option?.value ?? null) !== (current?.value ?? null)) onValueChange?.(option);
      setShownValue(option?.value ?? null);
      setQuery(option?.label ?? '');
      setIsOpen(false);
      setHasTyped(false);
      setActiveIndex(-1);
    };

    const renderOption = (option: ComboboxOption, index: number) => (
      <div
        // Suggestions are left out of the results, so a value is on screen once.
        key={option.value}
        id={optionID(index)}
        role="option"
        aria-selected={index === activeIndex}
        aria-disabled={option.disabled || undefined}
        className={styles.option}
        // Keeps focus in the input, so choosing doesn't blur it.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          if (!option.disabled) choose(option);
        }}
      >
        <span className={styles.optionText}>
          <span className={styles.optionLabel}>{option.label}</span>
          {option.description && (
            <span className={styles.optionDescription}>{option.description}</span>
          )}
        </span>
        {current?.value === option.value && <CheckIcon size="sm" className={styles.optionCheck} />}
      </div>
    );

    return (
      <Field id={inputID} size={size} invalid={invalid} fullWidth={fullWidth}>
        {label != null ? <FieldLabel id={`${inputID}-label`}>{label}</FieldLabel> : null}
        <div className={styles.control}>
          <FieldControl
            ref={(node) => {
              inputRef.current = node;
              assignRef(ref, node);
            }}
            {...props}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={isExpanded}
            aria-controls={`${inputID}-listbox`}
            aria-activedescendant={isExpanded && activeIndex >= 0 ? optionID(activeIndex) : undefined}
            disabled={disabled}
            value={query}
            onChange={(event) => {
              const text = event.target.value;
              setQuery(text);
              setIsOpen(true);
              setHasTyped(true);
              setActiveIndex(-1);
              onInputChange?.(text);
              if (!onSearch) return;
              clearTimeout(search.current.timer);
              search.current.controller?.abort();
              setHasError(false);
              if (text.trim().length < minQueryLength) {
                setResults([]);
                setIsSearching(false);
                return;
              }
              setIsSearching(true);
              search.current.timer = setTimeout(async () => {
                const controller = new AbortController();
                search.current.controller = controller;
                try {
                  // style-check keep: the answer has to be read before the abort check that guards it.
                  const found = await onSearch(text.trim(), { signal: controller.signal });
                  if (controller.signal.aborted) return;
                  setResults(found);
                } catch {
                  if (controller.signal.aborted) return;
                  setResults([]);
                  setHasError(true);
                }
                setIsSearching(false);
              }, searchDelay);
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (event.defaultPrevented) return;
              if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                setIsOpen(true);
                // Alt+Down opens the list without moving into it.
                if (event.altKey) return;
                const delta = event.key === 'ArrowDown' ? 1 : -1;
                // From the input, Down goes to the first option and Up to the last; both wrap
                // and skip disabled options.
                // style-check keep: worked out once, then read on every pass of the map below.
                const start = activeIndex >= 0 ? activeIndex : delta === 1 ? -1 : items.length;
                setActiveIndex(
                  [...items.keys()]
                    .map((offset) => (start + delta * (offset + 1) + 2 * items.length) % items.length)
                    .find((index) => !items[index]?.disabled) ?? -1,
                );
                return;
              }
              if (event.key === 'Enter' && isExpanded && items[activeIndex]) {
                event.preventDefault();
                choose(items[activeIndex]);
                return;
              }
              if (event.key === 'Escape') {
                // Open: close and keep the text. Closed: clear the text and the choice.
                if (isOpen) {
                  event.preventDefault();
                  setIsOpen(false);
                  setActiveIndex(-1);
                  return;
                }
                if (query !== '' || current) {
                  event.preventDefault();
                  choose(null);
                }
                return;
              }
              // Home, End and the side arrows edit the text: visual focus goes back to the input.
              if (['Home', 'End', 'ArrowLeft', 'ArrowRight'].includes(event.key)) setActiveIndex(-1);
            }}
            onBlur={(event) => {
              onBlur?.(event);
              setIsOpen(false);
              setActiveIndex(-1);
              setHasTyped(false);
              // Text that isn't a choice doesn't stay: empty clears the value, anything else
              // goes back to the chosen option's label.
              if (query.trim() === '') choose(null);
              else setQuery(current?.label ?? '');
            }}
          />
          <button
            type="button"
            // The input is the tab stop; the button is for pointers (APG combobox).
            tabIndex={-1}
            aria-label={toggleLabel}
            aria-expanded={isExpanded}
            aria-controls={`${inputID}-listbox`}
            disabled={disabled}
            className={styles.toggle}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              setIsOpen(!isOpen);
              setActiveIndex(-1);
              inputRef.current?.focus();
            }}
          >
            <ChevronDownIcon size="sm" />
          </button>
          <div
            className={styles.popup}
            hidden={!isOpen || (items.length === 0 && message === '')}
            onMouseDown={(event) => event.preventDefault()}
          >
            {/* Read from the status region below; shown here for sighted users. */}
            {message !== '' && (
              <div className={styles.message} aria-hidden="true">
                {message}
              </div>
            )}
            <div
              id={`${inputID}-listbox`}
              role="listbox"
              aria-labelledby={label != null ? `${inputID}-label` : undefined}
              aria-label={label != null ? undefined : props['aria-label']}
              hidden={!isExpanded}
              className={styles.listbox}
            >
              {/* Options render only while open, so a long list costs nothing until it's used. */}
              {!isExpanded ? null : shownSuggestions.length > 0 ? (
                <>
                  <div role="group" aria-labelledby={`${inputID}-suggestions`} className={styles.group}>
                    <div role="presentation" id={`${inputID}-suggestions`} className={styles.groupLabel}>
                      {suggestionsLabel}
                    </div>
                    {shownSuggestions.map((option, index) => renderOption(option, index))}
                  </div>
                  {shownResults.length > 0 && (
                    <div role="group" aria-labelledby={`${inputID}-results`} className={styles.group}>
                      <div role="presentation" id={`${inputID}-results`} className={styles.groupLabel}>
                        {resultsLabel}
                      </div>
                      {shownResults.map((option, index) =>
                        renderOption(option, shownSuggestions.length + index),
                      )}
                    </div>
                  )}
                </>
              ) : (
                shownResults.map((option, index) => renderOption(option, index))
              )}
            </div>
          </div>
        </div>
        <VisuallyHidden role="status">
          {isOpen ? message || (hasTyped ? countMessage(items.length) : '') : ''}
        </VisuallyHidden>
        {name != null && (
          <input type="hidden" name={name} form={form} value={current?.value ?? ''} disabled={disabled} />
        )}
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

Combobox.displayName = 'Combobox';
