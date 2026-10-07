import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '../../repository/IUserRepository';
import { SearchUsersDTO } from './search-users.schema';
import { UserEntity } from '../../entity/user.entity';

export type SearchUsersResponse = {
  data: UserEntity[];
  nextCursor: string | null;
};

const TSQUERY_SPECIAL_CHARACTERS = /[&|!():*<>'"\\]/g;
const FORMATTED_DOCUMENT = /^[\d.\-/\s]+$/;

export const buildTsQuery = (search?: string): string | undefined => {
  if (!search) {
    return undefined;
  }

  const normalized = FORMATTED_DOCUMENT.test(search) ? search.replace(/\D/g, '') : search;

  const tokens = normalized
    .toLowerCase()
    .replace(TSQUERY_SPECIAL_CHARACTERS, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => `${token}:*`);

  return tokens.length ? tokens.join(' & ') : undefined;
};

@injectable()
export class SearchUsersUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute({ search, cursor, limit }: SearchUsersDTO): Promise<SearchUsersResponse> {
    const users = await this.userRepository.findBy({
      value: buildTsQuery(search),
      cursor,
      limit: limit + 1,
    });

    const hasNextPage = users.length > limit;
    const data = hasNextPage ? users.slice(0, limit) : users;

    return {
      data,
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
    };
  }
}
