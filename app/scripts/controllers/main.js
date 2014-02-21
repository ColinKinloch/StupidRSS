'use strict';

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope) {
		$scope.feeds = [
			{name:'HAWPCast.', url:'http://hawpcast.podbean.com/feed'},
			{name:'Getting on with James Urbaniak', url:'http://gettingonwithju.libsyn.com/rss'},
			{name:'xkcd', url:'https://xkcd.com/rss.xml'}
		];
		$scope.addFeed = function(Name, Url, Img) {
			console.log(Name, Url, Img);
			return 'hi';
		};
	});
