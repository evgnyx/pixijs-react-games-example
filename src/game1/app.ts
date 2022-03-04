import { Application } from '../common/app'
import { Models } from '../common/models'
import { UI } from '../common/ui'
import { DnD } from '../common/dnd'
import { RecycleAssets } from './assets'
import { RecycleLevel } from './level'
import { modelsMap } from './models.map'
import { textMap } from './text.map'

export class AppRecycle extends Application {
  constructor() {
    super()
    this.add(new RecycleAssets(this))
    this.add(new Models(this, modelsMap))
    this.add(new UI(this, textMap))
    this.add(new RecycleLevel(this))
    this.add(new DnD(this))
  }

  restart() {
    this.level.restart()
  }
}
