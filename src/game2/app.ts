import { Application } from '../common/app'
import { Models } from '../common/models'
import { UI } from '../common/ui'
import { DnD } from '../common/dnd'
import { ReduceAssets } from './assets'
import { ReduceLevel } from './level'
import { spritesMap } from './models.map'
import { textMap } from './text.map'

export class AppReduce extends Application {
  constructor() {
    super()
    this.add(new ReduceAssets(this))
    this.add(new Models(this, spritesMap))
    this.add(new UI(this, textMap as any))
    this.add(new ReduceLevel(this))
    this.add(new DnD(this))
  }

  restart() {
    this.level.restart()
  }
}
