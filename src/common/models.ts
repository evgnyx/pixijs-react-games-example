/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js'
import { Application } from './app'
import { Entity } from './entity'

interface ModelOptions {
  animated: boolean
}

interface ModelsMapItem extends Record<string, unknown> {
  x?: number | string
  y?: number
}

interface ModelsMap {
  [key: string]: ModelsMapItem
}

interface ModelType extends ModelsMapItem {
  texture: PIXI.Texture,
}

type ModelsListType = { [key: string]: ModelType }

export class Models {
  app: Application
  map: ModelsMap
  all = {} as ModelsListType
  sprites = {} as { [key: string]: ModelsListType }

  constructor(app: Application, map: ModelsMap) {
    this.app = app
    this.app.models = this
    this.map = map
  }

  load() {
    for (const key in this.app.loader.resources) {
      if (/_image$/.test(key)) continue
      const res = this.app.loader.resources[key]
      if (res.extension === 'json') {
        this.sprites[key] = {}
        for (const key2 in res.textures) {
          this.sprites[key][key2] = {
            texture: res.textures[key2],
            ...(key2 in this.map ? this.map[key2] : {}) as any
          }
        }
      }
      else {
        this.all[key] = {
          texture: res.texture!,
          ...(key in this.map ? this.map[key] : {}) as any
        }
      }
    }
    this.app.onModelsLoaded()
  }

  render(name: string): PIXI.Sprite {
    const model = this.get(name)
    this.app.stage.addChild(model)
    return model
  }

  get(name: string, options = {} as ModelOptions): PIXI.Sprite {
    let model = null
    if (name in this.all) model = this.all[name]
    else if (options?.animated) {
      if (name in this.sprites) {
        model = {
          textures: Object.keys(this.sprites[name])
            .map((key) => this.sprites[name][key].texture),
          ...this.map[name]
        }
      }
    }
    else {
      for (const key in this.sprites) {
        if (name in this.sprites[key]) {
          model = this.sprites[key][name]
          break
        }
      }
    }
    return new Entity(this.app.level, { model, ...options }).pixi
  }
}
