var app = angular.module('app', [])

app.controller('linkCtrl', function($scope,$http) {
	$scope.personalLinks = []
	$scope.mediaLinks = []
	$scope.otherLinks = []
	$scope.loadData = function() {
		$http.get('/links').then(response => {		
			if (response && response.data && (response.data instanceof Array)) {
				response.data.forEach(link => {
					$scope[`${link.type ? link.type : 'other'}Links`].push(link)
				})
			}
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})

app.controller('carouselCtrl', function($scope,$http) {
	$scope.carouselImg = []
	$scope.loadData = function() {
		$http.get('/carousel').then(response => {		
			$scope.carouselImg = response.data
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})

app.controller('bioCtrl', function($scope, $http) {
	$scope.title = ''
	$scope.subtitle = ''
	$scope.paragraphs = []
	$scope.loadData = function() {
		$http.get('/biographie').then(response => {	
			if (!response || !response.data) return	
			const data = response.data
			const {title, subtitle} = data.find(e => e.title)

			$scope.title = title
			$scope.subtitle = subtitle
			$scope.paragraphs = data.filter(e => e.paragraph).map(e => e.paragraph)
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})

app.controller('studCtrl', function($scope, $http) {
	$scope.title = ''
	$scope.awards = {all:[]}
	$scope.paragraphs = []
	$scope.loadData = function() {
		$http.get('/studies').then(response => {	
			if (!response || !response.data) return	
			const data = response.data
			const {title, awardsTitle} = data.find(e => e.title)

			$scope.title = title
			$scope.awards.title = awardsTitle
			$scope.paragraphs = data.filter(e => e.paragraph).map(e => e.paragraph)
			$scope.awards.all = data.filter(e => e.award).map(e => e.award)
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})

app.controller('tourCtrl', function($scope, $http) {
	$scope.concertList = []
	$scope.occList = []
	$scope.loadData = function() {
		$http.get('/concerts').then(function(response) {
			const raw = response.data
			const concertList = []
			raw.filter(c => c.name).forEach(concert => {
				concert.id = concert._id
				concert.occs = raw.filter(o => o.concertId === concert._id)
				concertList.push(concert)
			})
			$scope.concertList = concertList.map(concert => {
				if (concert.occs.length > 0) {
					return concert
				} else {
					return {
						...concert,
						noOccs: true,
						occs: [
							{
								date:'2099-12-31',
								time:'23:59'
							}
						]
					}
				}
			})
			$scope.concertList.forEach(concert => {
				concert.occs.sort((a, b) => (a.date > b.date) ? 1 : (a.date === b.date) ? ((a.time > b.time) ? 1 : -1) : -1 ) //.reverse()
			})
			$scope.concertList.sort((a, b) => (a.occs[0].date > b.occs[0].date) ? 1 : (a.occs[0].date === b.occs[0].date) ? ((a.occs[0].time > b.occs[0].time) ? 1 : -1) : -1 )
			$('[data-toggle="popover"]').popover()
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

app.controller('contactCtrl', function($scope, $http) {
	$scope.sendError = false
	$scope.sendSuccess = false
	$scope.loading = false
	$scope.nbMessages = 0

	$scope.sendMessage = function() {
		$scope.sendError = false
		$scope.sendSuccess = false
		
		const {name,email,message} = $scope
		
		if (name && email && message) {
			const messagePayload = {
				name,
				email,
				message
			}

			$scope.loading = true
			
			$http.post('/message',messagePayload).then(res => {
				$scope.sendSuccess = true
				$scope.name = ""
				$scope.email = ""
				$scope.message = ""
				$scope.loading = false
				getNbMessages()
			}).catch(err => {
				$scope.sendError = err.data ? err.data : err
				$scope.loading = false
			})
		} else {
			if (name && message) {
				$scope.sendError = "Veuillez renseigner un email valide."
			} else {
				$scope.sendError = "Vous devez remplir tous les champs."
			}
		}
	}

	function getNbMessages() {
		$http.get('/messages/count').then(res => $scope.nbMessages = res.data.messages).catch(err => console.error(err))
	}

	getNbMessages()
})

app.controller('videosCtrl', function($scope,$http) {
	$scope.videos = []
	$scope.loadData = function() {
		$http.get('/videos').then(response => {		
			$scope.videos = response.data.reverse()
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})

app.controller('repertoryCtrl', function($scope,$http) {
	$scope.repertory = []
	$scope.loadData = function() {
		$http.get('/repertory').then(response => {		
			$scope.repertory = response.data
		}).catch(err => console.error(err))
	}
	$scope.loadData()
})
