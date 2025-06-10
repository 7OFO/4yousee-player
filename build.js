#!/usr/bin/env node

/**
 * Script de build automatizado para Player 4USee
 * Suporta compilação para Windows e Linux
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

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
        if (error.stdout) {
            log(`Stdout: ${error.stdout}`, 'yellow');
        }
        if (error.stderr) {
            log(`Stderr: ${error.stderr}`, 'red');
        }
        throw error;
    }
}

function checkPrerequisites() {
    logHeader('Verificando Pré-requisitos');
    
    try {
        executeCommand('node --version', 'Verificando Node.js');
        executeCommand('npm --version', 'Verificando npm');
        
        if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
            logWarning('node_modules não encontrado. Instalando dependências...');
            executeCommand('npm install', 'Instalando dependências');
        } else {
            logSuccess('Dependências já instaladas');
        }
        
        logSuccess('Todos os pré-requisitos atendidos');
    } catch (error) {
        logError('Falha na verificação de pré-requisitos');
        process.exit(1);
    }
}

function cleanDist() {
    logHeader('Limpando Diretório de Build');
    
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
        try {
            fs.rmSync(distPath, { recursive: true, force: true });
            logSuccess('Diretório dist limpo');
        } catch (error) {
            logWarning(`Não foi possível limpar dist: ${error.message}`);
        }
    } else {
        logInfo('Diretório dist não existe');
    }
}

function buildForPlatform(platform) {
    logHeader(`Build para ${platform.toUpperCase()}`);
    
    const commands = {
        'windows': 'npm run build:win',
        'linux': 'npm run build:linux',
        'all': 'npm run build:all'
    };
    
    const command = commands[platform];
    if (!command) {
        logError(`Plataforma não suportada: ${platform}`);
        return false;
    }
    
    try {
        executeCommand(command, `Build para ${platform}`);
        logSuccess(`Build para ${platform} concluído com sucesso`);
        return true;
    } catch (error) {
        logError(`Build para ${platform} falhou`);
        return false;
    }
}

function showBuildResults() {
    logHeader('Resultados do Build');
    
    const distPath = path.join(__dirname, 'dist');
    if (!fs.existsSync(distPath)) {
        logWarning('Diretório dist não encontrado');
        return;
    }
    
    try {
        const files = fs.readdirSync(distPath, { withFileTypes: true });
        
        logInfo('Arquivos gerados:');
        files.forEach(file => {
            if (file.isFile()) {
                const filePath = path.join(distPath, file.name);
                const stats = fs.statSync(filePath);
                const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
                log(`  📦 ${file.name} (${sizeInMB} MB)`, 'cyan');
            } else if (file.isDirectory()) {
                log(`  📁 ${file.name}/`, 'magenta');
            }
        });
        
        logSuccess('Build concluído com sucesso!');
    } catch (error) {
        logError(`Erro ao listar resultados: ${error.message}`);
    }
}

function showUsage() {
    logHeader('Player 4USee - Script de Build');
    log('Uso: node build.js [opções]\n');
    log('Opções:');
    log('  windows    Build apenas para Windows');
    log('  linux      Build apenas para Linux');
    log('  all        Build para todas as plataformas');
    log('  clean      Limpar diretório de build');
    log('  --help     Mostrar esta ajuda\n');
    log('Exemplos:');
    log('  node build.js windows');
    log('  node build.js all');
    log('  node build.js clean\n');
}

function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        showUsage();
        return;
    }
    
    const platform = args[0] || 'all';
    
    try {
        if (platform === 'clean') {
            cleanDist();
            return;
        }
        
        checkPrerequisites();
        cleanDist();
        
        const success = buildForPlatform(platform);
        
        if (success) {
            showBuildResults();
        } else {
            logError('Build falhou');
            process.exit(1);
        }
        
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
    buildForPlatform,
    checkPrerequisites,
    cleanDist
};