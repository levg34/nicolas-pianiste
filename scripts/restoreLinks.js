const Datastore = require('nedb')
const db = {}
db.links = new Datastore({ filename: 'data/links', autoload: true })

db.links.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const linksData = []

const linksJSON = require('../backup/links.json')
Object.keys(linksJSON).forEach(key => {
    linksJSON[key].forEach(link => {
        link.type = key
        linksData.push(link)
    })
})

linksData.forEach(data => {
    db.links.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
