var video1 = document.getElementById('video1');
var video2 = document.getElementById('video2');
var desc = document.getElementById('description');
var playlist = [];
var currentIndex = 0;
var isLoading = false;
var activeVideo = video1;
var inactiveVideo = video2;
var isTransitioning = false;

// Inicializar instância global do player
var videoPlayer = null;

// Função para obter a instância do player (lazy initialization)
function getVideoPlayer() {
  if (!videoPlayer) {
    videoPlayer = new VideoPlayer(video1, video2, desc);
  }
  return videoPlayer;
}

function loadPlaylist() {
  var player = getVideoPlayer();
  player.initialize();
}

function playVideo(index) {
  var player = getVideoPlayer();
  player.playVideo(index);
}

// Função mantida para compatibilidade com código legado
function handleVideoError(videoElement, item) {
  var player = getVideoPlayer();
  player.handleVideoError(videoElement, item);
}

function updateDescription() {
  var player = getVideoPlayer();
  player.updateDescription();
}

window.updateDescription = updateDescription;
window.handleVideoError = handleVideoError;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadPlaylist);
} else {
  loadPlaylist();
}
window.playVideo = playVideo;