# Player 4USee

Um player desenvolvido com JavaScript puro.

## Instalação

```bash
npm install
```

## Desenvolvimento

### Executar localmente
```bash
# Build de desenvolvimento (arquivos separados)
npm run build:dev

# Servir arquivos localmente
python -m http.server 8000
# Ou utilizando live server na porta que ele gerar
# Acesse: http://localhost:8000/public
```

### Build de produção
```bash
# Build otimizado (bundle único)
npm run build:prod
```

## Builds

### Babel (Web)
```bash
# Desenvolvimento
npm run build:dev

# Produção
npm run build:prod

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

- **Desenvolvimento**: `public/` - arquivos separados para debug
- **Produção**: `public/` - bundle único otimizado
- **Electron**: `dist/` - executáveis para desktop

## Compatibilidade

- WebOS (LG Smart TVs)
- Tizen (Samsung Smart TVs)  
- Android TV
- Navegadores modernos
- Electron (Windows/Linux)