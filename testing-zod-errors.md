# Testando erros de validação do Zod: unit test vs integração

## Contexto

O controller usa `validateWithZod` para validar o body da requisição antes de executar o use case:

```ts
// create-user.controller.ts
export class CreateUserController {
  async handle(req: Request, res: Response): Promise<Response> {
    const safeData = validateWithZod(CreateUserSchema, req.body);
    const useCase = container.resolve(CreateUserUseCase);
    const user = await useCase.execute(safeData);
    return res.status(201).json(user);
  }
}
```

```ts
// validation-with-zod.ts
export function validateWithZod<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const firstError = result.error.issues[0];
    throw new BadRequestException(firstError.message);
  }
  return result.data;
}
```

---

## O problema com o teste atual

O teste no spec tentava chamar o controller assim:

```ts
await expect(controller.handle(invalidDTO, {})).rejects.toThrow();
```

Isso está errado por dois motivos:

1. O controller espera `req.body` com o DTO, mas `invalidDTO` está sendo passado como o objeto `req` inteiro.
2. O controller usa `container.resolve(CreateUserUseCase)` do tsyringe, que não está configurado no teste, causando erro de DI antes mesmo da validação.

---

## Onde testar os erros do Zod

### Opção A — Testar o schema diretamente (unit test)

Testa `validateWithZod` com o schema em isolamento. É a abordagem mais simples e focada.

```ts
import { validateWithZod } from '@/shared/utils/validation-with-zod';
import { CreateUserSchema } from './create-user.schema';

it('should throw if document has fewer than 11 characters', () => {
  expect(() =>
    validateWithZod(CreateUserSchema, { ...mockCreateUserDTO, document: '123456789' })
  ).toThrow('CPF deve conter 11 dígitos');
});

it('should throw if password has no uppercase letter', () => {
  expect(() =>
    validateWithZod(CreateUserSchema, { ...mockCreateUserDTO, password: 'password1@' })
  ).toThrow('Senha deve conter ao menos uma letra maiúscula');
});
```

**Vantagens:** rápido, sem mock, testa cada regra de forma isolada.

---

### Opção B — Testar o controller com mocks do Express (unit test)

Monta um `req` falso e mocka o container para testar o wiring completo do controller.

```ts
import { container } from 'tsyringe';

it('should throw BadRequestException for invalid document', async () => {
  vi.spyOn(container, 'resolve').mockReturnValue({ execute: vi.fn() });

  const req = { body: { ...mockCreateUserDTO, document: '123456789' } } as any;
  const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any;

  await expect(controller.handle(req, res)).rejects.toThrow('CPF deve conter 11 dígitos');
});
```

**Vantagens:** testa o wiring controller → validação.  
**Desvantagens:** mais setup, mock do container é frágil.

---

### Opção C — Teste de integração (HTTP)

Sobe o app Express com supertest e faz requisições HTTP reais.

```ts
import request from 'supertest';
import { app } from '@/app';

it('should return 400 for invalid document', async () => {
  const res = await request(app)
    .post('/users')
    .send({ ...mockCreateUserDTO, document: '123456789' });

  expect(res.status).toBe(400);
  expect(res.body.message).toContain('CPF deve conter 11 dígitos');
});
```

**Vantagens:** testa o contrato HTTP completo (status code, formato do body de erro).  
**Desvantagens:** mais lento, requer banco ou mocks de infraestrutura.

---

## Recomendação

| O que testar | Abordagem |
|---|---|
| Regras de validação do Zod (cada campo, cada refinement) | **Opção A** — testar `validateWithZod` diretamente no spec |
| Status HTTP 400 e formato do body de erro | **Opção C** — teste de integração |

A **Opção A** cobre a maioria dos casos com muito menos custo. O teste de integração vale para garantir que o Express está retornando 400 corretamente — não para testar as mensagens do Zod campo a campo.
