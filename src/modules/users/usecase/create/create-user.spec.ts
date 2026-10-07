import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IUserRepository } from '../../repository/IUserRepository';
import { CreateUserUseCase } from './create-user.usecase';
import { CreateUserDTO, CreateUserSchema } from './create-user.schema';
import { MessageError } from '@/shared/enums/erros.enum';
import { UserEntity } from '../../entity/user.entity';
import { ILogger } from '@/infra/logger/ILogger';
import { ConflictException } from '@/shared/errors/errors';
import { hash } from '@/shared/utils/hash';

const mockCreateUserDTO: CreateUserDTO = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  document: '00967468078',
  password: '@Password123',
};

const existingUser = (overrides: Partial<UserEntity> = {}): UserEntity =>
  ({
    ...mockCreateUserDTO,
    id: '11111',
    status: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as UserEntity;

const mockRepository = (): IUserRepository => ({
  findBy: vi.fn().mockResolvedValue([]),
  findByEmailWithPassword: vi.fn(),
  create: vi.fn().mockImplementation(async ({ name, email, document }: CreateUserDTO) => ({
    id: 'uuid-1',
    name,
    email,
    document,
    status: 1,
  })),
  delete: vi.fn(),
  update: vi.fn(),
});

const mockLogger = (): ILogger => ({
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  child: vi.fn().mockReturnThis(),
});

describe('CreateUserUseCase', () => {
  let repository: IUserRepository;
  let useCase: CreateUserUseCase;

  beforeEach(() => {
    repository = mockRepository();
    useCase = new CreateUserUseCase(repository, mockLogger());
  });

  it('should create a new user', async () => {
    const result = await useCase.execute(mockCreateUserDTO);

    expect(result).toEqual({
      id: 'uuid-1',
      name: mockCreateUserDTO.name,
      email: mockCreateUserDTO.email,
      document: mockCreateUserDTO.document,
      status: 1,
    });
    expect(repository.findBy).toHaveBeenCalledTimes(2);
    expect(repository.findBy).toHaveBeenCalledWith({
      columns: { email: mockCreateUserDTO.email },
    });
    expect(repository.findBy).toHaveBeenCalledWith({
      columns: { document: mockCreateUserDTO.document },
    });
  });

  it('should throw ConflictException if email already exists', async () => {
    vi.mocked(repository.findBy).mockResolvedValueOnce([existingUser()]);

    const promise = useCase.execute(mockCreateUserDTO);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow(MessageError.EMAIL_ALREADY_EXISTS);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException if document already exists', async () => {
    vi.mocked(repository.findBy)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([existingUser({ email: 'john.doe.2@gmail.com' })]);

    const promise = useCase.execute(mockCreateUserDTO);

    await expect(promise).rejects.toBeInstanceOf(ConflictException);
    await expect(promise).rejects.toThrow(MessageError.DOCUMENT_ALREADY_EXISTS);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('should create user with hashed password', async () => {
    await useCase.execute(mockCreateUserDTO);

    const savedPassword = vi.mocked(repository.create).mock.calls[0][0].password;

    expect(savedPassword).not.toBe(mockCreateUserDTO.password);
    expect(await hash.compare(mockCreateUserDTO.password, savedPassword)).toBe(true);
  });

  it('should create user with document without formatting', async () => {
    const result = CreateUserSchema.parse({ ...mockCreateUserDTO, document: '009.674.680-78' });

    await useCase.execute(result);

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        document: '00967468078',
      }),
    );
  });
});
