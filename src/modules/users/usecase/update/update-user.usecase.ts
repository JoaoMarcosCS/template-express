import { inject, injectable } from 'tsyringe';
import { IUserRepository, PublicUser } from '../../repository/IUserRepository';
import { UpdateUserRequestDTO } from './update-user.request.schema';
import { NotFoundException } from '@/shared/errors/errors';

@injectable()
export class UpdateUserUseCase {
  constructor(@inject('IUserRepository') private userRepository: IUserRepository) {}

  async execute(id: string, data: UpdateUserRequestDTO): Promise<PublicUser> {
    const updated = await this.userRepository.update(id, data);

    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return updated;
  }
}
