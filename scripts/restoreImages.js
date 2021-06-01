const Datastore = require('nedb')
const db = {}
db.images = new Datastore({ filename: 'data/images', autoload: true })

const path = require('path')
const fs = require('fs')

const sizeOf = require('image-size')

const DB_CORRUPTED = false

if (DB_CORRUPTED) {
    db.images.remove({}, { multi: true }, function (err, numRemoved) {
        if (err) console.error(err)
        console.log({numRemoved})
    })
}

const fulldata = {
    fieldname: 'image',
    originalname: 'faire-part.PNG',
    encoding: '7bit',
    mimetype: 'image/png',
    destination: 'uploads/',
    filename: '56f3a5ecbb19bbbf9821eee717629a76',
    path: 'uploads\\56f3a5ecbb19bbbf9821eee717629a76',
    size: 128313,
    username: 'admin@admin.fr',
    width: 1070,
    height: 817,
    ratio: 1.3096695226438189,
    _id: 'C5HRiWChe5pRZyDf'
}

let directoryPath = path.join(__dirname, '../public/img/banner')

fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    
    files.forEach(function (file) {
        sizeOf('./public/img/banner/'+file, function (err, dimensions) {
            if (err) return console.error(err)

            const uploadData = {
                originalname: file,
                mimetype: 'image/jpeg',
                destination: 'img/banner/',
                filename: file,
                path: 'public/img/banner/'+file,
                username: 'script'
            }

            
            const {width, height} = dimensions
            const ratio = width / height
            
            if (Math.abs(9/2-ratio)<0.01) {
                uploadData.banner = true
            }
            
            console.log({...uploadData, width, height, ratio})
            db.images.insert({...uploadData, width, height, ratio}, function (err, newDoc) {
                if (err) return console.error(err)
                console.log(newDoc)
            })
        })
    })
})

directoryPath = path.join(__dirname, '../public/img/concerts')

fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    
    files.forEach(function (file) {
        sizeOf('./public/img/concerts/'+file, function (err, dimensions) {
            if (err) return console.error(err)

            const uploadData = {
                originalname: file,
                mimetype: 'image/jpeg',
                destination: 'img/concerts/',
                filename: file,
                path: 'public/img/concerts/'+file,
                username: 'script'
            }

            
            const {width, height} = dimensions
            const ratio = width / height
            
            if (Math.abs(4/3-ratio)<0.01) {
                uploadData.concerts = true
            }
            
            console.log({...uploadData, width, height, ratio})
            db.images.insert({...uploadData, width, height, ratio}, function (err, newDoc) {
                if (err) return console.error(err)
                console.log(newDoc)
            })
        })
    })
})

directoryPath = path.join(__dirname, '../public/img/banner/old')

fs.readdir(directoryPath, function (err, files) {

    if (err) {
        return console.log('Unable to scan directory: ' + err)
    } 
    
    files.forEach(function (file) {
        sizeOf('./public/img/banner/old/'+file, function (err, dimensions) {
            if (err) return console.error(err)

            const uploadData = {
                originalname: file,
                mimetype: 'image/jpeg',
                destination: 'img/banner/old/',
                filename: file,
                path: 'public/img/banner/old/'+file,
                username: 'script'
            }

            
            const {width, height} = dimensions
            const ratio = width / height
            
            if (Math.abs(4/3-ratio)<0.01) {
                uploadData.concerts = true
            }

            if (Math.abs(9/2-ratio)<0.01) {
                uploadData.banner = true
            }
            
            console.log({...uploadData, width, height, ratio})
            db.images.insert({...uploadData, width, height, ratio}, function (err, newDoc) {
                if (err) return console.error(err)
                console.log(newDoc)
            })
        })
    })
})

if (DB_CORRUPTED) {
    directoryPath = path.join(__dirname, '../uploads')
    
    fs.readdir(directoryPath, function (err, files) {
    
        if (err) {
            return console.log('Unable to scan directory: ' + err)
        } 
        
        files.forEach(function (file) {
            if (file === '.gitkeep') return
            sizeOf('./uploads/'+file, function (err, dimensions) {
                if (err) return console.error(err)
    
                const uploadData = {
                    destination: 'uploads/',
                    filename: file,
                    path: 'uploads/'+file,
                    username: 'script'
                }
    
                
                const {width, height} = dimensions
                const ratio = width / height
                
                if (Math.abs(4/3-ratio)<0.01) {
                    uploadData.concerts = true
                }
    
                if (Math.abs(9/2-ratio)<0.01) {
                    uploadData.banner = true
                }
                
                console.log({...uploadData, width, height, ratio})
                db.images.insert({...uploadData, width, height, ratio}, function (err, newDoc) {
                    if (err) return console.error(err)
                    console.log(newDoc)
                })
            })
        })
    })
}
