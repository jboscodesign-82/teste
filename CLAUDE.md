# CLAUDE.md

Este arquivo orienta o Claude Code ao trabalhar neste repositório.

## Visão geral

Landing page estática com uma galeria de **50 loaders (animações de carregamento) em CSS puro**.
Cada loader anima ao passar o mouse (hover) e tem um botão para copiar o código (HTML + CSS)
pronto para colar em qualquer projeto.

## Estrutura

- `index.html` — página única, autocontida (HTML + CSS + JS embutidos). Abre direto no navegador.
- `.claude/` — configuração do Claude Code (permissões, hooks, settings).

## Convenções

- Idioma de comunicação: português (pt-BR).
- Commits: mensagens claras e descritivas, no imperativo.
- Sempre rodar testes/linters relevantes antes de finalizar uma mudança.

## Comandos úteis

Não há build nem dependências. Para visualizar localmente:

```sh
# abrir direto no navegador
xdg-open index.html      # Linux
# ou servir via HTTP (recomendado, evita restrições de file://)
python3 -m http.server 8000   # depois acesse http://localhost:8000
```

### Como adicionar um novo loader

No `index.html`, acrescente um objeto ao array `loaders` em JS:
`{ name, h: HTML, c: CSS }`. Use uma classe (`.ldN`) e nomes de `@keyframes` (`kN`)
**únicos** para não colidir com os demais nem com o código que o usuário cola.
A trava de hover é global (classe `.loader` aplicada só no showcase), então o loader
não precisa de nenhum código específico de hover.
