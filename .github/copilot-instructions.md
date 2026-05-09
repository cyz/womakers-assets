# Copilot Instructions

## Stack

- Frontend: React 19 + TypeScript
- Build/dev server: Vite
- Lint: ESLint 9 + typescript-eslint
- Styling: CSS global em `src/index.css` e `src/App.css`
- Deploy: GitHub Pages (`gh-pages`) com `base: '/womakers-assets/'` em `vite.config.ts`

## Como trabalhar neste repositório

- Use `npm` para dependências e comandos.
- Comandos padrão: `npm run dev`, `npm run lint`, `npm run build`, `npm run preview`.
- O app é client-side only. Não introduza backend, API server ou dependências de SSR sem pedido explícito.
- A maior parte da lógica está em `src/App.tsx`; prefira mudanças pequenas e consistentes com a estrutura atual.
- Preserve o `base` do Vite em `/womakers-assets/` ao alterar rotas, assets ou exportação.

## Arquivos principais

- `src/main.tsx`: bootstrap da aplicação.
- `src/App.tsx`: estado principal, fluxo da UI e renderização dos banners.
- `src/App.css`: estilos dos componentes e tokens de tema.
- `src/index.css`: reset global e fontes.
- `src/assets/`: imagens usadas pelos layouts.

## Validação

- Rode `npm run lint` após mudanças de código.
- Rode `npm run build` se alterar renderização, exportação, assets ou configuração do Vite.
- Não há suíte de testes dedicada neste repositório; lint e build são as validações padrão.

## Referências

- Veja `AGENTS.md` para orientações gerais do projeto.
- Se a tarefa envolver componentes de geração de imagem, consulte `.github/skills/image-components/SKILL.md`.
