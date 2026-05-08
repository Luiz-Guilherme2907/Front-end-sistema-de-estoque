# Sistema de Controle de Estoque — Front-end

Interface web para gerenciamento de estoque com autenticação JWT, controle de produtos e movimentações.

## Tecnologias

- **React 19** + **TypeScript**
- **Vite 8** — bundler e dev server
- **Tailwind CSS 4** — estilização
- **Radix UI** — componentes acessíveis (Dialog, Select, Toast, etc.)
- **React Router DOM 7** — roteamento
- **Axios** — requisições HTTP
- **Lucide React** — ícones

## Funcionalidades

- Autenticação com JWT (login / registro)
- Listagem, cadastro, edição e exclusão de produtos
- Registro de movimentações de estoque (entrada/saída)
- Proteção de rotas autenticadas
- Feedback visual com Toast notifications

## Pré-requisitos

- Node.js 18+
- Back-end rodando em `http://localhost:8080` ([repositório da API](https://github.com/Luiz-Guilherme2907))

## Instalação e execução

```bash
npm install
npm run dev
```

Acesse em `http://localhost:5173`.

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera build de produção |
| `npm run preview` | Visualiza o build localmente |
| `npm run lint` | Executa o ESLint |

## Variáveis de ambiente

Crie um arquivo `.env.local` na raiz se precisar sobrescrever a URL da API:

```env
VITE_API_URL=http://localhost:8080
```

## Estrutura de pastas

```
src/
├── components/    # Componentes reutilizáveis e UI
├── pages/         # Páginas da aplicação
├── services/      # Chamadas à API (axios)
├── hooks/         # Custom hooks
└── types/         # Tipos TypeScript
```
