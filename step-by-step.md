## Inicializar um projeto

yarn init -y

## Instalar dependencias

yarn add express typeorm reflect-metadata pg zod tsyringe
yarn add -D typescript ts-node-dev @types/node @types/express

## Inicializar o typescript 

npx tsc --init

## Instalar e configurar ESLint + Prettier

yarn add -D eslint @eslint/js eslint-plugin-prettier eslint-config-prettier typescript-eslint prettier

- `eslint`: Linter para JavaScript/TypeScript.
- `@eslint/js`: Configurações base do ESLint.
- `eslint-plugin-prettier`: Integração do Prettier com o ESLint.
- `eslint-config-prettier`: Desativa regras do ESLint que conflitam com o Prettier.
- `typescript-eslint`: Suporte ao TypeScript no ESLint.
- `prettier`: Formatador de código.

## Uso do NVM com .nvmrc

Para garantir que todos usem a mesma versão do Node.js no projeto, utilize o arquivo `.nvmrc`:

1. Crie o arquivo `.nvmrc` na raiz do projeto com o conteúdo:
   
   ```
   v24.12.0
   ```

2. Para usar a versão correta, execute:
   
   ```bash
   nvm use
   ```

Se a versão não estiver instalada, rode:
   
   ```bash
   nvm install
   ```

## Configuração do TypeScript para Decorators e Path Alias

No arquivo `tsconfig.json`, as seguintes opções são importantes:

- `"experimentalDecorators": true` e `"emitDecoratorMetadata": true`:  
  Permitem o uso de decorators, necessários para bibliotecas como TypeORM e injeção de dependências (ex: tsyringe).

- `"baseUrl": "./src"` e `"paths": { "@/*": ["*"] }`:  
  Permitem o uso de path alias, facilitando importações como `@/modules/usuario/UsuarioService`.

**Atenção:**  
O Node.js não entende path alias do TypeScript nativamente em runtime.  
Por isso, é necessário instalar e usar a biblioteca `tsconfig-paths` junto com o `ts-node-dev`:

```bash
yarn add tsconfig-paths
```

E para rodar a aplicação em desenvolvimento sem quebrar os imports com alias, use:

```bash
ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/index.ts
```

**Explicação dos comandos:**

- `ts-node-dev`: Executa e reinicia o projeto em TypeScript automaticamente.
- `--respawn`: Reinicia o processo Node completamente a cada alteração.
- `--transpile-only`: Ignora o type-checking para maior velocidade.
- `-r tsconfig-paths/register`: Faz o Node entender os aliases definidos no `tsconfig.json`.

Assim, você pode usar decorators e path alias no seu código TypeScript sem problemas em tempo de execução.