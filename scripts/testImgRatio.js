const sizeOf = require('image-size')

const dimensions = sizeOf('./public/img/banner/Petit palais 2017 9x2.JPG')
console.log(dimensions)
console.log(dimensions.width/dimensions.height,9/2)

sizeOf('./public/img/banner/Petit palais 2017 9x2.JPG', function (err, dimensions) {
    console.log(dimensions.width, dimensions.height)
  })