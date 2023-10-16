$("#links a").each(function() {console.log('{name:\''+$(this).text()+'\',url:\''+$(this).attr('href')+'\'}')})

$("#myCarousel div.item").each(function() {console.log('{title:\''+$(this).find('h3').text()+'\',url:\''+$(this).find('img').attr('src')+'\',description:\''+$(this).find('p').text()+'\'}')})

var table = ''
$("#studies p").each(function() {
	table += "'"+$(this).text()+"',\n"
})
console.log(table)
