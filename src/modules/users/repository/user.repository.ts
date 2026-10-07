import { Repository } from 'typeorm';
import { FindUsersByParams, IUserRepository, PublicUser } from './IUserRepository';
import { AppDataSource } from '@/infra/database/data-source';
import { UserEntity } from '../entity/user.entity';
import { CreateUserDTO } from '../usecase/create/create-user.schema';

const SEARCH_VECTOR = `to_tsvector('simple', coalesce(u.name, '') || ' ' || coalesce(u.document, '') || ' ' || coalesce(u.email, ''))`;

export class UserRepository implements IUserRepository {
  private repository: Repository<UserEntity>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserEntity);
  }

  async findBy({ columns, value, cursor, limit }: FindUsersByParams): Promise<UserEntity[]> {
    const builder = this.repository
      .createQueryBuilder('u')
      .select(['u.id', 'u.name', 'u.email', 'u.document', 'u.status'])
      .where('u.status = :status', { status: 1 })
      .orderBy('u.id', 'DESC')
      .limit(limit || 20);

    if (columns) {
      builder.andWhere(columns);
    }

    if (value) {
      builder.andWhere(`${SEARCH_VECTOR} @@ to_tsquery('simple', :value)`, { value });
    }

    if (cursor) {
      builder.andWhere('u.id < :cursor', { cursor });
    }

    return await builder.getMany();
  }

  async findByEmailWithPassword(email: string): Promise<UserEntity | null> {
    return await this.repository.findOne({
      where: { email, status: 1 },
      select: {
        id: true,
        name: true,
        email: true,
        document: true,
        password: true,
      },
    });
  }

  async create(data: CreateUserDTO): Promise<PublicUser> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .insert()
      .into(UserEntity)
      .values(data)
      .updateEntity(false)
      .returning(['id', 'name', 'email', 'document', 'status'])
      .execute();

    return raw[0];
  }

  async update(
    id: string,
    data: Partial<{ name: string; email: string; document: string }>,
  ): Promise<PublicUser | null> {
    const { raw } = await this.repository
      .createQueryBuilder()
      .update(UserEntity)
      .set(data)
      .where('id = :id', { id })
      .returning(['id', 'name', 'email', 'document', 'status'])
      .execute();

    return raw[0] ?? null;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
