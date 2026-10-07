import { describe, expect, it } from 'vitest';
import { UserRepository } from '@/modules/users/repository/user.repository';

const payload = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  document: '00967468078',
  password: 'hashed',
};

describe('UserRepository (integração - RETURNING)', () => {
  it('should return only public columns on create', async () => {
    const repository = new UserRepository();

    const user = await repository.create(payload);

    expect(Object.keys(user).sort()).toEqual(['document', 'email', 'id', 'name', 'status']);
    expect(user).toMatchObject({ name: payload.name, email: payload.email, status: 1 });
  });

  it('should return the updated row on update', async () => {
    const repository = new UserRepository();
    const { id } = await repository.create(payload);

    const updated = await repository.update(id, { name: 'Jane Doe' });

    expect(updated).toEqual({
      id,
      name: 'Jane Doe',
      email: payload.email,
      document: payload.document,
      status: 1,
    });
  });

  it('should return null when updating a missing user', async () => {
    const repository = new UserRepository();

    const updated = await repository.update('6f1c2b8e-1d4a-4b6e-9a3f-2c1d0e9b8a7f', {
      name: 'Jane Doe',
    });

    expect(updated).toBeNull();
  });
});
