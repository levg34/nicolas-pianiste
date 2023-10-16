const Datastore = require('nedb')
const db = {}
db.users = new Datastore({ filename: 'data/users', autoload: true })

let userData = require('../data/user.json')

if (!(userData instanceof Array)) {
    userData = [userData]
}

userData.forEach(data => {
    db.users.insert(data, function (err, newDoc) {
        if (err) console.error(err)
        console.log(newDoc)
    })
})
