/**
 * color manip = required to decide whether to use a light or dark font given a background
 * see YIQ write up here
 * https://en.wikipedia.org/wiki/YIQ
 */

const Yiq = {

  /**
   * check if something is an array
   * @param {*} item check if something is an array
   * @return {Boolean}
   */
  isArray(item) {
    return Array.isArray(item)
  },

  /**
   * check if something is a string
   * @param {*} item check if something is a string
   * @return {Boolean}
   */
  isString(item) {
    return typeof item === "string"
  },

  /**
   * turn a number into a #ffffff rgv hex color
   * @param {number} num turn a number into a #ffffff rgv hex color
   * @return {string}
   */
  numToColor(num) {
    return '#' + ('000000' + (num & 0xFFFFFF).toString(16)).slice(-6)
  },

  // default colors if you want a dark font color
  get defaultDark() {
    return '#212121'
  },
  // default colors if you want a light font color
  get defaultLight() {
    return '#ffffff'
  },

  // threshold for light vs dark for luma value 
  // appears to be the accepted value
  get threshold() {
    return 150
  },

  getYiq(color) {
    const { r, g, b } = this.getRgb(color)
    const y = (r * 0.299) + (g * 0.587) + (b * 0.114)
    const i = (r * 0.596) + (g * -0.274) + (b * -0.322)
    const q = (r * 0.211) + (g * -0.523) + (b * 0.312)
    return {
      y,
      i,
      q
    }
  },

  /**
   * get the rgb object
   * @param {string} color the color
   * @param {string} p.color color to get the contrast of
   * @param {string} [p.color=#ffffff] light font color
   * @param {string} [p.color=#212121] dark font color
   * @return {object} {r,g,b}
   */
  getRgb(color) {
    return {
      r: parseInt(color.substring(1, 3), 16),
      g: parseInt(color.substring(3, 5), 16),
      b: parseInt(color.substring(5, 7), 16)
    }
  },

  /**
   * get the contrasting font color given a background
   * @param {object} p oarams
   * @param {string} p.color color to get the contrast of
   * @param {string} [p.color=#ffffff] light font color
   * @param {string} [p.color=#212121] dark font color
   * @return {string[][]}
   */
  getContrast({ color, light = this.defaultLight, dark = this.defaultDark }) {
    if (!this.isString(color) || !color.match(/^#[0-9a-f]{6}/i)) throw 'please provide color as a hex string #rrggbb'
    const { y } = this.getYiq(color)
    return y > this.threshold ? dark : light
  },


  /**
   * get the contrasting font color given a background
   * @param {object} p oarams
   * @param {string[][]} p.backgrounds colors to get the contrast of
   * @param {string} [p.color=#ffffff] light font color
   * @param {string} [p.color=#212121] dark font color
   * @return {string[][]}
   */
  getContrasts({ backgrounds, light = this.defaultLight, dark = this.defaultDark }) {
    if (!this.isArray(backgrounds) || !backgrounds.every(f => this.isArray(f)))
      throw 'backgrounds arg to range contrast should be an array of arrays'
    // get the contrasting colors
    return backgrounds.map(row => row.map(color => this.getContrast({ color, light, dark })))
  },

  /**
  * get the contrasting font color in a given range
  * @param {object} p oarams
  * @param {Range} p.range range to get the contrast of
  * @param {string} [p.color=#ffffff] light font color
  * @param {string} [p.color=#212121] dark font color
  * @param {boolean} [p.reverse=false] swap and get background color for a given font color
  * @return {string[][]}
  */
  setRangeContrasts({ range, light = this.defaultLight, dark = this.defaultDark, reverse = false }) {

    // get backgrounds
    const base = reverse ? range.getFontColors() : range.getBackgrounds()

    // get the contrasting colors
    const contrasts = this.getContrasts({ backgrounds: base, light, dark })

    // set them
    // but first optimize
    const flat = contrasts.flat(Infinity)
    const method = reverse ? 'setBackgroundColor' : 'setFontColor'
    if (flat.length) {
      const base = flat[0]
      if (flat.every(f => f === base)) {
        range[method](base)
      } else {
        range[method + 's'](contrasts)
      }
    }
    return contrasts
  },

  /**
   * get the contrasting font color in a given range
   * @param {object} p oarams
   * @param {Range} p.range range to get the contrast of
   * @param {string} [p.color=#ffffff] light font color
   * @param {string} [p.color=#212121] dark font color
   * @return {string[][]}
   */
  setFontContrasts({ range, light = this.defaultLight, dark = this.defaultDark }) {
    return this.setRangeContrasts({ range, light, dark })
  },


  /**
   * get the contrasting background color color in a given range
   * @param {object} p oarams
   * @param {Range} p.range range to get the contrast of
   * @param {string} [p.color=#ffffff] light font color
   * @param {string} [p.color=#212121] dark font color
   * @return {string[][]}
   */
  setBackgroundContrasts({ range, light = this.defaultLight, dark = this.defaultDark }) {
    return this.setRangeContrasts({ range, light, dark, reverse: true })
  }


}





