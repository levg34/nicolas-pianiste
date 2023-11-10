const fakeData = [
    {
        name: 'Duo d\'oro',
        url: 'duo-doro',
        data: []
    },
    {
        name: 'Trio éphémère',
        url: 'trio-eph',
        data: []
    },
    {
        name: 'La flûte en chantée',
        url: 'flute-en-chant',
        data: []
    }
]

const Datastore = require('nedb')
const db = {}
db.pages = new Datastore({ filename: 'data/pages', autoload: true })

fakeData.forEach(data => {
    db.pages.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
