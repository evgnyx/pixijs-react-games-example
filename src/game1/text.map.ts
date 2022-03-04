const fontFamily = 'CyrillicCooper, serif'

export const textMap = {
  title: {
    text: 'Sort game',
    style: {
      fontFamily,
      fontSize: 68,
      lineHeight: 80,
      wordWrap: true,
      wordWrapWidth: 1470,
    },
    x: 'center',
    y: 100,
  },
  success: {
    text: 'Correct!',
    style: {
      fontFamily,
      fill: 0x6BAA3C,
      fontSize: 80,
      lineHeight: 80,
    },
    x: 'center',
    y: 150,
    anchorY: 1,
    ui: 'result',
  },
  fail: {
    text: 'Wrong!',
    style: {
      fontFamily,
      fill: 0x6D6D6D,
      fontSize: 70,
      lineHeight: 70,
    },
    x: 'center',
    y: 150,
    anchorY: 1,
    ui: 'result'
  },
  caption: {
    text: '',
    style: {
      fontFamily,
      fontSize: 48,
      lineHeight: 48,
      wordWrap: true,
      wordWrapWidth: 1100,
      breakWords: true,
    },
    ui: 'caption',
    x: 'center',
    y: 'center',
  },
  description: {
    text: '',
    style: {
      fontFamily: 'Arial',
      fontSize: 32,
      lineHeight: 34,
      wordWrap: true,
      wordWrapWidth: 1100,
      breakWords: true,
    },
    ui: 'result',
    x: 'center',
    y: 150,
  }
}
