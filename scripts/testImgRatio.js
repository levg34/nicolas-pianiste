const sizeOf = require('image-size')
const path = require('path')
const fs = require('fs')

// const dimensions = sizeOf('./public/img/banner/Petit palais 2017 9x2.JPG')
// console.log(dimensions)
// console.log(dimensions.width/dimensions.height,9/2)

const directoryPath = path.join(__dirname, '../public/img/banner')

fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    
    files.forEach(function (file) {
        console.log('../public/img/banner/'+file) 
        sizeOf('./public/img/banner/'+file, function (err, dimensions) {
            if (err) console.error(err)
            if (!dimensions) return console.log('erreur: '+file)
            const ratio = dimensions.width/dimensions.height
            console.log(Math.abs(9/2-ratio)<0.01)
            console.log(dimensions)
        })
    })
})