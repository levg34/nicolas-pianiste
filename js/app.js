var app = angular.module('app', []);
app.controller('linkCtrl', function($scope) {
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
})