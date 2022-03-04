/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js'
import { Models } from './models'
import { Level } from './level'
import { UI } from './ui'
import { DnD } from './dnd'

export class Application {
  app: PIXI.Application
  loader: PIXI.Loader
  models: Models
  level: Level
  ui: UI
  dnd: DnD

  background = 0x9DD3F5
  width = 970
  height = 685

  constructor() {
    this.app = new PIXI.Application({
      backgroundColor: this.background,
      width: this.width,
      height: this.height,
      resolution: window.devicePixelRatio || 1,
      autoStart: false,
    })

    this.loader = PIXI.Loader.shared

    this.app.ticker.add(this.render.bind(this), undefined, PIXI.UPDATE_PRIORITY.LOW)
  }

  add(component: any) {
    component.init?.()
  }

  onAssetsLoaded() {
    this.models.load?.()
  }

  onModelsLoaded() {
    this.level.load?.()
  }

  get view() {
    return this.app.view
  }

  get screen() {
    return this.app.screen
  }

  get stage() {
    return this.app.stage
  }

  start() {
    this.app.ticker.start()
  }

  update() {
    this.app.ticker.update()
  }

  render(delta: number) {
    this.level.update?.(delta)
  }

  destroy() {
    this.app.ticker.stop()
    this.loader.reset()
    this.app.destroy()
    for (const key in PIXI.utils.BaseTextureCache) {
      delete PIXI.utils.BaseTextureCache[key]
    }
    for (const key in PIXI.utils.TextureCache) {
      delete PIXI.utils.TextureCache[key]
    }
  }
}
