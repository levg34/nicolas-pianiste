const Datastore = require('nedb')
const db = {}
db.concerts = new Datastore({ filename: 'data/concerts', autoload: true })

// db.concerts.remove({}, { multi: true }, function (err, numRemoved) {
//     if (err) console.error(err)
//     console.log({numRemoved})
// })

const concertsData = require('../backup/concerts.json')
;
// Object.values(concertsData).forEach(data => {
[concertsData['extractedConcert']].forEach(data => {
    const concert = {...data}
    delete concert.occs
    delete concert.id
    db.concerts.insert(concert, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
        data.occs.forEach(occ => {
            occ.concertId = newDoc._id
            db.concerts.insert(occ, function(err, newDoc) {
                if (err) console.error(err)
                console.log(newDoc)
            })
        })
    })
})
