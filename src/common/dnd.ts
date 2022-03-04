import * as PIXI from 'pixi.js'
import { Application } from './app'

type ZoneCallback = (el: PIXI.Sprite, zone: PIXI.Container) => void

interface ZoneItem {
  model: PIXI.Container
  callback: ZoneCallback
}

export class DnD {
  app: Application
  zones: ZoneItem[] = []
  current: PIXI.Sprite
  moveListener: any

  constructor(app: Application) {
    this.app = app
    this.app.dnd = this
  }

  add(el: PIXI.Sprite) {
    el.interactive = true
    el.buttonMode = true
    el.zIndex = 1
    el.on('pointerdown', this.onDrag())
    el.on('pointerup', this.onDrop())
    el.on('pointerupoutside', this.onDrop())
  }

  remove(el: PIXI.Sprite) {
    el.interactive = false
    el.buttonMode = false
    el.removeAllListeners('pointerdown')
    el.removeAllListeners('pointerup')
    el.removeAllListeners('pointerupoutside')
    el.removeAllListeners('pointermove')
  }

  addZone(model: PIXI.Container, callback: ZoneCallback) {
    if (!this.zones.some((item) => item.model === model)) {
      this.zones.push({ model, callback })
    }
  }

  checkZoneMatch(el: PIXI.Sprite) {
    if (this.zones.length) {
      for (let i = 0; i < this.zones.length; i++) {
        const { model, callback } = this.zones[i]
        if (
          el.position.x > model.position.x
          && el.position.x < model.position.x + model.width
          && el.position.y > model.position.y
          && el.position.y < model.position.y + model.height
        ) {
          callback(el, model)
          break
        }
      }
    }
  }

  callbacks = {
    drag: [] as (() => void)[]
  }

  on(action: 'drag', callback: () => void) {
    this.callbacks[action].push(callback)
  }

  checkBounds(target: PIXI.Sprite, x: number, y: number) {
    const { top, left, right, bottom } = this.app.level
    const _h = target.height*target.anchor.y
    const _w = target.width*target.anchor.x
    if (
      (target.position.y - _h < top && y < target.position.y)
      || (target.position.y > bottom && y > target.position.y)
      || (target.position.x - _w < left && x < target.position.x)
      || (target.position.x + _w > right && x > target.position.x)
    ) {
      return false
    }
    return true
  }

  private onDrag() {
    const _this = this
    return function onDrag(e: PIXI.InteractionEvent) {
      const obj = e.currentTarget as any
      obj.draged = true
      obj.droped = false
      obj.dragData = e.data
      obj.dragMode = 1
      obj.dragPointerStart = e.data.getLocalPosition(obj.parent)
      obj.dragObjStart = new PIXI.Point()
      obj.dragObjStart.copyFrom(obj.position)
      obj.dragGlobalStart = new PIXI.Point()
      obj.dragGlobalStart.copyFrom(e.data.global)
      obj.zIndex = 2

      obj.on('pointermove', _this.onMove())
      _this.current = obj
      _this.callbacks.drag.forEach((fn) => fn())
    }
  }

  private onDrop() {
    const _this = this
    return function onDrop(this: PIXI.Sprite, e: PIXI.InteractionEvent) {
      const obj = e.currentTarget as any
      obj.removeAllListeners('pointermove')
      obj.draged = false
      if (obj.moved) obj.droped = true
      if (!(obj as any).dragMode) return
      ;(obj as any).dragMode = 0
      obj.zIndex = 1
      _this.checkZoneMatch(this)
    }
  }

  private onMove() {
    const _this = this
    return function onMove(e: PIXI.InteractionEvent) {
      const obj = _this.current as any
      if (!obj.dragMode) return
      obj.moved = true
      const data = obj.dragData
      if (obj.dragMode === 1) {
        if (
          Math.abs(data.global.x - obj.dragGlobalStart.x) +
          Math.abs(data.global.y - obj.dragGlobalStart.y) >= 3
        ) obj.dragMode = 2
      }
      if (obj.dragMode === 2) {
        const dragPointerEnd = data.getLocalPosition(obj.parent)
        const _x = obj.dragObjStart.x + (dragPointerEnd.x - obj.dragPointerStart.x)
        const _y = obj.dragObjStart.y + (dragPointerEnd.y - obj.dragPointerStart.y)
        if (_this.checkBounds(obj, _x, _y)) {
          obj.position.set(_x, _y)
        }
      }
    }
  }
}
