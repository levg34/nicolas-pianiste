const Datastore = require('nedb')
const db = {}
db.videos = new Datastore({ filename: 'data/videos', autoload: true })

db.videos.count({},(err,count) => {
    console.log(count)
    db.videos.find({}).sort({index: 1}).exec(function (err, docs) {
        if (err) console.error(err)
        docs.forEach(video => {
            console.log(video.index+' ->',(count+1) - video.index)
            db.videos.update({_id: video._id},{$set:{index: (count+1) - video.index}},{},(err, updated) => {
                if (err) console.error(err)
                console.log('updated: '+updated)
            })
        })
    })
})