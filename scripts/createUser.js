const Datastore = require('nedb')
const db = {}
db.users = new Datastore({ filename: 'data/users', autoload: true })

const userData = {
    username: 'admin',
    admin: 'true'
}

db.users.insert(userData, function (err, newDoc) {
    if (err) console.error(err)
    console.log(newDoc)
})
