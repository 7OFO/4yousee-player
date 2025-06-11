// Componente principal do Video Player
function VideoPlayer(video1Element, video2Element, descriptionElement) {
  // Inicializar componentes
  var playlistManager = new PlaylistManager();
  var videoManager = new VideoManager(video1Element, video2Element);
  var uiManager = new UIManager(descriptionElement);

  // Estado interno
  var isInitialized = false;

  // Callbacks para eventos de vídeo
  function onVideoEnded() {
    playlistManager.moveToNext();
    crossfadeToNext();
  }

  function onVideoError(videoElement, item) {
    var mediaType = videoManager.getMediaType(item);
    var errorMsg = 'Erro no carregamento da ' + (mediaType === 'image' ? 'imagem' : 'vídeo') + ': ' + item.description + '. Pulando para o próximo.';
    logVideoError(errorMsg, item.url, 'LOAD_FAILED');
    
    // Sempre mover para o próximo item e fazer crossfade
    playlistManager.moveToNext();
    crossfadeToNext();
  }

  function onVideoCanPlay(videoElement, item, eventType) {
    if (eventType === 'canplaythrough') {
      if (videoElement === videoManager.getInactiveVideo()) {
        uiManager.updateDescriptionFromPlaylist(playlistManager);
        videoManager.startCrossfade();
      } else if (videoElement === videoManager.getActiveVideo()) {
        uiManager.updateDescriptionFromPlaylist(playlistManager);
        logEvent('Vídeo ativo carregado: ' + item.description);
      }
    } else if (eventType === 'canplay') {
      if (videoElement === videoManager.getInactiveVideo()) {
        uiManager.updateDescriptionFromPlaylist(playlistManager);
        setTimeout(function() {
          videoManager.startCrossfade();
        }, 500);
      }
    } else if (eventType === 'canplay-fallback') {
      uiManager.updateDescriptionFromPlaylist(playlistManager);
      logEvent('Vídeo ativo carregado (fallback): ' + item.description);
    }
  }

  function playVideo(index) {
    var item = playlistManager.getItemByIndex(index);
    if (!item) {
      logError('Item da playlist não encontrado no índice: ' + index, null);
      return;
    }

    var mediaType = videoManager.getMediaType(item);
    
    if (videoManager.isCurrentlyTransitioning()) {
      logEvent('Transição em andamento, aguardando...');
      setTimeout(function() {
        playVideo(index);
      }, 500);
      return;
    }

    var inactiveVideo = videoManager.getInactiveVideo();
    
    videoManager.clearVideoListeners(video1Element);
    videoManager.clearVideoListeners(video2Element);
    
    if (typeof preloadNextVideos === 'function') {
      preloadNextVideos(index, playlistManager.getPlaylist());
    }

    videoManager.setupVideoHandlers(inactiveVideo, item, onVideoEnded, onVideoError, onVideoCanPlay);
    
    if (mediaType === 'video') {
      inactiveVideo.src = item.url;
      inactiveVideo.load();
      
      // Estratégia de reprodução otimizada para Smart TVs
      videoManager.playVideoWithRetry(inactiveVideo);
    }
    // Para imagens, o setupVideoHandlers já cuida de tudo
  }

  function crossfadeToNext() {
    if (playlistManager.isPlaylistEmpty()) return;
    
    var currentItem = playlistManager.getCurrentItem();
    var previousIndex = playlistManager.getPreviousIndex();
    var previousItem = playlistManager.getItemByIndex(previousIndex);
    
    logVideoChange(
      previousItem.description || previousItem.url,
      currentItem.description || currentItem.url,
      playlistManager.getCurrentIndex()
    );
    
    playVideo(playlistManager.getCurrentIndex());
  }

  function initializeFirstVideo() {
    if (!playlistManager.isPlaylistEmpty()) {
      var firstItem = playlistManager.getCurrentItem();
      var activeVideo = videoManager.getActiveVideo();
      var inactiveVideo = videoManager.getInactiveVideo();
      var mediaType = videoManager.getMediaType(firstItem);

      activeVideo.className = 'active';
      inactiveVideo.className = 'hidden';
      
      videoManager.setupVideoHandlers(activeVideo, firstItem, onVideoEnded, onVideoError, onVideoCanPlay);
      
      if (mediaType === 'video') {
        activeVideo.src = firstItem.url;
        activeVideo.load();
        
        videoManager.playVideoWithRetry(activeVideo, function() {
          logEvent('Primeiro video iniciado com sucesso: ' + firstItem.description + ' (remoto)');
        }, function(error) {
          logError('Erro ao iniciar o primeiro video: ' + error.message);
        });
        
        logEvent('Aguardando primeiro vídeo: ' + firstItem.description + ' (remoto)');
      } else {
        logEvent('Aguardando primeira imagem: ' + firstItem.description + ' (remoto)');
      }
      
      if (typeof preloadNextVideos === 'function') {
        preloadNextVideos(0, playlistManager.getPlaylist());
      }
    }
  }

  function initialize() {
    if (isInitialized) return;
    
    playlistManager.loadPlaylist(function(error, playlist) {
      if (error) {
        logError('Erro ao carregar playlist', error);
        return;
      }
      
      if (playlist && playlist.length > 0) {
        isInitialized = true;
        initializeFirstVideo();
      }
    });
  }

  // Funções públicas para compatibilidade
  function updateDescription() {
    uiManager.updateDescriptionFromPlaylist(playlistManager);
  }

  function handleVideoError(videoElement, item) {
    onVideoError(videoElement, item);
  }

  // Interface pública
  return {
    initialize: initialize,
    playVideo: playVideo,
    updateDescription: updateDescription,
    handleVideoError: handleVideoError,
    getPlaylistManager: function() { return playlistManager; },
    getVideoManager: function() { return videoManager; },
    getUIManager: function() { return uiManager; }
  };
}

// Exportar para uso global
window.VideoPlayer = VideoPlayer;