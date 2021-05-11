const Datastore = require('nedb')
const db = {}
db.biographie = new Datastore({ filename: 'data/biographie', autoload: true })

db.biographie.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const biographieData = require('../backup/biographie.json')

const {paragraphs,title,subtitle} = biographieData

insertInDB({title, subtitle})

let index = 0
paragraphs.forEach(data => {
    insertInDB({
        paragraph: data,
        index
    })
    ++index
})

function insertInDB(data) {
    db.biographie.insert(data, function (err, newDoc) {
        if (err)
            console.error(err)
        console.log(newDoc)
    })
}
