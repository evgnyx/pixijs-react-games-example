/* eslint-disable @typescript-eslint/no-explicit-any */
import * as PIXI from 'pixi.js'
import { Level } from '../common/level'
import { AppRecycle } from './app'
import descriptions from './descriptions.json'

interface ListItem {
  key: string
  model: PIXI.Sprite & { droped: boolean, dropCount: number }
  active: boolean
  parentId: number
}

interface RemoveListItem {
  data: ListItem
  zoneX: number
  zoneY: number
  phase: number
}

export class RecycleLevel extends Level {
  top: number
  left: number
  right: number
  bottom: number

  list: ListItem[] = []
  currentItem: ListItem | null = null
  zones: { [key: number]: PIXI.Container } = {}

  removeList: RemoveListItem[] = []

  constructor(app: AppRecycle) {
    super(app)
    this.app = app
    this.app.level = this
  }

  load() {
    this.configure()

    this.top = 0
    this.left = 0
    this.right = this.width
    this.bottom = this.y(900)

    this.app.ui.hide()

    this.app.dnd.addZone(this.createDropZone(1, 240, 200, 220, 580), this.onDropToZone.bind(this))
    this.app.dnd.addZone(this.createDropZone(2, 650, 250, 645, 500), this.onDropToZone.bind(this))
    this.app.dnd.addZone(this.createDropZone(3, 240, 200, 1520, 580), this.onDropToZone.bind(this))
    
    this.initItems()
    this.renderRandom()

    this.app.start()
  }

  restart() {
    if (this.currentItem) {
      this.app.stage.removeChild(this.currentItem.model)
      this.currentItem = null
    }
    this.app.ui.hide()
    this.initItems()
    this.renderRandom()
  }

  initItems() {
    this.list = []

    for (const key in this.app.models.sprites.sprites) {
      if (!(key in this.app.models.map)) continue
      const model = this.app.models.get(key) as any
      const map = this.app.models.map[key]
      this.list.push({
        key,
        model,
        active: true,
        parentId: map.parentId as number,
      })
    }
  }

  renderRandom() {
    const arr = this.list.filter((item) => item.active)
    const item = arr[random(0, arr.length - 1)]
    if (!item) return
    this.currentItem = item
    item.model.scale.x += 0.2
    item.model.scale.y += 0.2
    item.model.dropCount = 1
    this.app.dnd.add(item.model)
    this.app.stage.addChild(item.model)
    item.model.on('pointerdown', () => this.showText(item))
  }

  showText(item: ListItem) {
    this.app.ui.hide('result')
    this.app.ui.setText('caption', 'caption', descriptions[item.key as keyof typeof descriptions].caption)
    this.app.ui.task({
      type: 'show',
      element: 'caption',
    })
  }

  onDropToZone(el: PIXI.Sprite, zone: PIXI.Container) {
    this.app.ui.hide('caption')
    if (this.zones[this.currentItem!.parentId] === zone) {
      this.app.ui.hideText('fail')
      this.app.ui.showText('success')
      this.app.ui.show('result')
    }
    else {
      this.app.ui.hideText('success')
      this.app.ui.showText('fail')
    }
    this.app.ui.setText('result', 'description', descriptions[this.currentItem!.key as keyof typeof descriptions].text)
    this.app.ui.task({
      type: 'show',
      element: 'result'
    })
    this.app.dnd.remove(el)
    this.removeItem(this.currentItem!, zone)
    this.renderRandom()
  }

  createDropZone(id: number, width: number, height: number, x: number, y: number) {
    const dropZone = new PIXI.Graphics()
    const dropZoneWidth = width*this.scaleX
    const dropZoneHeight = height*this.scaleY
    // dropZone.beginFill(0xDE3249)
    dropZone.drawRoundedRect(0, 0, dropZoneWidth, dropZoneHeight, 5)
    // dropZone.endFill()
    // dropZone.alpha = 0.5
    dropZone.position.x = x*this.scaleX
    dropZone.position.y = y*this.scaleY
    this.app.stage.addChild(dropZone)
    this.zones[id] = dropZone
    return dropZone
  }

  update() {
    this.checkRemoved()
    this.checkItem()
    this.app.ui.update()
  }

  checkItem() {
    if (!this.currentItem?.active) return
    const item = this.currentItem
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
          if (item.data.model.position.y < item.zoneY + this.y(100)) {
            item.data.model.position.y += Math.max(15, item.zoneY - item.data.model.position.y)*0.1
          }
          else {
            this.removeList.splice(i, 1)
            this.app.stage.removeChild(item.data.model)
          }
        }
        if (item.data.model.scale.x > 0) {
          item.data.model.scale.x -= item.data.model.scale.x*0.01
          item.data.model.scale.y -= item.data.model.scale.y*0.01
        }
      }
    }
  }

  removeItem(item: ListItem, zone: PIXI.Container) {
    item.active = false
    this.removeList.push({
      data: item,
      zoneX: zone.position.x + zone.width/2,
      zoneY: zone.position.y - this.y(100),
      phase: 0,
    })
  }
}

function random(min: number, max: number) {
  return Math.floor(Math.random()*(max - min + 1)) + min
}
