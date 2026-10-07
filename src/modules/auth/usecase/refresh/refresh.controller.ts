import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { validateWithZod } from '@/shared/utils/validation-with-zod';
import { RefreshSchema } from './refresh.schema';
import { RefreshUseCase } from './refresh.usecase';

export class RefreshController {
  async handle(req: Request, res: Response): Promise<Response> {
    const safeData = validateWithZod(RefreshSchema, req.body);

    const useCase = container.resolve(RefreshUseCase);

    const tokens = await useCase.execute(safeData);

    return res.status(200).json(tokens);
  }
}
