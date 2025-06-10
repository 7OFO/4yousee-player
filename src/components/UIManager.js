// Componente para gerenciar a interface do usuário
function UIManager(descriptionElement) {
  var descriptionEl = descriptionElement;
  var descriptionTimeout;
  var isDescriptionVisible = true;

  function updateDescription(text, index) {
    if (descriptionEl) {
      var newText = text || 'Video ' + (index + 1);
      descriptionEl.textContent = newText;
      descriptionEl.className = 'fade-in';
      isDescriptionVisible = true;
    }
  }

  function hideDescription() {
    if (descriptionEl && isDescriptionVisible) {
      descriptionEl.className = 'fade-out';
      isDescriptionVisible = false;
    }
  }

  function showDescription() {
    if (descriptionEl && !isDescriptionVisible) {
      descriptionEl.className = 'fade-in';
      isDescriptionVisible = true;
    }
  }

  function setDescriptionTimeout(callback, delay) {
    if (descriptionTimeout) {
      clearTimeout(descriptionTimeout);
    }
    descriptionTimeout = setTimeout(callback, delay);
  }

  function clearDescriptionTimeout() {
    if (descriptionTimeout) {
      clearTimeout(descriptionTimeout);
      descriptionTimeout = null;
    }
  }

  function isDescriptionCurrentlyVisible() {
    return isDescriptionVisible;
  }

  function getDescriptionElement() {
    return descriptionEl;
  }

  function setDescriptionClass(className) {
    if (descriptionEl) {
      descriptionEl.className = className;
    }
  }

  function getDescriptionText() {
    return descriptionEl ? descriptionEl.textContent : '';
  }

  // Função para atualizar descrição com base no item atual da playlist
  function updateDescriptionFromPlaylist(playlistManager) {
    var currentItem = playlistManager.getCurrentItem();
    var currentIndex = playlistManager.getCurrentIndex();
    
    if (currentItem) {
      updateDescription(currentItem.description, currentIndex);
    }
  }

  // Interface pública
  return {
    updateDescription: updateDescription,
    hideDescription: hideDescription,
    showDescription: showDescription,
    setDescriptionTimeout: setDescriptionTimeout,
    clearDescriptionTimeout: clearDescriptionTimeout,
    isDescriptionCurrentlyVisible: isDescriptionCurrentlyVisible,
    getDescriptionElement: getDescriptionElement,
    setDescriptionClass: setDescriptionClass,
    getDescriptionText: getDescriptionText,
    updateDescriptionFromPlaylist: updateDescriptionFromPlaylist
  };
}

// Exportar para uso global
window.UIManager = UIManager;