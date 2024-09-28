const Datastore = require('@seald-io/nedb')
const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = 'mongodb+srv://xxxyyyy'
const fs = require('fs')
const path = require('path')

const dbName = 'nicodata'

async function migrateNeDBToMongoDB() {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    })

    try {
        await client.connect()
        console.log('Connected to MongoDB')

        const db = client.db(dbName)
        const dataDir = path.join(__dirname, 'data')
        console.log('dataDir', dataDir)
        const files = fs.readdirSync(dataDir)
        console.log('files', files)

        for (const file of files) {
            if (path.extname(file) !== '.gitkeep') {
                const collectionName = path.basename(file, '.db')
                console.log(`Migrating collection: ${collectionName}`)

                const nedbCollection = new Datastore({ filename: path.join(dataDir, file), autoload: true })
                const mongoCollection = db.collection(collectionName)

                const documents = await new Promise((resolve, reject) => {
                    nedbCollection.find({}, (err, docs) => {
                        if (err) reject(err)
                        else resolve(docs)
                    })
                })

                if (documents.length > 0) {
                    const result = await mongoCollection.insertMany(documents)
                    console.log(`Inserted ${result.insertedCount} documents into ${collectionName}`)
                } else {
                    console.log(`No documents found in ${collectionName}`)
                }
            }
        }

        console.log('Migration completed successfully')
    } catch (error) {
        console.error('Error during migration:', error)
    } finally {
        await client.close()
    }
}

migrateNeDBToMongoDB()
