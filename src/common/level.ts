/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Application } from './app'

export class Level {
  app: Application

  top: number
  left: number
  right: number
  bottom: number

  width: number
  height: number
  scaleX: number
  scaleY: number

  constructor(app: Application) {
    this.app = app
    this.app.level = this
  }

  y(value: number) {
    return value*this.scaleY
  }

  x(value: number) {
    return value*this.scaleX
  }

  load() {}
  update(delta: number) {}
  restart() {}

  configure() {
    const models = this.app.models.all
    const screen = this.app.screen
    this.width = screen.width
    this.height = screen.height
    this.scaleX = this.width/models.background.texture.orig.width
    this.scaleY = this.height/models.background.texture.orig.height
    this.top = 0
    this.left = 0
    this.right = this.width
    this.bottom = this.height
    this.app.models.render('background')
    this.app.ui.load()
  }
}
