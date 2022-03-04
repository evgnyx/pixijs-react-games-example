/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assets } from '../common/assets'
import { AppRecycle } from './app'

export class RecycleAssets extends Assets {
  constructor(app: AppRecycle) {
    super(app)
  }

  init() {
    this
      .add('background', '/games/recycle/assets/background.jpg')
      .add('ui', '/games/recycle/assets/ui.json')
      .add('sprites', '/games/recycle/assets/spritesheet.json')
      .load()
  }
}
