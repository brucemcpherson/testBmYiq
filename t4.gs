
const t4 = () => {

  const ss = SpreadsheetApp.openById('1UYuFztwETn7nGctf7vvlsV9lNa5p_hLoKrC5wdDWasg')
  const sheet = ss.getSheetByName('ingredients')
  const { getColors } = bmChroma.Exports.ColorWords
  const fiddler = new bmFiddler.Fiddler(sheet)

  // start with clean back and font colors
  const backgrounds = []
  const fontColors = []

  const newData = fiddler.getData().map((f, i) => {
    const list = getColors(f.color || 'white')
    backgrounds[i] = Array.from({ length: fiddler.getNumColumns() }).fill(list.mix.saturated.hex)
    fontColors[i] = Array.from({ length: fiddler.getNumColumns() }).fill(list.mix.saturated.contrast)
    return {
      ...f,
      saturated: list.mix.saturated.hex
    }
  })
  fiddler
    .setData(newData)
    .sortFiddler('saturated')
    .dumpValues()
  const dr = fiddler.getRange().offset(1, 0, fiddler.getNumRows(), fiddler.getNumColumns())
  dr.setBackgrounds(backgrounds)
  dr.setFontColors(fontColors)
}

const t5 = () => {

  const ss = SpreadsheetApp.openById('1UYuFztwETn7nGctf7vvlsV9lNa5p_hLoKrC5wdDWasg')
  const sheet = ss.getSheetByName('recipes')
  const { getColors, mixer } = bmChroma.Exports.ColorWords
  const fiddler = new bmFiddler.Fiddler(sheet)

  const ingredientSheet = ss.getSheetByName('ingredients')
  const ingredientsFiddler = new bmFiddler.Fiddler(ingredientSheet)
  const ingredientsData = ingredientsFiddler.getData()

  // start with clean back and font colors
  const light = '#ffffff'
  const dark = '#000000'
  const backgrounds = []
  const fontColors = []

  // get the recipes
  const recipes = fiddler.getData().map((recipe, i) => {
    // get the ingredients for each recipe
    const ing = recipe.ingredients
      .split(",")
      .map(g => {
        // see if any of these ingredients are known
        return {
          value: parseInt((g.match(/\d+/) || [1])[0], 10),
          ingredient: ingredientsData.find(h => {
            const rx = new RegExp(`\\b${h.name}(s|y|ies|es)*\\b`, 'i')
            return rx.test(g)
          })
        }
      })
      .filter(h => h.ingredient)
    return {
      // attach the ingredient snalysis     return {
      recipe,
      ing
    }
  })
  const iCols = Array.from(new Set(fiddler.getHeaders().filter(f => f.match(/i\d+/i))))
  const newData = fiddler.getData().map((row, i) => {
    // start with clean back and font colors
    backgrounds[i] = Array.from({ length: fiddler.getNumColumns() }).fill(light)
    fontColors[i] = Array.from({ length: fiddler.getNumColumns() }).fill(dark)
    const recipe = recipes[i]
    const { ing } = recipe
    const mixed = iCols.map((f, j) => {
      const { value, ingredient } = ing[j] || {}
      if (ingredient) {
        // find where it show up to post the the back & font
        const hindex = fiddler.getHeaders().indexOf(f)
        row[f] = ingredient.name
        const list = getColors(ingredient.color)
        // the background is the saturated version of all the colors of the ingredient
        backgrounds[i][hindex] = list.mix.saturated.hex
        fontColors[i][hindex] = list.mix.saturated.contrast
        
        // we'll use this later to generate an overall mix
        return {
          list,
          value,
          weight: ingredient.weight 
        }
      } else {
        row[f] = ''
        return null
      }
    }).filter(f => f)


    // conbine all the saturated colors
    const colors = mixed.map(f=>f.list.mix.saturated.base)
    const mix =  mixer ({ colors })

    const mindex = fiddler.getHeaders().indexOf('mix')
    // do a basic mix
    if (mindex) {
      row.mix = mix.hex,
      backgrounds[i][mindex] = row.mix
      fontColors[i][mindex] = mix.contrast
    } else {
      row.mix = 'error finding mix column'
    }

    // attempt a mix based on weight
    const windex = fiddler.getHeaders().indexOf('mix-saturated')
    const overallMix = mixer ({
      colors, 
      weights: mixed.map(f=>f.weight * f.value)
    })
    backgrounds[i][windex] = overallMix.hex
    fontColors[i][windex] = overallMix.contrast
    row['mix-saturated'] =  overallMix.hex

    const nindex = fiddler.getHeaders().indexOf('name')
    backgrounds[i][nindex] = backgrounds[i][windex]
    fontColors[i][nindex] = fontColors[i][windex]
    return row
  })

  fiddler
    .setData(newData)
    .sortFiddler('mix-saturated')
    .dumpValues()

  const dr = fiddler.getRange().offset(1, 0, fiddler.getNumRows(), fiddler.getNumColumns())
  dr.setBackgrounds(backgrounds)
  dr.setFontColors(fontColors)

}
