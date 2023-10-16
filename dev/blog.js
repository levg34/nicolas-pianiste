var app = angular.module('blogApp', [])

app.controller('postCtrl', function($scope) {
	$scope.defaultTitle = 'Nouvelles de Nicolas'
	$scope.publish = function() {
		if (!$scope.content) {
			// TODO: raise error
			return
		}
		if (!$scope.title) {
			$scope.title = $scope.defaultTitle
		}
		$scope.posts.push({
			title:$scope.title,
			content:$scope.content,
			date: new Date()
		})
		$scope.content = ''
		$scope.title = ''
	}
	$scope.posts = Array(5).fill({
		title:'Super post',
		content:'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
		date: new Date()
	})
	$scope.delete = function(postId) {
		$scope.posts.splice(postId, 1);
	}
	$scope.editing
	$scope.edit = function($index) {
		$scope.editing = $index
		$scope.editPost = angular.copy($scope.posts[$index])
	}
	$scope.pushEdit = function() {
		if (!$scope.editPost) return
		$scope.posts[$scope.editing]=angular.copy($scope.editPost)
		delete $scope.editPost
		delete $scope.editing
	}
})
