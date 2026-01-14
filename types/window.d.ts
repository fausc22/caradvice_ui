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

interface TrustindexLoader {
  load: () => void;
  [key: string]: any;
}

interface Window {
  YT?: YT;
  onYouTubeIframeAPIReady?: () => void;
  TrustindexLoader?: TrustindexLoader;
  // API actual de Trustindex
  renderTrustindexWidgets?: () => void;
  Trustindex?: any;
  TrustindexWidget?: any;
  TrustindexReviewWidget?: any;
  TrustindexSliderWidget?: any;
  TrustindexMasonryWidget?: any;
  TrustindexPopupWidget?: any;
  TrustindexTopRatedWidget?: any;
  TrustindexFomoWidget?: any;
}

declare global {
  interface Window {
    YT?: YT;
    onYouTubeIframeAPIReady?: () => void;
    TrustindexLoader?: TrustindexLoader;
    // API actual de Trustindex
    renderTrustindexWidgets?: () => void;
    Trustindex?: any;
    TrustindexWidget?: any;
    TrustindexReviewWidget?: any;
    TrustindexSliderWidget?: any;
    TrustindexMasonryWidget?: any;
    TrustindexPopupWidget?: any;
    TrustindexTopRatedWidget?: any;
    TrustindexFomoWidget?: any;
  }
}

export {};

