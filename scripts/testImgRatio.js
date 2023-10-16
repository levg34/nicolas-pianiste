const sizeOf = require('image-size')

// const dimensions = sizeOf('./public/img/banner/Petit palais 2017 9x2.JPG')
// console.log(dimensions)
// console.log(dimensions.width/dimensions.height,9/2)



var path = require('path')
var fs = require('fs')

var directoryPath = path.join(__dirname, '../public/img/banner')

fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    
    files.forEach(function (file) {
        console.log('../public/img/banner/'+file) 
        sizeOf('./public/img/banner/'+file, function (err, dimensions) {
            if (err) console.error(err)
            if (!dimensions) return console.log('erreur: '+file)
            console.log(dimensions.width/dimensions.height,9/2)
        })
    })
})