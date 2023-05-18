// test bmmaterial colors from string
const t3 = () => {

  const ss = SpreadsheetApp.openById('1UYuFztwETn7nGctf7vvlsV9lNa5p_hLoKrC5wdDWasg')
  const sheet = ss.getSheetByName('chroma')
  const { getColors, getContrast, getColorPack } = bmChroma.Exports.ColorWords
  const fiddler = new bmFiddler.Fiddler(sheet)
  const light = '#ffffff'
  const dark = '#000000'

  // start with a clean sheet
  fiddler.getSheet().clearFormats()

  const getEmpty = (fiddler, fill) => Array.from({ length: fiddler.getNumRows() })
    .map((_, rn) => Array.from({ length: fiddler.getNumColumns() }).fill(fill))


  // start with clean back and font colors
  const backgrounds = getEmpty(fiddler, light)
  const fontColors = getEmpty(fiddler, dark)

  // find all the coloumns we'll patch
  const colorHeads = fiddler.getHeaders()
    .filter(f => f.match(/^color|^light|^dark|^name|^saturated|^mentions/))

  // now patch in the color values
  fiddler.mapRows((row, { rowOffset }) => {
    // get colors mentioned in this piece of text
    const list = getColors(row.text)

    // find which column to put them on
    colorHeads.forEach(f => {

      // for example color1 -> 1
      const index = parseInt(f.match(/\d+/), 10)
      const head = f.match(/^[^\d]+/)

      // if theres a mention post the hex code
      const mentions = list && list.mentions[index]
      if (mentions) {

        // find where it show up to post the the back & font
        const hindex = fiddler.getHeaders().indexOf(f)
        // default background
        backgrounds[rowOffset][hindex] = mentions.color.hex
        switch (head[0]) {
          case "color":
            row[f] = mentions.color.hex
            break
          case "saturated":
            row[f] = mentions.saturated.hex
            backgrounds[rowOffset][hindex] = row[f]
            break
          case "light":
            row[f] = mentions.color.base.brighten().hex()
            backgrounds[rowOffset][hindex] = row[f]
            break
          case "dark":
            row[f] = mentions.color.base.darken().hex()
            backgrounds[rowOffset][hindex] = row[f]
            break
          case "name":
            row[f] = mentions.color.name
            break
          case "mentions":
            row[f] = mentions.noticed.length
            break;
          default:
            throw `oops- ${head} ${f} ${index}`
        }

      } else {
        row[f] = ''
      }


    })


    // now the mixof all the colors
    row.mix = list.mix.color.hex
    row['mix-saturated'] = list.mix.saturated.hex
    backgrounds[rowOffset][fiddler.getHeaders().indexOf('text')] = row['mix-saturated']
    backgrounds[rowOffset][fiddler.getHeaders().indexOf('mix')] = row.mix
    backgrounds[rowOffset][fiddler.getHeaders().indexOf('mix-saturated')] = row['mix-saturated']
    fontColors[rowOffset] = backgrounds[rowOffset].map (f=> getContrast(f, { dark, light }))

    

    return row
  })

  // make the backgrounds
  const dr = fiddler.getRange().offset(1, 0, fiddler.getNumRows(), fiddler.getNumColumns())
  const headBack = getColorPack (getColorPack ("orange").base.brighten())

  fiddler
    .sortFiddler ('mix-saturated')
    .setHeaderFormat({
      wraps: true,
      backgrounds: headBack.hex,
      fontColors: headBack.contrast
    })
    .dumpValues()

  dr.setBackgrounds(backgrounds)
  dr.setFontColors(fontColors)


}