/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js'

export class Entity {
  pixi: any

  constructor(level: any, {
    model,
    animated,
    interactive,
    zIndex,
  }: any) {
    if (animated) {
      this.pixi = new PIXI.AnimatedSprite(model.textures)
    }
    else {
      this.pixi = new PIXI.Sprite(model.texture)
    }

    this.pixi.scale.set(level.scaleX, level.scaleY)

    if (zIndex) this.pixi.zIndex = zIndex
    if (model.anchor) this.pixi.anchor.set(...model.anchor)
    if ('x' in model) {
      if (model.x === 'center') {
        this.pixi.position.x = level.width/2
        this.pixi.anchor.x = 0.5
      }
      else {
        this.pixi.position.x = model.x*level.scaleX
      }
    }
    if ('y' in model) this.pixi.position.y = model.y*level.scaleY
    if ('alpha' in model) this.pixi.alpha = model.alpha

    if (interactive) {
      this.pixi.interactive = true
      this.pixi.buttonMode = true
    }
  }
}
