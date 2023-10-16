const videos = []
$("#videos .col-sm-4").each(function() {
    const url = $(this).find('a').attr('href')
    const title = $(this).find('strong').text()
    const subtitle = $(this).find('b').text()
    const img = $(this).find('img').attr('src')
    const alt = $(this).find('img').attr('alt')
    const description = $(this).find('p')[1].innerText
    const list = []

    $(this).find('li').each(function() {
        list.push($(this).text())
    })

    const video = {
        url,
        title,
        subtitle,
        img,
        alt,
        description,
        list
    }

    videos.push(video)
})
console.log(videos)