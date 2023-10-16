$(document).ready(function(){
	// Initialize Tooltip
	$('[data-toggle="tooltip"]').tooltip(); 
	// Add smooth scrolling to all links in navbar + footer link
	$(".navbar a, footer a[href='#myPage']").on('click', function(event) {
		// Make sure this.hash has a value before overriding default behavior
		if (this.hash !== "") {
			// Prevent default anchor click behavior
			event.preventDefault();
			// Store hash
			var hash = this.hash;

			// Using jQuery's animate() method to add smooth page scroll
			// The optional number (900) specifies the number of milliseconds it takes to scroll to the specified area
			$('html, body').animate({
				scrollTop: $(hash).offset().top
			}, 900, function(){
				// Add hash (#) to URL when done scrolling (default click behavior)
				window.location.hash = hash;
			});
		} // End if 
	});
	var credits = ['Bernard DROSS','Bernard DROSS','Joseph Kerr','Bernard DROSS','Elisabeth Villefranche','Hugues Tennenbaum','Maison Heinrich Heine']
	var creds = 'Crédits photos :<br>'
	$('.carousel-inner img').each(function(i){
		var photoName = $(this).attr('src').split('/').pop().split('9x2').shift()
		creds += photoName + ' : ' + (credits[i]?credits[i]:'?') +'<br>'
	})
	$('#photocreds').html(creds)
	$('#sendSuccess').hide()
})

function submitEmail() {
	$('#sendSuccess').hide()
	var name = $('#name').val()
	var email = $('#email').val()
	var message = $('#message').val()
	if (!name||!email||!message) {
		alert('Veuillez remplir tous les champs du formulaire.')
		return;
	}
	var button = $('#sendbtn')
	button.attr('disabled','true')
	button.html('<i class="glyphicon glyphicon-refresh gly-spin"></i> Envoi en cours...')
	var data = {name:name,message:message,email:email}
	$.post('https://script.google.com/macros/s/AKfycbxFiS1UV3D5TDnD2iu2AlnSa4_Qz9KegsjO0FVu/exec',data,function(data,status) {
		if (data.result==='success') {
			$('#name').val('')
			$('#message').val('')
			$('#email').val('')
			$('#sendSuccess').show()
		} else {
			alert('Erreur lors de l\'envoi.')
		}
		button.text('Envoyer')
		button.removeAttr('disabled')
	})
}