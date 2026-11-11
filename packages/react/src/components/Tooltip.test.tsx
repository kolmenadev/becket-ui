import { createRef, forwardRef, StrictMode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { Box } from './Box';
import { Button } from './Button';
import { Checkbox } from './Checkbox';
import { Code } from './Code';
import { Icon } from './Icon';
import { Kbd } from './Kbd';
import { Link } from './Link';
import { Mark } from './Mark';
import { Radio } from './Radio';
import { Select } from './Select';
import { SkipLink } from './SkipLink';
import { Switch } from './Switch';
import { Tag } from './Tag';
import { TextField } from './TextField';
import { Textarea } from './Textarea';
import { Tooltip } from './Tooltip';

describe('Tooltip', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does not add an extra tab stop around Button', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Before</button>
        <Tooltip content="Short glossary hint." delayMs={0}>
          <Button>Hover me</Button>
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    expect(trigger.parentElement?.getAttribute('tabindex')).not.toBe('0');

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Before' }));
    await user.tab();
    expect(document.activeElement).toBe(trigger);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('has no axe violations when wrapping a named Button', async () => {
    const { container } = render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        <Button>Hover me</Button>
      </Tooltip>,
    );
    await assertNoAxeViolations(container);
  });

  it('sets aria-describedby on the Button while open and closes on Escape', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Short glossary hint." delayMs={0}>
        <Button>Hover me</Button>
      </Tooltip>,
    );

    const trigger = screen.getByRole('button', { name: 'Hover me' });
    await user.hover(trigger);
    const tip = await screen.findByRole('tooltip');
    expect(trigger.getAttribute('aria-describedby')).toBe(tip.id);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('wraps plain text so it is keyboard reachable', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint" delayMs={0}>
        glossary
      </Tooltip>,
    );

    const trigger = screen.getByText('glossary');
    expect(trigger.tagName).toBe('SPAN');
    expect(trigger.getAttribute('tabindex')).toBe('0');

    trigger.focus();
    await user.hover(trigger);
    expect(await screen.findByRole('tooltip')).toBeTruthy();
  });

  it.each([
    {
      name: 'Button',
      trigger: <Button>Save</Button>,
      find: () => screen.getByRole('button', { name: 'Save' }),
    },
    {
      name: 'Button as span',
      trigger: <Button as="span">Save</Button>,
      find: () => screen.getByText('Save'),
    },
    {
      name: 'Link',
      trigger: <Link href="/docs">Docs</Link>,
      find: () => screen.getByRole('link', { name: 'Docs' }),
    },
    { name: 'Link without href', trigger: <Link>Docs</Link>, find: () => screen.getByText('Docs') },
    {
      name: 'SkipLink',
      trigger: <SkipLink />,
      find: () => screen.getByRole('link', { name: 'Skip to content' }),
    },
    {
      name: 'Switch',
      trigger: <Switch aria-label="Wi-Fi" />,
      find: () => screen.getByRole('switch', { name: 'Wi-Fi' }),
    },
    {
      name: 'Checkbox',
      trigger: <Checkbox label="Remember me" />,
      find: () => screen.getByRole('checkbox', { name: 'Remember me' }),
    },
    {
      name: 'Radio',
      trigger: <Radio name="plan" value="pro" label="Pro" />,
      find: () => screen.getByRole('radio', { name: 'Pro' }),
    },
    {
      name: 'Select',
      trigger: (
        <Select label="Size">
          <option>Small</option>
        </Select>
      ),
      find: () => screen.getByRole('combobox', { name: 'Size' }),
    },
    {
      name: 'TextField',
      trigger: <TextField label="Email" />,
      find: () => screen.getByRole('textbox', { name: 'Email' }),
    },
    {
      name: 'Textarea',
      trigger: <Textarea label="Notes" />,
      find: () => screen.getByRole('textbox', { name: 'Notes' }),
    },
    {
      name: 'Icon',
      trigger: (
        <Icon label="Info">
          <svg />
        </Icon>
      ),
      find: () => screen.getByRole('img', { name: 'Info' }),
    },
    {
      name: 'Avatar',
      trigger: <Avatar name="Ada Lovelace" />,
      find: () => screen.getByRole('img', { name: 'Ada Lovelace' }),
    },
    { name: 'Tag', trigger: <Tag>New</Tag>, find: () => screen.getByText('New') },
    { name: 'Badge', trigger: <Badge>3</Badge>, find: () => screen.getByText('3') },
    { name: 'Kbd', trigger: <Kbd>Ctrl</Kbd>, find: () => screen.getByText('Ctrl') },
    { name: 'Code', trigger: <Code>pnpm build</Code>, find: () => screen.getByText('pnpm build') },
    { name: 'Mark', trigger: <Mark>Beta</Mark>, find: () => screen.getByText('Beta') },
    {
      name: 'a with href',
      trigger: <a href="/docs">Docs</a>,
      find: () => screen.getByRole('link', { name: 'Docs' }),
    },
    { name: 'a without href', trigger: <a>Docs</a>, find: () => screen.getByText('Docs') },
    { name: 'span', trigger: <span>glossary</span>, find: () => screen.getByText('glossary') },
  ])('makes $name the only tab stop and describes it', async ({ trigger, find }) => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Hint" delayMs={0}>
          {trigger}
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(find());
    expect(find().getAttribute('aria-describedby')).toBe((await screen.findByRole('tooltip')).id);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('keeps a tabIndex the trigger sets', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Hint" delayMs={0}>
          <Tag tabIndex={0}>Focusable</Tag>
        </Tooltip>
        <Tooltip content="Hint" delayMs={0}>
          <Tag tabIndex={-1}>Skipped</Tag>
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Focusable'));
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('adds no tab stop while it has nothing to show', async () => {
    render(
      <>
        <Tooltip content="Hint" disabled>
          <Icon label="Info">
            <svg />
          </Icon>
        </Tooltip>
        <Tooltip content="">
          <Tag>New</Tag>
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    await userEvent.setup().tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it("keeps a control's own description next to the hint", async () => {
    const user = userEvent.setup();
    render(
      <Tooltip content="Hint" delayMs={0}>
        <Checkbox label="Remember me" description="For 30 days" />
      </Tooltip>,
    );

    const checkbox = screen.getByRole('checkbox');
    await user.tab();
    expect(checkbox.getAttribute('aria-describedby')).toBe(
      `${screen.getByText('For 30 days').id} ${(await screen.findByRole('tooltip')).id}`,
    );
    await user.keyboard('{Escape}');
    expect(checkbox.getAttribute('aria-describedby')).toBe(screen.getByText('For 30 days').id);
  });

  it('leaves a trigger with a control inside as one tab stop', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Hint" delayMs={0}>
          <Box>
            <Button>Save</Button>
          </Box>
        </Tooltip>
        <button type="button">After</button>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
    expect(await screen.findByRole('tooltip')).toBeTruthy();
    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('wraps a trigger that drops the props it is given', async () => {
    // style-check keep: a component has to be declared before it can be rendered.
    function DropsRef() {
      return <span>Ref dropped</span>;
    }
    // style-check keep: a component has to be declared before it can be rendered.
    const DropsProps = forwardRef<HTMLSpanElement>((_, ref) => (
      <span ref={ref}>Props dropped</span>
    ));
    const user = userEvent.setup();
    render(
      <>
        <Tooltip content="Hint" delayMs={0}>
          <DropsRef />
        </Tooltip>
        <Tooltip content="Hint" delayMs={0}>
          <DropsProps />
        </Tooltip>
      </>,
    );

    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Ref dropped').parentElement);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByText('Props dropped').parentElement);
    expect(document.activeElement?.getAttribute('aria-describedby')).toBe(
      (await screen.findByRole('tooltip')).id,
    );
  });

  it('points its ref at the trigger itself', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Tooltip ref={ref} content="Hint">
        <Tag>New</Tag>
      </Tooltip>,
    );
    expect(ref.current).toBe(screen.getByText('New'));
  });

  // The warning fires once per session, so no other test in this file renders a hidden trigger.
  it('warns once about a trigger hidden from assistive tech', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <StrictMode>
        <Tooltip content="Hint">
          <Icon>
            <svg />
          </Icon>
        </Tooltip>
        <Tooltip content="Hint">
          <Icon>
            <svg />
          </Icon>
        </Tooltip>
      </StrictMode>,
    );
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('accessible name'));
  });
});
