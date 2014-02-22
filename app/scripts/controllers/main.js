'use strict';
/*global $:false */

function Feed(Url, Name, Img){
	this.url = Url;
	this.name = Name;
	this.img = Img;
}

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope, $http) {
		$scope.feeds = [
			{name:'HAWPCast.', url:'http://hawpcast.podbean.com/feed'},
			{name:'xkcd', url:'https://xkcd.com/rss.xml'}
		];
		$scope.showAdd = false;
		$scope.addFeed = function(Url, Name, Img) {
			var uri = URI(Url).normalize();
			var exists = false;
			$scope.feeds.forEach(function(feed){
				if(feed.url == uri.normalize())
					{
						exists = true;
					}
			});
			if(exists)
				return;
			if(uri.protocol()=='')
				uri.protocol('http');
			console.log("adding: ", uri.href())
			$http({method: 'GET', url:uri.href()})
				.success(function(data, status, headers, config){
					try {
						var rssDoc = $.parseXML(data);
					}
					catch(e) {
						console.log("URL not XML, searching for html rss/atom link");
						var rssTags = data.match(/<link.*type=.*(rss|atom).*>/ig);
						var rssUrls = [];
						rssTags.forEach(function(tag){
							rssUrls = rssUrls.concat(tag.match(/href=['"](.*)['"]/i)[1]);
						});
						return $scope.addFeed(rssUrls[0]);
					}
					var rss = $(rssDoc);
					Name = rss.find('channel').children('title').text();
					Img = rss.find('channel').children('image').children('url').text();
					$scope.feeds.push(new Feed(uri.href(), Name, Img));
				})
				.error(function(data, status, headers, config){
					console.log(uri.href()+" ist caput mit status:", status);
				});
		};
	});
