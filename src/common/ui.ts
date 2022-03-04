import * as PIXI from 'pixi.js'
import { Application } from './app'

interface TextParams {
  text: string
  style: Partial<PIXI.ITextStyle>
  x?: number | string
  y?: number | string
  anchorX?: number
  anchorY?: number
  alpha?: number
  ui?: string
  paddingY?: number
  alignY?: string
}

type TextMap = { [key: string]: TextParams }

interface TaskType {
  type: 'show'
  element: string
}

interface ElementsItem {
  container: PIXI.Container
  sprite: PIXI.Sprite
  texts: { [key: string]: PIXI.Text }
}

export class UI {
  app: Application
  map: TextMap
  container: PIXI.Container
  texts: { [key: string]: PIXI.Text } = {}
  elements: { [key: string]: ElementsItem } = {}
  tasks: TaskType[] = []

  private hidden: { [key: string]: boolean } = {}

  constructor(app: Application, textMap: TextMap) {
    this.app = app
    this.app.ui = this
    this.map = textMap
  }

  load() {
    this.container = new PIXI.Container()
    const { ui } = this.app.models.sprites
    if (ui) {
      for (const key in ui) {
        const container = new PIXI.Container()
        const sprite = this.app.models.get(key)
        container.addChild(sprite)
        this.elements[key] = { container, sprite, texts: {} }
        this.container.addChild(container)
      }
    }
    this.app.stage.addChild(this.container)
    this.loadTexts()
  }

  loadTexts() {
    for (const key in this.map) {
      const params = this.map[key]
      const text = this.texts[key] = this.getText(key)
      if (params.ui) {
        const parent = this.elements[params.ui]
        parent.texts[key] = text
        parent.container.addChild(text)
        text.position.x = parent.sprite.position.x
        text.position.y = parent.sprite.position.y - (parent.sprite.height*parent.sprite.anchor.y)
        if (params.y === 'center') {
          text.anchor.y = 0.5
          text.position.y = parent.sprite.position.y - (parent.sprite.height/2*parent.sprite.anchor.y)
        }
        else if (typeof params.y === 'number') {
          text.position.y += params.y*this.app.level.scaleX
        }
      }
      else this.container.addChild(text)
    }
  }

  getText(name: string) {
    const textData = this.map[name]

    const style = textData.style
      ? { ...textData.style }
      : null
    if (style) {
      if (typeof style.fontSize === 'number')
        style.fontSize *= this.app.level.scaleX
      if (typeof style.lineHeight === 'number')
        style.lineHeight *= this.app.level.scaleX
      if (style.wordWrapWidth)
        style.wordWrapWidth *= this.app.level.scaleX
    }

    const text = new PIXI.Text(
      textData.text,
      style
        ? new PIXI.TextStyle(style)
        : undefined
    )
    if (textData.x === 'center') {
      text.anchor.x = 0.5
      text.x = this.app.screen.width/2
    }
    else if (typeof textData.x === 'number')
      text.x = textData.x*this.app.level.scaleX

    if (textData.y === 'center') {
      text.y = this.app.screen.height/2
    }
    else if (typeof textData.y === 'number')
      text.y = textData.y*this.app.level.scaleY

    if ('anchorX' in textData) text.anchor.x = textData.anchorX!
    if ('anchorY' in textData) text.anchor.y = textData.anchorY!
    if ('alpha' in textData) text.alpha = textData.alpha!

    return text
  }

  setText(ui: string, key: string, text: string) {
    const el = this.elements[ui].texts[key]
    if (el) {
      el.text = text
    }
  }

  hide(key?: string) {
    if (key) {
      this.hidden[key] = true
      this.elements[key] && (this.elements[key].container.alpha = 0)
    }
    else {
      for (const key in this.elements) {
        this.hidden[key] = true
        this.elements[key].container.alpha = 0
      }
    }
  }

  show(key: string) {
    this.hidden[key] = false
    this.elements[key].container.alpha = 1
  }

  hideText(key: string) {
    this.texts[key].alpha = 0
  }

  showText(key: string) {
    this.texts[key].alpha = 1
  }

  task(data: TaskType) {
    if (data.element in this.hidden) {
      if (data.type === 'show') this.hidden[data.element] = false
    }
    this.tasks.push(data)
  }

  update() {
    if (this.tasks.length) {
      for (let i = 0; i < this.tasks.length; i++) {
        const task = this.tasks[i]
        if (task.type === 'show') {
          if (
            this.hidden[task.element] !== true
            && this.elements[task.element].container.alpha < 1
          ) {
            this.elements[task.element].container.alpha += 0.05
          }
          else {
            this.tasks.splice(i, 1)
          }
        }
      }
    }
  }
}
