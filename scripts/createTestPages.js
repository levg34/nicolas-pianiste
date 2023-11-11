const fakeData = [
    {
        name: 'Duo d\'oro',
        url: 'duo-doro',
        pageData: {
            "headerImageUrl": "https://nicolasdross.fr/uploads/15d0b22a39ff686e73991ef52d5c9d76",
            // "pageName": "Duo d'Oro",
            "data": [
              { "text": ["paragraphe 1", "paragraphe 2"] },
              { "image": "https://placekitten.com/g/300/300" },
              { "video": { "url": "...", "thumbUrl": "..." } },
              {
                "text": [
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Hoc loco tenere se Triarius non potuit. Atque haec ita iustitiae propria sunt, ut sint virtutum reliquarum communia. An eiusdem modi?",
                  "Hoc est vim afferre, Torquate, sensibus, extorquere ex animis cognitiones verborum, quibus inbuti sumus. His enim rebus detractis negat se reperire in asotorum vita quod reprehendat. Etenim nec iustitia nec amicitia esse omnino poterunt, nisi ipsae per se expetuntur. Itaque vides, quo modo loquantur, nova verba fingunt, deserunt usitata. Nullus est igitur cuiusquam dies natalis. Duarum enim vitarum nobis erunt instituta capienda. Vide, quantum, inquam, fallare, Torquate. Etenim nec iustitia nec amicitia esse omnino poterunt, nisi ipsae per se expetuntur. Et certamen honestum et disputatio splendida! omnis est enim de virtutis dignitate contentio."
                ]
              }
            ]
          }
    },
    {
        name: 'Trio éphémère',
        url: 'trio-eph',
        pageData: {}
    },
    {
        name: 'La flûte en chantée',
        url: 'flute-en-chant',
        pageData: {}
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