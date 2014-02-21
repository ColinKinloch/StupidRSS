'use strict';

function Feed(Url, Name, Img){
	this.url = Url;
	if(undefined===Name||undefined===Img)
	{
		jQuery.get(this.url, function(data){
			var rss = $(data);
			console.log(rss.find("channel.title").text())
		});
	}
	this.name = Name;
}

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope) {
		$scope.feeds = [
			{name:'HAWPCast.', url:'http://hawpcast.podbean.com/feed'},
			{name:'Getting on with James Urbaniak', url:'http://gettingonwithju.libsyn.com/rss'},
			{name:'xkcd', url:'https://xkcd.com/rss.xml'}
		];
		$scope.addFeed = function(Url, Name, Img) {
			var newFeed = new Feed(Url);
			$scope.feeds.push(newFeed);
			return 'hi';
		};
	});
