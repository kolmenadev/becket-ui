import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { assertNoAxeViolations } from '@becket-ui/a11y';

import { Button } from './components/Button';
import { Checkbox } from './components/Checkbox';
import { Dialog } from './components/Dialog';
import { Drawer } from './components/Drawer';
import { Field, FieldControl, FieldHelper, FieldLabel } from './components/Field';
import { Menu, MenuItem } from './components/Menu';
import { Radio, RadioGroup } from './components/Radio';
import { Switch } from './components/Switch';
import { Tab, TabList, TabPanel, Tabs } from './components/Tabs';
import { TextField } from './components/TextField';
import { Tooltip } from './components/Tooltip';

describe('Default primitive axe gate', () => {
  it('Button', async () => {
    const { container } = render(<Button>Save</Button>);
    await assertNoAxeViolations(container);
  });

  it('TextField', async () => {
    const { container } = render(<TextField label="Offset" helperText="Optional helper text" />);
    await assertNoAxeViolations(container);
  });

  it('Field', async () => {
    const { container } = render(
      <Field>
        <FieldLabel>Offset</FieldLabel>
        <FieldControl placeholder="3" />
        <FieldHelper>Optional helper text</FieldHelper>
      </Field>,
    );
    await assertNoAxeViolations(container);
  });

  it('Checkbox', async () => {
    const { container } = render(
      <Checkbox label="Accept terms" description="You can unsubscribe anytime." />,
    );
    await assertNoAxeViolations(container);
  });

  it('Radio', async () => {
    const { container } = render(
      <RadioGroup legend="Plan" name="plan">
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
      </RadioGroup>,
    );
    await assertNoAxeViolations(container);
  });

  it('Switch', async () => {
    const { container } = render(<Switch label="Notifications" />);
    await assertNoAxeViolations(container);
  });

  it('Tooltip wrapping Button', async () => {
    const { container } = render(
      <Tooltip content="Short glossary hint.">
        <Button>Hover me</Button>
      </Tooltip>,
    );
    await assertNoAxeViolations(container);
  });

  it('Dialog', async () => {
    const { container } = render(
      <Dialog open title="Confirm" footer={<Button>Cancel</Button>}>
        Native dialog body.
      </Dialog>,
    );
    await assertNoAxeViolations(container);
  });

  it('Drawer', async () => {
    const { container } = render(
      <Drawer open title="Filters" footer={<Button>Done</Button>}>
        Same a11y as Dialog.
      </Drawer>,
    );
    await assertNoAxeViolations(container);
  });

  it('Menu', async () => {
    const { container } = render(
      <Menu label="Actions">
        <MenuItem>Edit</MenuItem>
        <MenuItem>Duplicate</MenuItem>
      </Menu>,
    );
    await assertNoAxeViolations(container);
  });

  it('Tabs', async () => {
    const { container } = render(
      <Tabs defaultValue="one">
        <TabList>
          <Tab value="one">Overview</Tab>
          <Tab value="two">Activity</Tab>
        </TabList>
        <TabPanel value="one">First panel.</TabPanel>
        <TabPanel value="two">Second panel.</TabPanel>
      </Tabs>,
    );
    await assertNoAxeViolations(container);
  });
});
