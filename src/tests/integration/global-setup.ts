import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

let container: StartedPostgreSqlContainer;

export async function setup(context: {
  provide: (key: 'pgConnectionUri', value: string) => void;
}) {
  container = await new PostgreSqlContainer('postgres:16-alpine').start();

  context.provide('pgConnectionUri', container.getConnectionUri());
}

export async function teardown() {
  await container.stop();
}

declare module 'vitest' {
  interface ProvidedContext {
    pgConnectionUri: string;
  }
}
