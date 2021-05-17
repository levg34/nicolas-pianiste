const repertory = []
$("#repertory div").each(function() {
    const repertoryItem = {
        title: $(this).find('h4').text(),
        items: []
    }
    $(this).find('sub').each(function() {
        const sub = {
            title: $(this).find('b').text(),
            list: []
        }
        if (!sub.title) {
            delete sub.title
        }
        $(this).find('li').each(function() {
            sub.list.push($(this).text())
        })
        repertoryItem.items.push(sub)
    })
    repertory.push(repertoryItem)
})
console.log(repertory)