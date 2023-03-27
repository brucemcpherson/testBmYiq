


const test = () => {

  const ss = SpreadsheetApp.openById('1UYuFztwETn7nGctf7vvlsV9lNa5p_hLoKrC5wdDWasg')
  const sheet = ss.getSheetByName('contrast-test')
  const sheet2 = ss.getSheetByName('range-test')
  const sheet3 = ss.getSheetByName('random-test')
  const sheet4 = ss.getSheetByName('black')
  const sheet5 = ss.getSheetByName('white')
  const sheet6 = ss.getSheetByName('alt')
  const sheet7 = ss.getSheetByName('swap')
  const sheet8 = ss.getSheetByName('fiddle')
  sheet.clear()
  sheet2.clear()
  sheet3.clear()
  sheet6.clear()
  sheet7.clear()

  const { Yiq } = bmYiq.Exports

  // generate loads of colors across the full range
  const rows = 28
  const cols = 20
  const skip = Math.floor(0xffffff / rows / cols)
  const backgrounds = Array(rows).fill(null)
    .map((_, rn) => Array(cols).fill(null).map((_, cn) => Yiq.numToColor(0xffffff - (skip * (cn * rows + rn)))))

  // set that to the first sheet all with the hext values
  const range = sheet.getDataRange().offset(0, 0, rows, cols)
  range
    .setValues(backgrounds)
    .setBackgrounds(backgrounds)
    .setFontColors(Yiq.getContrasts({ backgrounds }))

  // now write this values to a second sheet
  const range2 = sheet2.getDataRange().offset(0, 0, rows, cols)
  range2
    .setValues(backgrounds)
    .setBackgrounds(backgrounds)

  Yiq.setFontContrasts({ range: range2 })
  // now write random  values to a second sheet
  const randoms = Array(rows).fill(null)
    .map((_, rn) => Array(cols).fill(null).map((_, cn) => Yiq.numToColor(Math.floor(Math.random() * 0xffffff))))

  const range3 = sheet3.getDataRange().offset(0, 0, rows, cols)
  range3
    .setValues(randoms)
    .setBackgrounds(randoms)

  // and see if it can redo the contrasts
  Yiq.setFontContrasts({ range: range3 })

  Yiq.setFontContrasts({ range: sheet4.getDataRange() })
  Yiq.setFontContrasts({ range: sheet5.getDataRange() })

  const range6 = sheet6.getDataRange().offset(0, 0, rows, cols)
  range6
    .setValues(backgrounds)
    .setBackgrounds(backgrounds)
  const yellow = '#FFF9C4'
  const indigo = '#303F9F'
  Yiq.setRangeContrasts({ range: range6, light: yellow, dark: indigo })

  const range7 = sheet7.getDataRange().offset(0, 0, rows, cols)
  range7.setValues(backgrounds).setFontColors(backgrounds)
  Yiq.setBackgroundContrasts({ range: range7 })

  new bmFiddler.Fiddler(sheet)
    .setHeaderFormat({
      backgrounds: '#D32F2F',
      fontColors: Yiq.getContrast({ color: '#D32F2F' })
    })
    .dumpFormats()


  Yiq.setFontContrasts({ range: new bmFiddler.Fiddler(sheet2).getRange() })

  new bmFiddler.Fiddler(sheet8)
    .setHeaderFormat({
      backgrounds: '#D32F2F',
      fontColors: Yiq.getContrast({ color: '#D32F2F' })
    })
    .setColumnFormat({
      backgrounds: '#03A9F4',
      fontColors: Yiq.getContrast({ color: '#03A9F4' })
    }, ['foo', 'bar'])
    .dumpFormats()

}

