/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js'
import { Level } from '../common/level'
import { AppReduce } from './app'

interface ListItem {
  key: string
  model: PIXI.Sprite & { droped: boolean, dropCount: number }
  active: boolean
}

interface RemoveListItem {
  data: ListItem
  zoneX: number
  zoneY: number
  phase: number
}

export class ReduceLevel extends Level {
  list: ListItem[] = []
  bag: PIXI.AnimatedSprite
  bagStep: number
  dropZone: PIXI.Container
  elementsContainer: PIXI.Container

  removeList: RemoveListItem[] = []
  removedCount = 0
  active = true

  smile: PIXI.Sprite
  arrow: PIXI.Sprite
  arrowCount = 1
  arrowShow = false
  touched = false

  constructor(app: AppReduce) {
    super(app)
    this.app = app
    this.app.level = this
  }

  load() {
    this.configure()
    this.bottom = this.y(1270)

    this.app.dnd.on('drag', this.onDrag.bind(this))
    this.initBag()
    this.initStatic()
    this.updateDropZone()
    this.initItems()

    this.app.start()
  }

  onDrag() {
    if (!this.touched) {
      this.arrow.alpha = 1
      this.touched = true
    }
  }

  restart() {
    this.arrowShow = true
    this.arrowCount = 1
    this.touched = false
    this.initBag()
    this.initStatic()
    this.initItems()
    this.updateDropZone()
  }

  initStatic() {
    if (!this.smile) {
      this.smile = this.app.models.get('teeth')
      this.app.stage.addChild(this.smile)
    }

    if (!this.arrow) {
      this.arrow = this.app.models.get('arrow')
      this.app.stage.addChild(this.arrow)
    }

    this.smile.alpha = 0
    this.arrow.alpha = 0
  }

  initBag() {
    if (!this.bag) {
      this.bag = this.app.models.get('bag', { animated: true }) as PIXI.AnimatedSprite
      this.app.stage.addChild(this.bag)
    }
    this.removeList = []
    this.removedCount = 0
    this.bagStep = 0
    this.bag.gotoAndStop(this.bagStep)
  }

  initItems() {
    if (this.elementsContainer) {
      this.app.stage.removeChild(this.elementsContainer)
    }

    this.list = []

    const container = new PIXI.Container()
    container.sortableChildren = true

    for (const key in this.app.models.sprites.sprites) {
      const model = this.app.models.get(key) as any
      model.dropCount = 1
      this.list.push({
        key,
        model,
        active: true,
      })
      this.app.dnd.add(model)
      container.addChild(model)
    }
    this.elementsContainer = container
    this.app.stage.addChild(container)
  }

  onDropToZone(el: PIXI.Sprite, zone: PIXI.Container) {
    const item = this.list.find((item) => item.model === el)
    if (item) {
      this.app.dnd.remove(item.model)
      this.removeItem(item, zone)
    }
  }

  updateDropZone() {
    if (this.dropZone) {
      this.app.stage.removeChild(this.dropZone)
    }
    const dropZone = new PIXI.Graphics()
    const dropZoneWidth = this.bag.width - (150*this.scaleX)
    const dropZoneHeight = this.bag.height
    // dropZone.beginFill(0xDE3249)
    dropZone.drawRoundedRect(0, 0, dropZoneWidth, dropZoneHeight, 15)
    // dropZone.endFill()
    // dropZone.alpha = 0.5
    this.app.dnd.addZone(dropZone, this.onDropToZone.bind(this))
    this.app.stage.addChild(dropZone)
    this.dropZone = dropZone
    this.dropZone.position.set(
      this.bag.x + (75*this.scaleX),
      this.bag.y - this.bag.height,
    )
    this.updateArrow()
  }

  updateArrow() {
    this.arrow.position.set(
      this.dropZone.position.x + this.x(this.dropZone.width/2 + this.arrow.width/2),
      this.dropZone.position.y - this.y(150),
    )
  }

  removeItem(item: ListItem, zone: PIXI.Container) {
    item.active = false
    this.removeList.push({
      data: item,
      zoneX: zone.position.x + zone.width/2,
      zoneY: zone.position.y - this.y(50),
      phase: 0,
    })
  }

  update() {
    if (this.active) {
      this.checkRemoved()
      this.checkBag()
      this.checkComplition()
      this.checkItem()
      this.checkArrow()
    }
  }

  checkArrow() {
    if (this.arrow.alpha > 0) {
      this.arrow.position.y += 1*Math.sin(this.arrowCount*0.05)
      this.arrowCount++
      if (this.arrowCount >= 300) {
        this.arrow.alpha -= 0.02
      }
    }
    else {
      this.arrowCount = 1
    }
  }

  checkItem() {
    for (let i = 0; i < this.list.length; i++) {
      const item = this.list[i]
      if (!item.active) continue
      if (item.model.droped) {
        if (item.model.position.x < 0 || item.model.position.x > this.app.screen.width) {
          item.model.position.x = this.app.screen.width/2
        }
        if (item.model.position.y < this.bottom) {
          const n = Math.abs(item.model.position.y + (item.model.position.y*item.model.dropCount*0.005))
          item.model.position.y = n > this.bottom ? this.bottom : n
          if (item.model.dropCount < 15) item.model.dropCount++
        }
        else {
          item.model.droped = false
          item.model.dropCount = 1
        }
      }
    }
  }

  checkRemoved() {
    if (this.removeList.length) {
      for (let i = 0; i < this.removeList.length; i++) {
        const item = this.removeList[i]
        if (item.phase === 0) {
          if (Math.floor(item.data.model.position.y) > Math.floor(item.zoneY)) {
            item.data.model.position.y += (item.zoneY - item.data.model.position.y)*0.1
            item.data.model.position.x += (item.zoneX - item.data.model.position.x)*0.1
          }
          else item.phase = 1
        }
        else if (item.phase === 1) {
          if (item.data.model.position.y < item.zoneY + this.y(50)) {
            item.data.model.position.y += Math.max(15, item.zoneY - item.data.model.position.y)*0.1
          }
          else {
            this.removeList.splice(i, 1)
            this.elementsContainer.removeChild(item.data.model)
            this.removedCount++
          }
        }
        if (item.data.model.scale.x > 0) {
          item.data.model.scale.x -= item.data.model.scale.x*0.01
          item.data.model.scale.y -= item.data.model.scale.y*0.01
        }
      }
    }
  }

  checkBag() {
    const step = Math.floor(4/100*(this.removedCount*100/this.list.length))
    if (this.bagStep !== step) {
      this.bag.gotoAndStop(step)
      this.updateDropZone()
      this.bagStep = step
    }
  }

  checkComplition() {
    if (this.removedCount >= this.list.length) {
      if (this.smile.alpha < 1) {
        this.smile.alpha += 0.01
      }
      else {
        this.active = false
      }
    }
  }
}
