/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string
  readonly VITE_META_PIXEL_ID?: string
  readonly VITE_TRYON_MODE?: 'demo' | 'live'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
