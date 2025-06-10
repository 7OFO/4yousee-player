// Componente para gerenciar a playlist
function PlaylistManager() {
  var playlist = [];
  var currentIndex = 0;
  var isLoading = false;

  function loadPlaylist(callback) {
    if (isLoading) return;
    isLoading = true;
    
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'playlist.json', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        isLoading = false;
        if (xhr.status === 200) {
          try {
            var data = JSON.parse(xhr.responseText);
            playlist = data.playlist || [];
            if (playlist.length > 0) {
              if (callback) callback(null, playlist);
            } else {
              logError('Playlist vazia', null);
              if (callback) callback(new Error('Playlist vazia'));
            }
          } catch (err) {
            logError('Erro ao parsear JSON da playlist', err);
            if (callback) callback(err);
          }
        } else {
          var error = new Error('Erro ao carregar playlist - Status: ' + xhr.status);
          logError(error.message, null);
          if (callback) callback(error);
        }
      }
    };
    xhr.onerror = function() {
      isLoading = false;
      var error = new Error('Erro de rede ao carregar playlist');
      logError(error.message, null);
      if (callback) callback(error);
    };
    xhr.send();
  }

  function getPlaylist() {
    return playlist;
  }

  function getCurrentIndex() {
    return currentIndex;
  }

  function setCurrentIndex(index) {
    if (index >= 0 && index < playlist.length) {
      currentIndex = index;
    }
  }

  function getCurrentItem() {
    return playlist[currentIndex];
  }

  function getNextIndex() {
    return (currentIndex + 1) % playlist.length;
  }

  function getPreviousIndex() {
    return currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
  }

  function moveToNext() {
    currentIndex = getNextIndex();
    return getCurrentItem();
  }

  function getItemByIndex(index) {
    return playlist[index];
  }

  function getPlaylistLength() {
    return playlist.length;
  }

  function isPlaylistEmpty() {
    return playlist.length === 0;
  }

  // Interface pública
  return {
    loadPlaylist: loadPlaylist,
    getPlaylist: getPlaylist,
    getCurrentIndex: getCurrentIndex,
    setCurrentIndex: setCurrentIndex,
    getCurrentItem: getCurrentItem,
    getNextIndex: getNextIndex,
    getPreviousIndex: getPreviousIndex,
    moveToNext: moveToNext,
    getItemByIndex: getItemByIndex,
    getPlaylistLength: getPlaylistLength,
    isPlaylistEmpty: isPlaylistEmpty
  };
}

// Exportar para uso global
window.PlaylistManager = PlaylistManager;