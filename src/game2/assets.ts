/* eslint-disable @typescript-eslint/no-explicit-any */
import { Assets } from '../common/assets'
import { AppReduce } from './app'

export class ReduceAssets extends Assets {
  constructor(app: AppReduce) {
    super(app)
  }

  init() {
    this
      .add('background', '/games/reduce/assets/background.jpg')
      .add('sprites', '/games/reduce/assets/spritesheet.json')
      .add('static', '/games/reduce/assets/static.json')
      .add('bag', '/games/reduce/assets/bag.json')
      .load()
  }
}
