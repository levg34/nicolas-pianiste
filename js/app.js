var app = angular.module('app', [])

app.controller('linkCtrl', function($scope) {
	$scope.personalLinks = []
	$scope.mediaLinks = []
	$scope.otherLinks = []
	$scope.loadData = function() {
		$scope.personalLinks = [
	    	{name:'YouTube',url:'https://www.youtube.com/channel/UC_Dc8B2UXdrtJvKTHudeZXQ'},
	    	{name:'SoundCloud',url:'https://soundcloud.com/nicolas-dross-587682986'}
	    ]
	    $scope.mediaLinks = [
	    	{name:'versaillesplus.com',url:'https://versaillesplus.com/tag/nicolas-dross/'},
	    	{name:'herault-tribune.com',url:'http://www.herault-tribune.com/articles/38444/agde-concert-jeunes-talents/'},
	    	{name:'lindependant.fr',url:'https://www.lindependant.fr/2013/06/01/nicolas-dross-se-produit-au-caveau-arnaud-de-villeneuve,1759956.php'}
	    ]
	    $scope.otherLinks = [
	    	{name:'jeunes-talents.org',url:'https://www.jeunes-talents.org/musiciens/1572/Nicolas-Dross'},
	    	{name:'alainmarinaro.fr',url:'http://www.alainmarinaro.fr/teams/nicolas-dross-pianiste/'},
	    	{name:'maison-heinrich-heine.org',url:'https://www.maison-heinrich-heine.org/intervenant/nicolas-dross-piano'},
	    	{name:'hotelmagnol.com',url:'https://www.hotelmagnol.com/single-post/2018/01/24/100218-Raphael-Pidoux-Les-Concerts-de-Magnol'},
	    	{name:'ciup.fr',url:'http://www.ciup.fr/non-classe/concert-classique-ravel-et-caplet-71762/'},
	    	{name:'ffjs.org',url:'http://ffjs.org/projets/-403'},
	    	{name:'theatre.carcassonne.org',url:'http://www.theatre.carcassonne.org/manifestations/ravel-schubert-le-trio-ephemere-trois-jeunes-talents'},
	    	{name:'opera-orchestre-montpellier.fr',url:'http://www.opera-orchestre-montpellier.fr/evenement/recital-flute-et-piano'},
	    	{name:'paris.by-night.fr',url:'http://paris.by-night.fr/soiree/pause-piano-de-nicolas-dross--338313.html'},
	    	{name:'montpellier3m.fr',url:'http://www.montpellier3m.fr/evenement-agenda/2-et-3-avril-classe-de-ma%C3%AEtre-de-serge-cyferstein-chant'},
	    	{name:'fbl-paris.org',url:'http://www.fbl-paris.org/fr/actualites/details/die-winterreise-franz-schubert.130.html'}
	    ]
	}
	$scope.loadData()
})

app.controller('carouselCtrl', function($scope) {
	$scope.carouselImg = []
	$scope.loadData = function() {
		$scope.carouselImg = [
			{url:'img/banner/Portrait 9x2.JPG',active:'active'},
	    	{title:'Carcassonne',url:'img/banner/Carcassonne 9x2.JPG',description:'Duo/Trio Éphémère'},
	    	{title:'Fontainebleau',url:'img/banner/Fontainebleau 9x2.jpeg',description:'Création de Vicente Hanser Atria, Nicky Swett, Nash Rider'},
	    	{title:'Belesta',url:'img/banner/Nicolas piano Belesta 9x2.jpg',description:'2014'},
	    	{title:'Petit palais',url:'img/banner/Petit palais 2017 9x2.JPG',description:'2017'},
	    	{title:'Versailles',url:'img/banner/Saluts augusta 2018 9x2.jpg',description:'2018'},
	    	{title:'Maison Heinrich Heine',url:'img/banner/Schubert 9x2.jpg',description:'28 janvier 2018'}
	    ]
	}
	$scope.loadData()
})

app.controller('bioCtrl', function($scope) {
	$scope.title = ''
	$scope.subtitle = ''
	$scope.paragraphs = []
	$scope.loadData = function() {
		$scope.title = 'Biographie'
		$scope.subtitle = 'Pianiste, compositeur, arrangeur, enseignant en devenir'
		$scope.paragraphs = [
			'C’est bien la curiosité qui a guidé la vie musicale de Nicolas Dross. Lors de ses études de piano à Montpellier, il s’initie en autodidacte à la composition, puis prends des cours d’écriture dans le but d’être compositeur. Sa rencontre avec Denis Pascal lui fait prendre conscience de la richesse de la littérature pour piano, ainsi que l’exigence de l’interprétation d’un langage musical, et dès lors il se passionne pour ses études pianistiques. Il entre en 2015 au Conservatoire Supérieur de Paris, dans la classe de Denis Pascal.',
			'Très sensible et à l’écoute, Nicolas est apprécié autant dans ses concerts soliste que dans ses multiples récitals de musique de chambre. En 2013, il remporte à la fois le concours interrégional de piano de Pennautier et le concours Les saisons de la voix à Gordes en duo avec la soprano Lalaïna Garreta. Il fait la rencontre de Jeff Cohen, qui lui ouvre les portes de l’interprétation dans l’accompagnement vocal. Il participe aussi à la création de diverses œuvres, notamment dans les Ecoles d’Art Américaines de Fontainebleau en 2016, véritable lieu de créativité et d’inspiration, où il crée l’électrique trio Speleology de Vicente Hanser Atria.'
	    ]
	}
	$scope.loadData()
})

app.controller('studCtrl', function($scope) {
	$scope.title = ''
	$scope.awards = {all:[]}
	$scope.paragraphs = []
	$scope.loadData = function() {
		$scope.title = 'Études'
		$scope.paragraphs = [
			'Issu d’une famille de mélomanes, Nicolas commence les cours de piano à 4 ans à l’école de musique de Clermont l’Hérault, dans la classe de Guilhem Puech. Après quelques années d’apprentissage, il est redirigé vers le Conservatoire à Rayonnement Régional de Montpellier, où il rentre à l’age de 7 ans.',
			'Commence alors une longue floraison dans cet établissement, en commençant par la classe de piano de Sophie Grattard qui lui permet de s’exprimer dans des styles très différents, le chœur et les classes de solfège (jusqu’au DEM avec Dominique Millet), puis dès le lycée les classes d’écriture et d’analyse de Bernard Maurin, et celles de musique de chambre avec Claire Stroll, Bernard Pozzera, et Michel Raynié. Initié à l’accompagnement et le jeu en orchestre dès le plus jeune âge par Guilhem Puech, Nicolas entre en cursus d’accompagnement chez Corinne Paoletti où il pratique réduction de quatuor, lecture à vue et accompagne les élèves chanteurs de Nicolas Domingues. En parallèle, il suit un baccalauréat'
			     + 'Technique de la Musique et de la Danse, où sont dispensés cours d’Histoire de la musique, de Physique du son, de Littérature et d’Histoire de l’art entre autres (il l’obtient en 2012). C’est à cette période qu’il rencontre Denis Pascal, à l’occasion des master-classes organisées au sein du conservatoire.',
			'Après sa remise de Certificats de Fin d’Études Musicales, Nicolas tente différents concours et est admis en 2014 à la Haute École de Musique de Genève chez Sylvianne Deferne, où il entre en contact avec la méthode Jaques-Dalcroze et l’environnement d’une école supérieure. Il y suit quelques cours de musiques de chambre (James Alexander, Gui-Michel Caillat), de technique corporelle (Valerie Morand-Sanchez), rencontre Leontina Vaduva à Lausanne, et participe à une master-classes de lieder par Jeanne Roth et Gottlieb Wallisch. Il y crée, au sein de l’Ensemble contemporain de la Haute École de Musique de Genève, une œuvre de Loïc Silvestre sous la baguette de Pierre Bleuse.',
			'Finalement reçu en 2015 au Conservatoire Supérieur de Paris, il y suit l’enseignement pointu de Denis Pascal, accompagné de ses assistants Sébastien Vichard et Varduhi Yeritsyan, des cours de lecture à vue avec Jonas Vitaud, d’harmonisation au clavier avec Isabelle Duha, ainsi qu’une année de master-classes sur piano anciens par Cyril Huvé. Il y est encouragé à continuer sa recherche dans le domaine corporel (avec les cours de Thechnique Alexander par Agnès de Brunhoff), accompagnement (classe Mélodie et Lied par Jeff Cohen, précédemment rencontré au concours Les Saisons de la Voix à Gordes), musique de chambre (classes d’Itamar GOLAN, Làszlo HADADY, David'
			     + 'WALTER et Haruko UEDA), mais surtout érudition avec son entrée en cursus d’Écriture supérieur (Harmonie chez Fabien Waksman) et en Analyse théorique et appliquée (Claude Ledoux).',
			'Actuellement titulaire d’un Diplôme National Supérieur Professionnel de Musicien en piano et d’un Prix d’Harmonie, il continue ses études en master de piano, d’écriture, d’analyse, et poursuit un cursus pour obtenir son Diplôme d’État de professeur de musique.'
	    ]
		$scope.awards.title = 'Récompenses'
		$scope.awards.all = [
			//'test' TODO: href
		]
	}
	$scope.loadData()
})

app.controller('tourCtrl', function($scope, $http) {
	$scope.concertList = []
	$scope.occList = []
	$scope.loadData = function() {
		$http.get('https://potential-bassoon.firebaseio.com/concerts.json').then(function(response) {			
			$scope.concertList = Object.keys(response.data).map(x => response.data[x])
			$scope.concertList.forEach(concert => {
				concert.occs.sort((a, b) => (a.date > b.date) ? 1 : (a.date === b.date) ? ((a.time > b.time) ? 1 : -1) : -1 ) //.reverse()
			})
			$scope.concertList.sort((a, b) => (a.occs[0].date > b.occs[0].date) ? 1 : (a.occs[0].date === b.occs[0].date) ? ((a.occs[0].time > b.occs[0].time) ? 1 : -1) : -1 )
		})
	}
	$scope.state = function(occ) {
		if (occ.cancel) {
			return 'cancel'
		} else if (new Date(occ.date) >= new Date().setHours(0,0,0,0)) {
			return 'on'
		} else {
			return 'off'
		}
	}
	$scope.concertIsOn = function (concert) {
		res = false
		concert.occs.forEach(function(occ) {
			if ($scope.state(occ)=='on') {
				res = true
			}
		})
		return res
	}
	$scope.occIsOn = function (occ) {
		return $scope.state(occ)=='on'
	}
	function concertsToOcc() {
		var res = []
		$scope.concertList.forEach(function(concert) {
			var occurences = []
			concert.occs.forEach(function(o) {
				var occurence = JSON.parse(JSON.stringify(concert))
				delete occurence.details
				delete occurence.occs
				Object.assign(occurence,o)
				occurences.push(occurence)
			})
			res.push(occurences)
		})
		$scope.occList = [].concat.apply([], res)
	}
	$scope.$watch('concertList', concertsToOcc)
	$scope.loadData()
})
