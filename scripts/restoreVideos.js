const Datastore = require('nedb')
const db = {}
db.videos = new Datastore({ filename: 'data/videos', autoload: true })

db.videos.remove({}, { multi: true }, function (err, numRemoved) {
    if (err) console.error(err)
    console.log({numRemoved})
})

const videosData = require('../backup/videos.json')

let index=1
videosData.forEach(data => {
    data.index = index++
    db.videos.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
