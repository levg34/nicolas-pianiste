let concerts = Object.values($('#tour p b').map((i,p) => $(p).text())).map(e => ({name: e}))

Object.values($('#tour ul:not(.list-group)').map((i,p) => $(p).find('li').map((i,e) => $(e).text()))).map(e => ({
    details: {
        pieces: Object.values(e).filter(e => !(e instanceof Object || typeof e === 'number')).map(e => ({
            composer: e.split(' – ')[0],
            title: e.split(' – ')[1]
        }))
    }
})).forEach((e,i) => {
    concerts[i].details = e.details
})

Object.values($('#tour ul.list-group').map((i,p) => $(p).find('li').map((i,e) => $(e).text()))).map(e => ({
    occs: Object.values(e).filter(e => !(e instanceof Object || typeof e === 'number')).map(e => e.split('\n')[1] ? e.split('\n')[1].trim() : e.split('\n')[0]).map(e => ({
        date: e.split(':')[0].trim(),
        place: e.split(':')[1].trim()
    }))
})).forEach((e,i) => {
    concerts[i].occs = e.occs
})

Object.values($('#tour p b').siblings().map((i,e) => $(e).text())).filter(e => e).filter(e => typeof e === 'string').map(e => ({
    name: e.split(',')[0],
    instrument: e.split(',')[1]
}))

`Natacha Hummel , mezzo-soprano
Anaëlle Gregorutti, soprano
Nicolas Dross et Isabelle Aboulker , piano`.split('\n').map(e => ({
    name: e.split(',')[0].trim(),
    instrument: e.split(',')[1].trim()
}))

concerts.forEach(c => c.occs.forEach(o => {
    if (o.date.includes('à')) {
        o.time = o.date.split('à')[1].trim().replace('h',':00')
        o.date = o.date.split('à')[0].trim()
    } else {
        o.time = '00:00'
    }
    o.date = o.date.split('/').reverse().join('-')
}))

console.log(concerts)

