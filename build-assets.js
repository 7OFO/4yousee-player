#!/usr/bin/env node

/**
 * Script de build de assets para Player 4USee
 * Transpila JavaScript com Babel e otimiza CSS com PostCSS
 * Gera um /public mais enxuto e compatível com Smart TVs
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logHeader(message) {
    log('\n' + '='.repeat(50), 'cyan');
    log(message, 'bright');
    log('='.repeat(50), 'cyan');
}

function logSuccess(message) {
    log(`✓ ${message}`, 'green');
}

function logError(message) {
    log(`✗ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠ ${message}`, 'yellow');
}

function logInfo(message) {
    log(`ℹ ${message}`, 'blue');
}

function executeCommand(command, description) {
    try {
        logInfo(`Executando: ${description}`);
        const output = execSync(command, { 
            stdio: 'pipe',
            encoding: 'utf8',
            cwd: __dirname
        });
        logSuccess(`${description} - Concluído`);
        return output;
    } catch (error) {
        logError(`${description} - Falhou`);
        logError(`Erro: ${error.message}`);
        throw error;
    }
}

function createDirectories() {
    logHeader('Criando Diretórios');
    
    const dirs = [
        path.join(__dirname, 'public', 'js'),
        path.join(__dirname, 'public', 'css'),
        path.join(__dirname, 'public', 'dist')
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logSuccess(`Diretório criado: ${path.relative(__dirname, dir)}`);
        } else {
            logInfo(`Diretório já existe: ${path.relative(__dirname, dir)}`);
        }
    });
}

function cleanPublic() {
    logHeader('Limpando Diretórios de Build');
    
    const dirsToClean = [
        path.join(__dirname, 'public', 'js'),
        path.join(__dirname, 'public', 'css'),
        path.join(__dirname, 'public', 'dist')
    ];
    
    dirsToClean.forEach(dir => {
        if (fs.existsSync(dir)) {
            try {
                fs.rmSync(dir, { recursive: true, force: true });
                logSuccess(`Diretório limpo: ${path.relative(__dirname, dir)}`);
            } catch (error) {
                logWarning(`Não foi possível limpar ${dir}: ${error.message}`);
            }
        }
    });
}

function transpileJavaScript(mode = 'development') {
    logHeader('Transpilando JavaScript com Babel');
    
    const srcDir = path.join(__dirname, 'src');
    const outDir = path.join(__dirname, 'public', 'js');
    
    // Configurar variável de ambiente para Babel
    process.env.NODE_ENV = mode;
    
    if (mode === 'development') {
        // Em desenvolvimento, apenas copiar arquivos sem transpilação
        logInfo('Modo desenvolvimento: copiando arquivos JS sem transpilação');
        const copyCommand = process.platform === 'win32' ? 
            `xcopy "${srcDir}" "${outDir}" /E /I /Y` : 
            `cp -r "${srcDir}/"* "${outDir}/"`;
        executeCommand(copyCommand, 'Cópia de arquivos JS');
    } else {
        // Em produção, criar um único arquivo minificado
        logInfo('Modo produção: criando bundle único minificado');
        
        // Ordem correta dos arquivos para dependências
        const jsFiles = [
            path.join(srcDir, 'logger.js'),
            path.join(srcDir, 'components', 'PlaylistManager.js'),
            path.join(srcDir, 'components', 'VideoManager.js'),
            path.join(srcDir, 'components', 'UIManager.js'),
            path.join(srcDir, 'components', 'VideoPlayer.js'),
            path.join(srcDir, 'player.js')
        ];
        
        // Verificar se todos os arquivos existem
        const existingFiles = jsFiles.filter(file => fs.existsSync(file));
        
        if (existingFiles.length === 0) {
            logError('Nenhum arquivo JavaScript encontrado para transpilação');
            return;
        }
        
        // Concatenar arquivos
        let concatenatedContent = '';
        existingFiles.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            concatenatedContent += `\n// === ${path.basename(file)} ===\n${content}\n`;
        });
        
        // Criar arquivo temporário
        const tempFile = path.join(__dirname, 'temp-bundle.js');
        fs.writeFileSync(tempFile, concatenatedContent);
        
        try {
            // Transpilar arquivo concatenado
            const babelCommand = `npx babel ${tempFile} --out-file ${path.join(outDir, 'app.min.js')} --minified --compact`;
            executeCommand(babelCommand, 'Transpilação e minificação do bundle');
            
            logSuccess(`Bundle criado: app.min.js (${(fs.statSync(path.join(outDir, 'app.min.js')).size / 1024).toFixed(2)} KB)`);
        } finally {
            // Remover arquivo temporário
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
        }
    }
}

function processCSS(mode = 'development') {
    logHeader('Processando CSS com PostCSS');
    
    const cssInput = path.join(__dirname, 'public', 'style.css');
    const cssOutput = path.join(__dirname, 'public', 'css', mode === 'production' ? 'style.min.css' : 'style.css');
    
    if (!fs.existsSync(cssInput)) {
        logWarning('Arquivo style.css não encontrado em /public');
        return;
    }
    
    // Configurar variável de ambiente para PostCSS
    process.env.NODE_ENV = mode;
    
    // Usar configuração do postcss.config.js
    const postcssCommand = `npx postcss ${cssInput} --output ${cssOutput}`;
    
    executeCommand(postcssCommand, 'Processamento CSS para Smart TVs');
}

function copyStaticFiles(mode = 'development') {
    logHeader('Copiando Arquivos Estáticos');
    
    const filesToCopy = [
        { src: 'src/playlist.json', dest: 'public/playlist.json' },
        { src: 'src/style.css', dest: 'public/style.css' },
        { src: 'src/playlist.json', dest: 'public/dist/playlist.json' }
    ];
    
    filesToCopy.forEach(({ src, dest }) => {
        const srcPath = path.join(__dirname, src);
        const destPath = path.join(__dirname, dest);
        
        if (fs.existsSync(srcPath)) {
            try {
                fs.copyFileSync(srcPath, destPath);
                logSuccess(`Copiado: ${src} → ${dest}`);
            } catch (error) {
                logError(`Erro ao copiar ${src}: ${error.message}`);
            }
        } else {
            logWarning(`Arquivo não encontrado: ${src}`);
        }
    });
    
    // Gerar index.html otimizado na pasta public
    generateIndexHTML(mode);
}

function generateIndexHTML(mode = 'development') {
    logHeader('Gerando index.html Otimizado');
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    
    let htmlContent;
    
    if (mode === 'production') {
        // HTML otimizado para produção com bundle único
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Player 4USee - Smart TV</title>
  <link rel="stylesheet" href="css/style.min.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Smart TV Compatibility -->
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
</head>
<body>
  <div id="video-container">
    <video id="video1" autoplay playsinline></video>
    <video id="video2" autoplay playsinline class="hidden"></video>
  </div>
  <div id="description"></div>
  
  <!-- Bundle único minificado -->
  <script src="js/app.min.js"></script>
</body>
</html>`;
    } else {
        // HTML para desenvolvimento com arquivos separados
        htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Player 4USee - Development</title>
  <link rel="stylesheet" href="style.css">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
  <div id="video-container">
    <video id="video1" autoplay playsinline></video>
    <video id="video2" autoplay playsinline class="hidden"></video>
  </div>
  <div id="description"></div>
  
  <script src="js/logger.js"></script>
  <!-- Componentes -->
  <script src="js/components/PlaylistManager.js"></script>
  <script src="js/components/VideoManager.js"></script>
  <script src="js/components/UIManager.js"></script>
  <script src="js/components/VideoPlayer.js"></script>
  <!-- Player principal -->
  <script src="js/player.js"></script>
</body>
</html>`;
    }
    
    fs.writeFileSync(indexPath, htmlContent);
    logSuccess(`index.html gerado para modo ${mode.toUpperCase()}`);
}

function updateIndexHTML(mode = 'development') {
    logHeader('Atualizando index.html');
    
    const indexPath = path.join(__dirname, 'public', 'index.html');
    const distIndexPath = path.join(__dirname, 'public', 'dist', 'index.html');
    
    if (!fs.existsSync(indexPath)) {
        logWarning('index.html não encontrado');
        return;
    }
    
    let htmlContent = fs.readFileSync(indexPath, 'utf8');
    
    // Atualizar referências para arquivos transpilados
    if (mode === 'production') {
        // Usar arquivo único minificado
        htmlContent = htmlContent.replace(/src="\.\.\//g, 'src="');
        htmlContent = htmlContent.replace(/href="style\.css"/g, 'href="css/style.min.css"');
        
        // Substituir todos os scripts por um único bundle
        const scriptRegex = /<script src="[^"]*\.js"><\/script>/g;
        const allScripts = htmlContent.match(scriptRegex);
        
        if (allScripts && allScripts.length > 0) {
            // Remover todos os scripts individuais
            htmlContent = htmlContent.replace(scriptRegex, '');
            
            // Adicionar apenas o bundle minificado antes do </body>
            const bundleScript = '  <script src="js/app.min.js"></script>';
            htmlContent = htmlContent.replace('</body>', bundleScript + '\n</body>');
            
            logInfo(`Substituídos ${allScripts.length} scripts por bundle único`);
        }
        
        // Adicionar meta tags para Smart TVs
        const smartTVMetas = `
  <!-- Smart TV Compatibility -->
  <meta name="format-detection" content="telephone=no">
  <meta name="msapplication-tap-highlight" content="no">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">`;
        
        htmlContent = htmlContent.replace('</head>', smartTVMetas + '\n</head>');
    } else {
        // Em desenvolvimento, manter caminhos originais
        logInfo('Modo desenvolvimento: mantendo caminhos originais dos arquivos');
    }
    
    fs.writeFileSync(distIndexPath, htmlContent);
    logSuccess('index.html atualizado com referências corretas');
}

function showBuildSummary(mode) {
    logHeader('Resumo do Build');
    
    const publicDir = path.join(__dirname, 'public');
    const jsDir = path.join(publicDir, 'js');
    const cssDir = path.join(publicDir, 'css');
    
    logInfo(`Modo: ${mode.toUpperCase()}`);
    
    // Mostrar arquivos JavaScript
    if (fs.existsSync(jsDir)) {
        const jsFiles = fs.readdirSync(jsDir, { recursive: true });
        logInfo(`Arquivos JavaScript (${jsFiles.length}):`);
        jsFiles.forEach(file => {
            const filePath = path.join(jsDir, file);
            const stats = fs.statSync(filePath);
            const sizeInKB = (stats.size / 1024).toFixed(2);
            log(`  📄 ${file} (${sizeInKB} KB)`, 'cyan');
        });
    }
    
    // Mostrar arquivos CSS
    if (fs.existsSync(cssDir)) {
        const cssFiles = fs.readdirSync(cssDir);
        logInfo(`Arquivos CSS (${cssFiles.length}):`);
        cssFiles.forEach(file => {
            const filePath = path.join(cssDir, file);
            const stats = fs.statSync(filePath);
            const sizeInKB = (stats.size / 1024).toFixed(2);
            log(`  🎨 ${file} (${sizeInKB} KB)`, 'magenta');
        });
    }
    
    logSuccess('Build de assets concluído com sucesso!');
}

function showUsage() {
    logHeader('Player 4USee - Build de Assets');
    log('Uso: node build-assets.js [modo]\n');
    log('Modos:');
    log('  dev        Build para desenvolvimento (padrão)');
    log('  prod       Build para produção (minificado)');
    log('  clean      Limpar arquivos de build');
    log('  --help     Mostrar esta ajuda\n');
    log('Exemplos:');
    log('  node build-assets.js dev');
    log('  node build-assets.js prod');
    log('  node build-assets.js clean\n');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    const mode = args[0] || 'dev';
    
    try {
        if (mode === 'clean') {
            cleanPublic();
            return;
        }
        
        const buildMode = mode === 'prod' ? 'production' : 'development';
        
        cleanPublic();
        createDirectories();
        transpileJavaScript(buildMode);
        processCSS(buildMode);
        copyStaticFiles(buildMode);
        showBuildSummary(buildMode);
        
    } catch (error) {
        logError(`Erro durante o build: ${error.message}`);
        process.exit(1);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    main();
}

module.exports = {
    transpileJavaScript,
    processCSS,
    cleanPublic,
    createDirectories
};