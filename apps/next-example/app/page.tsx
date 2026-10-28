import NextLink from 'next/link';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Code,
  Heading,
  Pagination,
  Stack,
  Text,
  TextField,
  Tooltip,
} from '@becket-ui/react';
import { ClientIsland } from './client-island';

// `?page=` picks the current page, so this route renders on each request rather than at build
// time. The HTML is still complete and styled before any client JS runs.
export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  // Named for its four uses below: the three range checks and the page itself.
  const requested = Number((await searchParams).page);
  return (
    <Stack gap="md" align="start" style={{ padding: '2rem', maxWidth: '40rem' }}>
      <Heading as="h1" size="2xl">
        Becket UI Next example
      </Heading>
      <Text>
        Server Component, rendered per request: Button, Stack, Heading, Card, Field, Pagination.
        Packed tarballs, no <Code>panda.config</Code>. Brand primary is a CSS-variable override
        after <Code>index.css</Code>.
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
      {/* A function prop and Next's router link from a Server Component: no client JS of its own.
          A missing or invalid `?page=` falls back to the first page. */}
      <Pagination
        page={Number.isInteger(requested) && requested >= 1 && requested <= 8 ? requested : 1}
        pageCount={8}
        href={(page) => `/?page=${page}`}
        linkAs={NextLink}
      />
      <Tooltip content="Client leaf imported from a Server Component">
        <Button type="button" visual="outline">
          Tooltip target
        </Button>
      </Tooltip>
      <ClientIsland />
    </Stack>
  );
}
