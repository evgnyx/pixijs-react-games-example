/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from './app'

interface AssetsControls {
  add(key: string, url: string): AssetsControls
  load(): void
}

export class Assets {
  app: Application

  options = { crossOrigin: true }

  constructor(app: Application) {
    this.app = app
  }

  add(key: string, url: string): AssetsControls {
    this.app.loader.add(key, url, this.options)
    return {
      add: this.add.bind(this),
      load: this.load.bind(this)
    }
  }

  load() {
    this.app.loader.load(this.app.onAssetsLoaded.bind(this.app))
  }
}
