const t7 = () => {
  const { getColors, getContrast, getColorPack } = Exports.ColorWords
  const result = getColors("The green, green grass of home")
  console.log(JSON.stringify(result))

}
