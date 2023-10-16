const Datastore = require('nedb')
const db = {}
db.repertory = new Datastore({ filename: 'data/repertory', autoload: true })

db.repertory.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const repertoryData = require('../backup/repertory.json')

let index = 1
repertoryData.forEach(data => {
    const title = data.title

    data.items.forEach(item => {
        const subtitle = item.title
        item.list.forEach(e => {
            const repertoryElement = {
                title,
                content: e,
                index: index++
            }
            if (subtitle) {
                repertoryElement.subtitle = subtitle
            }
            db.repertory.insert(repertoryElement, function (err, newDoc) {
                if (err) console.error(err)
                console.log(newDoc)
            })
        })
    })
})
