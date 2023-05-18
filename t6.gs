// test bmmaterial colors from string
const t6 = () => {

  const { getColors, getContrast, getColorPack } = Exports.ColorWords
  const fiddler = Exports.newPreFiddler({
    id: "1UYuFztwETn7nGctf7vvlsV9lNa5p_hLoKrC5wdDWasg",
    sheetName: "songs"
  })
  const light = '#ffffff'
  const dark = '#000000'

  // start with a clean sheet
  fiddler.getSheet().clearFormats()

  // function to create a fiddler sized 2d array 
  const getEmpty = (fiddler, fill) => Array.from({ length: fiddler.getNumRows() })
    .map((_, rn) => Array.from({ length: fiddler.getNumColumns() }).fill(fill))


  // start with clean back and font colors
  const backgrounds = getEmpty(fiddler, light)
  const fontColors = getEmpty(fiddler, dark)

  // interesting columns to index the color matrices
  // these are the column names
  const positions = new Map(fiddler.getHeaders().map((f, i) => [f, i]))

  // now patch in the color values
  const data = fiddler.getData().map(row => {

    // get colors mentioned in this piece of text
    const list = getColors(row.text)

    // now the mixof all the colors
    row.mix = list.mix.color.hex
    row['mix-saturated'] = list.mix.saturated.hex
    return row
  })

  // set the range for formattings
  const dr = fiddler.getRange().offset(1, 0, fiddler.getNumRows(), fiddler.getNumColumns())
  const headBack = getColorPack(getColorPack("orange").base.brighten())

  // sort and then apply the colors
  fiddler
    .setData(data)
    .sortFiddler('mix-saturated')
    .mapRows((row, { rowOffset }) => {
      backgrounds[rowOffset][positions.get('mix-saturated')] = row['mix-saturated']
      backgrounds[rowOffset][positions.get('mix')] = row.mix
      backgrounds[rowOffset][positions.get('text')] = row['mix-saturated']

      // aply the contrasts in one shot
      fontColors[rowOffset] = backgrounds[rowOffset].map(f => getContrast(f, { dark, light }))
      return row
    })
    .setHeaderFormat({
      wraps: true,
      backgrounds: headBack.hex,
      fontColors: headBack.contrast
    })
    .dumpValues()

  // finally, apply the formats
  dr.setBackgrounds(backgrounds)
  dr.setFontColors(fontColors)


}
