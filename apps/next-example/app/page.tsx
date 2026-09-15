import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Heading,
  Stack,
  Text,
  TextField,
  Tooltip,
} from '@becket-ui/react';
import { ClientIsland } from './client-island';

export default function Page() {
  return (
    <Stack gap="md" align="start" style={{ padding: '2rem', maxWidth: '40rem' }}>
      <Heading as="h1" size="2xl">
        Becket UI Next example
      </Heading>
      <Text>
        Server Component: Button, Stack, Heading, Card, Field. Packed tarballs, no{' '}
        <code>panda.config</code>. Brand primary is a CSS-variable override after{' '}
        <code>index.css</code>.
      </Text>
      <Button type="button" visual="primary">
        Server button
      </Button>
      <Button type="button" visual="primary" withGradient>
        Server gradient
      </Button>
      <TextField label="Brand field" placeholder="sizes.field → 16rem" />
      <Card>
        <CardHeader>
          <CardTitle>Server card</CardTitle>
        </CardHeader>
        <CardBody>
          <Text>This copy is rendered on the server. Disable JavaScript: it stays styled.</Text>
        </CardBody>
      </Card>
      <Tooltip content="Client leaf imported from a Server Component">
        <Button type="button" visual="outline">
          Tooltip target
        </Button>
      </Tooltip>
      <ClientIsland />
    </Stack>
  );
}
