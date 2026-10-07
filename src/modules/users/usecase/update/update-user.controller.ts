import { validateWithZod } from '@/shared/utils/validation-with-zod';
import { Request, Response } from 'express';
import { UpdateUserRequestSchema } from './update-user.request.schema';
import { container } from 'tsyringe';
import { UpdateUserUseCase } from './update-user.usecase';

export class UpdateUserController {
  async handle(req: Request, res: Response) {
    const id = req.params.id as string;
    const safeData = validateWithZod(UpdateUserRequestSchema, req.body);

    const useCase = container.resolve(UpdateUserUseCase);

    const user = await useCase.execute(id, safeData);

    res.status(200).json(user);
  }
}
