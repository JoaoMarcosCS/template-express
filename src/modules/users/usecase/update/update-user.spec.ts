import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IUserRepository } from '../../repository/IUserRepository';
import { UpdateUserUseCase } from './update-user.usecase';
import { NotFoundException } from '@/shared/errors/errors';

const updatedUser = {
  id: 'uuid-1',
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  document: '00967468078',
  status: 1,
};

const mockRepository = (): IUserRepository => ({
  findBy: vi.fn(),
  findByEmailWithPassword: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  update: vi.fn().mockResolvedValue(updatedUser),
});

describe('UpdateUserUseCase', () => {
  let repository: IUserRepository;
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    repository = mockRepository();
    useCase = new UpdateUserUseCase(repository);
  });

  it('should return the updated user from a single update call', async () => {
    const result = await useCase.execute('uuid-1', { name: 'Jane Doe' });

    expect(result).toEqual(updatedUser);
    expect(repository.update).toHaveBeenCalledWith('uuid-1', { name: 'Jane Doe' });
    expect(repository.findBy).not.toHaveBeenCalled();
  });

  it('should throw NotFoundException when no row is updated', async () => {
    vi.mocked(repository.update).mockResolvedValueOnce(null);

    await expect(useCase.execute('missing', { name: 'Jane Doe' })).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
