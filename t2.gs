function myFunction() {
   const { Yiq } = bmYiq.Exports
  for (let x =0 ; x < 0xffffff ; x += 1024) {
    console.log(Yiq.getContrast ({color:Yiq.numToColor(x)}))
  }
}
