const Datastore = require('nedb')

const db = {}
db.messages = new Datastore({ filename: 'data/messages', autoload: true })

const axios = require('axios')

db.messages.find({ ipInfos: { $exists: false } }, function (err, docs) {
    if (err) console.error(err)
    docs.forEach(message => {
        axios.get(`http://ip-api.com/json/${message.ip}`).then(response => {
            if (response.data) {
                const ipInfos = response.data
                if (ipInfos && ipInfos.status !== 'fail') {
                    db.messages.update({ _id: message._id }, { $set: { ipInfos } }, {}, function () {
                        if (err) console.error(err)
                        console.log(ipInfos)
                    })
                }
            }
        }).catch(err => {
            console.error(err)
        })
    })
})
