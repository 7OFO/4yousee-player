//custom logger
function logError(message, error) {
  console.error('[ERRO] ' + message, error);
  writeLogToFile('ERRO', message, error);
}

function logEvent(message) {
  var timestamp = new Date().toISOString();
  console.log('[INFO] ' + timestamp + ': ' + message);
  writeLogToFile('INFO', message);
}

function logVideoError(message, videoUrl, errorCode) {
  var timestamp = new Date().toISOString();
  var logMessage = 'Erro de vídeo - URL: ' + videoUrl + ' - ' + message + ' - Código: ' + errorCode;
  console.error('[ERRO_DE_VIDEO] ' + timestamp + ': ' + logMessage);
  writeLogToFile('ERRO_DE_VIDEO', logMessage);
}

// Variável para controlar logs duplicados de troca de vídeo
var lastVideoChangeLog = null;

function logVideoChange(fromVideo, toVideo, index) {
  var timestamp = new Date().toISOString();
  var logMessage = 'Troca de vídeo - De: ' + fromVideo + ' - Para: ' + toVideo + ' - Índice: ' + index;
  
  // Verifica se é o mesmo log da última vez para evitar duplicação
  var currentLogKey = fromVideo + '|' + toVideo + '|' + index;
  if (lastVideoChangeLog === currentLogKey) {
    return; 
  }
  
  lastVideoChangeLog = currentLogKey;
  console.log('[TROCA_DE_VIDEO] ' + timestamp + ': ' + logMessage);
  writeLogToFile('TROCA_DE_VIDEO', logMessage);
}

function writeLogToFile(level, message, error) {
  try {
    var timestamp = new Date().toISOString();
    var logEntry = {
      timestamp: timestamp,
      level: level,
      message: message,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : null,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    var date = new Date().toISOString().split('T')[0];
    var filename = 'player-' + date + '.log';
    
    var existingLogs = localStorage.getItem('videoPlayerLogs_' + date) || '';
    var newLogLine = JSON.stringify(logEntry) + '\n';
    localStorage.setItem('videoPlayerLogs_' + date, existingLogs + newLogLine);
    
    if (typeof require !== 'undefined') {
      try {
        var fs = require('fs');
        var path = require('path');
        var logDir = path.join(process.cwd(), 'log');
        var logFile = path.join(logDir, filename);
        
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        
        fs.appendFileSync(logFile, newLogLine, 'utf8');
      } catch (fsError) {
        console.error('Erro ao escrever arquivo de log:', fsError);
      }
    }
  } catch (e) {
    console.error('Erro ao escrever log:', e);
  }
}

function getLogFilePath(date) {
  if (typeof require !== 'undefined') {
    try {
      var path = require('path');
      return path.join(process.cwd(), 'log', 'video-player-' + date + '.log');
    } catch (e) {
      console.error('Erro ao obter caminho do log:', e);
    }
  }
  return null;
}

function clearOldLogs() {
  try {
    var currentDate = new Date();
    var keys = Object.keys(localStorage);
    
    keys.forEach(function(key) {
      if (key.startsWith('videoPlayerLogs_')) {
        var logDate = new Date(key.replace('videoPlayerLogs_', ''));
        var daysDiff = (currentDate - logDate) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 1) {
          localStorage.removeItem(key);
        }
      }
    });
  } catch (e) {
    console.error('Erro ao limpar logs antigos:', e);
  }
}

clearOldLogs();

window.logError = logError;
window.logEvent = logEvent;
window.logVideoError = logVideoError;
window.logVideoChange = logVideoChange;
window.getLogFilePath = getLogFilePath;
window.clearOldLogs = clearOldLogs;