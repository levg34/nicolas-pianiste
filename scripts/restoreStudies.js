const Datastore = require('nedb')
const db = {}
db.studies = new Datastore({ filename: 'data/studies', autoload: true })

db.studies.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const studiesData = require('../backup/studies.json')

const {title,awardsTitle,paragraphs,awards} = studiesData

insertInDB({title, awardsTitle})

let index = 0
paragraphs.forEach(data => {
    insertInDB({
        paragraph: data,
        index
    })
    ++index
})

index = 0
awards.forEach(data => {
    insertInDB({
        award: data,
        index
    })
    ++index
})

function insertInDB(data) {
    db.studies.insert(data, function (err, newDoc) {
        if (err)
            console.error(err)
        console.log(newDoc)
    })
}
