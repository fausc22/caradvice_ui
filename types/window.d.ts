// Declaraciones de tipos para APIs globales

interface YTPlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  getPlayerState: () => number;
  [key: string]: any;
}

interface YT {
  Player: new (elementId: string | HTMLElement, options?: any) => YTPlayer;
  [key: string]: any;
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
}

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export {};

