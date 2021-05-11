const Datastore = require('nedb')
const db = {}
db.concerts = new Datastore({ filename: 'data/concerts', autoload: true })

db.concerts.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const concertsData = require('../backup/concerts.json')

Object.values(concertsData).forEach(data => {
    db.concerts.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
