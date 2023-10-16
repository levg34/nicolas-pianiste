const Datastore = require('nedb')
const db = {}
db.carousel = new Datastore({ filename: 'data/carousel', autoload: true })

db.carousel.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const carouselData = require('../backup/carousel.json')

carouselData.forEach(data => {
    db.carousel.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
