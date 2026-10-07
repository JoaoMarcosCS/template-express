import { beforeEach, describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '@/infra/http/index';
import { AppDataSource } from '@/infra/database/data-source';
import { UserEntity } from '@/modules/users/entity/user.entity';
import { generateTokens } from '@/modules/auth/token/token';

const users = [
  { name: 'Ana Souza', email: 'ana.souza@example.com', document: '52998224725' },
  { name: 'Bruno Lima', email: 'bruno.lima@example.com', document: '00967468078' },
  { name: 'Carla Souza', email: 'carla@example.com', document: '11144477735' },
  { name: 'Daniel Costa', email: 'daniel.costa@test.com', document: '12345678909' },
  { name: 'Eva Rocha', email: 'eva.rocha@example.com', document: '98765432100' },
];

const { accessToken } = generateTokens({
  id: '6f1c2b8e-1d4a-4b6e-9a3f-2c1d0e9b8a7f',
  name: 'Admin',
  email: 'admin@example.com',
  document: '00000000000',
});

const search = (query: Record<string, string | number> = {}) =>
  supertest(app)
    .get('/api/v1/users')
    .query(query)
    .set('Authorization', `Bearer ${accessToken}`);

const names = (body: { data: UserEntity[] }) => body.data.map((user) => user.name);

describe('GET /api/v1/users (integração)', () => {
  beforeEach(async () => {
    const repository = AppDataSource.getRepository(UserEntity);

    await repository.save(users.map((user) => repository.create({ ...user, password: 'hashed' })));
  });

  it('should return 401 without token', async () => {
    const response = await supertest(app).get('/api/v1/users');

    expect(response.status).toBe(401);
  });

  it('should return the first page with default limit when no cursor is provided', async () => {
    const response = await search();

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(users.length);
    expect(response.body.data[0]).not.toHaveProperty('password');
    expect(response.body.nextCursor).toBeNull();
  });

  it('should paginate with cursor without repeating or skipping users', async () => {
    const collected: string[] = [];
    let cursor: string | null = null;

    do {
      const response = await search(cursor ? { limit: 2, cursor } : { limit: 2 });

      expect(response.status).toBe(200);
      collected.push(...names(response.body));
      cursor = response.body.nextCursor;
    } while (cursor);

    expect(collected).toHaveLength(users.length);
    expect([...collected].sort()).toEqual(users.map((user) => user.name).sort());
  });

  it('should search by partial name', async () => {
    const response = await search({ search: 'souz' });

    expect(names(response.body).sort()).toEqual(['Ana Souza', 'Carla Souza']);
  });

  it('should search by e-mail', async () => {
    const response = await search({ search: 'daniel.costa@test.com' });

    expect(names(response.body)).toEqual(['Daniel Costa']);
  });

  it('should search by formatted document', async () => {
    const response = await search({ search: '009.674.680-78' });

    expect(names(response.body)).toEqual(['Bruno Lima']);
  });

  it('should combine search and cursor pagination', async () => {
    const first = await search({ search: 'souza', limit: 1 });
    const second = await search({ search: 'souza', limit: 1, cursor: first.body.nextCursor });

    expect([...names(first.body), ...names(second.body)].sort()).toEqual([
      'Ana Souza',
      'Carla Souza',
    ]);
    expect(second.body.nextCursor).toBeNull();
  });

  it('should return 400 for invalid cursor', async () => {
    const response = await search({ cursor: 'invalid' });

    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe('Cursor inválido');
  });
});
