// Componente para gerenciar elementos de vídeo e transições
function VideoManager(video1Element, video2Element) {
  var video1 = video1Element;
  var video2 = video2Element;
  var activeVideo = video1;
  var inactiveVideo = video2;
  var isTransitioning = false;
  var videoLoadTimeout;

  function getActiveVideo() {
    return activeVideo;
  }

  function getInactiveVideo() {
    return inactiveVideo;
  }

  function isCurrentlyTransitioning() {
    return isTransitioning;
  }

  function setTransitioning(state) {
    isTransitioning = state;
  }

  function swapVideos() {
    var temp = activeVideo;
    activeVideo = inactiveVideo;
    inactiveVideo = temp;
  }

  function clearVideoListeners(videoElement) {
    videoElement.onended = null;
    videoElement.onerror = null;
    videoElement.onloadstart = null;
    videoElement.oncanplay = null;
    videoElement.oncanplaythrough = null;
    videoElement.onstalled = null;
    
    if (videoLoadTimeout) {
      clearTimeout(videoLoadTimeout);
      videoLoadTimeout = null;
    }
  }

  function setupVideoHandlers(videoElement, item, onEndedCallback, onErrorCallback, onCanPlayCallback) {
    videoElement.onended = function() {
      if (videoElement === activeVideo && onEndedCallback) {
        onEndedCallback();
      }
    };

    videoElement.onerror = function(e) {
      var errorMsg = 'Erro ao carregar: ' + item.url;
      var errorCode = 'Desconhecido';
      
      if (videoElement.error) {
        switch(videoElement.error.code) {
          case videoElement.error.MEDIA_ERR_ABORTED:
            errorCode = 'Reprodução abortada';
            break;
          case videoElement.error.MEDIA_ERR_NETWORK:
            errorCode = 'Erro de rede';
            break;
          case videoElement.error.MEDIA_ERR_DECODE:
            errorCode = 'Erro de decodificação';
            break;
          case videoElement.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorCode = 'Formato não suportado';
            break;
          default:
            errorCode = 'Código: ' + videoElement.error.code;
        }
        errorMsg += ' - ' + errorCode;
      }
      logVideoError(errorMsg, item.url, errorCode);
      
      if (onErrorCallback) {
        onErrorCallback(videoElement, item);
      }
    };

    videoElement.onloadstart = function() {
      if (videoLoadTimeout) {
        clearTimeout(videoLoadTimeout);
      }
    };

    videoElement.oncanplaythrough = function() {
      if (videoLoadTimeout) {
        clearTimeout(videoLoadTimeout);
      }
      
      if (onCanPlayCallback) {
        onCanPlayCallback(videoElement, item, 'canplaythrough');
      }
    };

    videoElement.oncanplay = function() {
      if (videoLoadTimeout) {
        clearTimeout(videoLoadTimeout);
      }
      
      if (videoElement === inactiveVideo && !videoElement.oncanplaythrough) {
        if (onCanPlayCallback) {
          onCanPlayCallback(videoElement, item, 'canplay');
        }
      } else if (videoElement === activeVideo && !videoElement.oncanplaythrough) {
        if (onCanPlayCallback) {
          onCanPlayCallback(videoElement, item, 'canplay-fallback');
        }
      }
    };
    
    videoElement.onstalled = function() {
      var errorMsg = 'Vídeo travado: ' + item.description + '. Pulando para o próximo.';
      logVideoError(errorMsg, item.url, 'STALLED');
      
      if (onErrorCallback) {
        onErrorCallback(videoElement, item);
      }
    };
  }

  function startCrossfade(onComplete) {
    if (isTransitioning) return;
    
    isTransitioning = true;
    activeVideo.className = 'active';
    inactiveVideo.className = 'inactive';
    
    setTimeout(function() {
      activeVideo.className = 'inactive';
      inactiveVideo.className = 'active';
      
      setTimeout(function() {
        swapVideos();
        inactiveVideo.className = 'hidden';
        inactiveVideo.pause();
        inactiveVideo.currentTime = 0;
        
        isTransitioning = false;
        
        if (onComplete) {
          onComplete();
        }
      }, 1000); 
    }, 100);
  }

  function playVideoWithRetry(videoElement, onSuccess, onError) {
    var playPromise = videoElement.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.then(function() {
        if (onSuccess) onSuccess();
      }).catch(function() {
        videoElement.muted = true;
        setTimeout(function() {
          var retryPromise = videoElement.play();
          if (retryPromise && typeof retryPromise.catch === 'function') {
            retryPromise.then(function() {
              setTimeout(function() {
                videoElement.muted = false;
              }, 1000);
              if (onSuccess) onSuccess();
            }).catch(function(retryErr) {
              logError('Erro na segunda tentativa de reprodução', retryErr);
              if (onError) onError(retryErr);
            });
          }
        }, 500);
      });
    } else {
      if (onSuccess) onSuccess();
    }
  }

  function initializeVideo(videoElement, item, className) {
    videoElement.src = item.url;
    videoElement.className = className || 'active';
  }

  // Interface pública
  return {
    getActiveVideo: getActiveVideo,
    getInactiveVideo: getInactiveVideo,
    isCurrentlyTransitioning: isCurrentlyTransitioning,
    setTransitioning: setTransitioning,
    swapVideos: swapVideos,
    clearVideoListeners: clearVideoListeners,
    setupVideoHandlers: setupVideoHandlers,
    startCrossfade: startCrossfade,
    playVideoWithRetry: playVideoWithRetry,
    initializeVideo: initializeVideo
  };
}

// Exportar para uso global
window.VideoManager = VideoManager;