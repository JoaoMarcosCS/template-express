import { UserEntity } from '../entity/user.entity';
import { CreateUserDTO } from '../usecase/create/create-user.schema';

export type FindUsersByParams = {
  columns?: Partial<Pick<UserEntity, 'id' | 'email' | 'document'>>;
  value?: string;
  cursor?: string;
  limit?: number;
};

export type PublicUser = Pick<UserEntity, 'id' | 'name' | 'email' | 'document' | 'status'>;

export interface IUserRepository {
  create(data: CreateUserDTO): Promise<PublicUser>;
  findBy(params: FindUsersByParams): Promise<UserEntity[]>;
  findByEmailWithPassword(email: string): Promise<UserEntity | null>;
  update(
    id: string,
    data: Partial<{ name: string; email: string; document: string }>,
  ): Promise<PublicUser | null>;
  delete(id: string): Promise<void>;
}
