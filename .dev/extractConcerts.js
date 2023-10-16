$('span[ng-repeat^=concert]').each((index, element) => {
    console.log(element)
})

$('#tour p').text()

$('#tour p b').each((i,e) => console.log(e))

$('#tour p b').map((i,e) => $(e).text())

$('#tour ul.list-group').each((i,e) => console.log(e))
$('#tour ul:not(.list-group)').each((i,e) => console.log(e))

$('#tour span[style]').each((i,e) => console.log(e))
