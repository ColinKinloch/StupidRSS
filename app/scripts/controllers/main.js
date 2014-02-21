'use strict';

function Feed(Url, Name, Img){
	this.url = Url;
	var that = this;
	this.rssCallback = function(data) {
		var rss = $(data);
		console.log("this is", that);
		that.name = rss.find('channel').children('title').text();
	};
	if(undefined===Name||undefined===Img) {
		jQuery.get(this.url, this.rssCallback);
	}
};

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope) {
		$scope.feeds = [
			{name:'HAWPCast.', url:'http://hawpcast.podbean.com/feed'},
			{name:'Getting on with James Urbaniak', url:'http://gettingonwithju.libsyn.com/rss'},
			{name:'xkcd', url:'https://xkcd.com/rss.xml'}
		];
		$scope.addFeed = function(Url, Name, Img) {
			$scope.feeds.push(new Feed(Url));
		};
	});
