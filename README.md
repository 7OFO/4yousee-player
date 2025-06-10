# Player 4USee

Um player desenvolvido com JavaScript puro e Electron.

## Instalação

```bash
npm install
```

## Desenvolvimento

### Executar localmente
```bash
# Servir arquivos localmente para debug
python -m http.server 8000
# Ou utilizando live server na porta que ele gerar
# Acesse: http://localhost:8000/src
```

## Builds

### Babel (Web)
```bash

npm run build:web

# Limpar builds
npm run clean
```

### Electron (Desktop)
```bash
# Build para Windows
npm run build:win

# Build para Linux
npm run build:linux

# Build para todas as plataformas
npm run build:all
```

## Estrutura de Saída

- **Desenvolvimento**: `src/` - arquivos separados para debug
- **Produção**: `public/` - bundle único otimizado
- **Electron**: `dist/` - executáveis para desktop

## Compatibilidade

- WebOS (LG Smart TVs)
- Tizen (Samsung Smart TVs)  
- Android TV
- Navegadores modernos
- Electron (Windows/Linux)