# Smart Cifra

App web mobile-first para visualizar cifras com **auto-scroll inteligente por voz**.
Cante e a tela acompanha automaticamente, destacando a linha atual da letra.

## Funcionalidades

- Cadastro e edição de músicas com cifras
- Visualização formatada com acordes destacados
- Modo teleprompter em tela cheia
- Reconhecimento de voz contínuo via Web Speech API
- Sincronização automática: destaca e centraliza a linha que está sendo cantada
- Tema claro/escuro
- Ajuste de tamanho de fonte
- Armazenamento local (localStorage) — sem backend

## Instalação

```bash
cd smart-cifra
npm install
```

## Rodando localmente

```bash
npm run dev
```

Acesse `http://localhost:3000` no Chrome ou Edge (necessário para a Web Speech API).

## Build de produção

```bash
npm run build
npm start
```

## Estrutura do projeto

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home — lista de músicas
│   ├── nova/page.tsx       # Formulário de nova música
│   └── musicas/[id]/
│       ├── page.tsx        # Visualização da cifra
│       └── apresentar/     # Modo teleprompter com voz
├── components/
│   ├── SongForm.tsx        # Formulário criar/editar
│   ├── SongList.tsx        # Lista de músicas salvas
│   ├── ChordDisplay.tsx    # Exibição da cifra com highlight
│   ├── Teleprompter.tsx    # Modo apresentação completo
│   └── PresentationControls.tsx  # Controles + status de voz
├── hooks/
│   ├── useSpeechRecognition.ts   # Wrapper Web Speech API
│   └── useLyricSync.ts           # Sincronização voz ↔ letra
├── services/
│   └── songStorage.ts     # CRUD no localStorage
├── utils/
│   ├── textNormalization.ts  # Normalização e parsing de letras
│   └── similarityScore.ts    # Algoritmo de correspondência textual
└── types/
    ├── index.ts            # Tipos principais
    └── speech.d.ts         # Tipos Web Speech API
```

## Como funciona o algoritmo de sincronização

1. A letra é dividida em linhas; linhas de acordes são identificadas e marcadas
2. Cada frase reconhecida pelo microfone é normalizada (minúsculas, sem acentos, sem pontuação)
3. Para cada linha de letra, calcula-se um score composto por:
   - **Word overlap** (50%): quantas palavras em comum
   - **Levenshtein** (20%): similaridade de caracteres
   - **Sequência contínua** (30%): palavras consecutivas em ordem
4. Aplica-se um **bônus de proximidade** para linhas próximas da posição atual, evitando saltos erráticos
5. A linha com maior score (acima do threshold) é destacada e a tela faz scroll para ela

## Requisitos do navegador

- Chrome 33+ ou Edge 79+ (Web Speech API)
- HTTPS ou localhost para acesso ao microfone

## Roadmap

- [ ] Integração com Whisper API para maior precisão
- [ ] Perfis de usuário e biblioteca online
- [ ] App mobile React Native
- [ ] IA para detectar refrão/verso/ponte
- [ ] Ajuste automático de tonalidade
- [ ] Controle por pedal Bluetooth
