import { inject, injectable } from 'tsyringe';
import { IUserRepository, PublicUser } from '../../repository/IUserRepository';
import { CreateUserDTO } from './create-user.schema';
import { ConflictException } from '@/shared/errors/errors';
import { hash } from '@/shared/utils/hash';
import { MessageError } from '@/shared/enums/erros.enum';
import { ILogger } from '@/infra/logger/ILogger';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject('IUserRepository') private userRepository: IUserRepository,
    @inject('ILogger') private logger: ILogger,
  ) {}

  async execute(data: CreateUserDTO): Promise<PublicUser> {
    this.logger.info('Executing CreateUserUseCase', { data: { ...data, password: '***' } });

    const [emailAlreadyExists, documentAlreadyExists] = await Promise.all([
      this.userRepository.findBy({ columns: { email: data.email } }),
      this.userRepository.findBy({ columns: { document: data.document } }),
    ]);

    if (emailAlreadyExists.length > 0) {
      throw new ConflictException(MessageError.EMAIL_ALREADY_EXISTS);
    } else if (documentAlreadyExists.length > 0) {
      throw new ConflictException(MessageError.DOCUMENT_ALREADY_EXISTS);
    }

    const hashedPassword = await hash.generate(data.password);

    return await this.userRepository.create({
      name: data.name,
      email: data.email,
      document: data.document,
      password: hashedPassword,
    });
  }
}
