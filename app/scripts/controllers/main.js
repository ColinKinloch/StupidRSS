'use strict';
/*global $:false */

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

function Feed(Url, Name, Img){
	this.url = Url;
	this.name = Name;
	this.img = Img;
}

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope, $http, localStorageService) {
		var storedFeeds = localStorageService.get('feeds');
		console.log(storedFeeds)
		$scope.feeds = storedFeeds  || [];
		$scope.$watch(function(){
			localStorageService.add('feeds', JSON.stringify($scope.feeds));
		});
		
		$scope.showAdd = false;
		$scope.rmFeed = function(Url) {
			var uri = URI(Url).normalize();
			if(uri.protocol()=='')
				uri.protocol('http');
			$scope.feeds.forEach(function(feed, i, arr){
				if(feed.url == uri.href())
				{
					console.log("removing:", uri.href())
					arr.splice(i, 1);
				}
			});
		};
		$scope.addFeed = function(Url, Name, Img) {
			var uri = URI(Url).normalize();
			var exists = false;
			$scope.feeds.forEach(function(feed){
				if(feed.url == uri.href())
				{
					exists = true;
				}
			});
			if(exists)
			{
				console.log('cannot add:', uri.href(), 'entry exists')
				return;
			}
			if(uri.protocol()=='')
				uri.protocol('http');
			console.log("adding:", uri.href())
			$http({method: 'GET', url:uri.href()})
				.success(function(data, status, headers, config){
					try {
						var xmlDoc = $.parseXML(data);
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
					var xml = $(xmlDoc);
					if(xml.children('rss').length)
					{
						//TODO Decide which data to favour
						//TODO Decide which feed to favour
						console.log('RSS');
						if(undefined===Name)
							Name = xml.find('channel').children('title').text();
						if(undefined===Img)
							Img = xml.find('channel').children('image').children('url').text();
					}
					else if(xml.children('feed').length?xml.children('feed').attr('xmlns').match(/.*atom.*/i):false)
					{
						console.log('Atom');
						Name = xml.find('feed').children('title').text();
					}
					else if(xml.children('html').length)
					{
						//TODO Get the favicon here
						console.log('Valid XML, HTML');
						var rssUrls = [];
						xml.find('head').children('link').each(function(i, el){
							var $el = $(el)
							console.log(el,$el.attr('type'))
							if($el.attr('type')?$el.attr('type').match(/.*(rss|atom).*/i):false)
								rssUrls.push(URI($el.attr('href')));
						});
						if(rssUrls[0].host()=='')
						{
							rssUrls[0] = URI(uri.href()+rssUrls[0].href()).normalize();
						}
						return $scope.addFeed(rssUrls[0].href(), Name, Img);
					}
					else
					{
						console.log('Not RSS nor Atom');
						return;
					}
					$scope.feeds.push(new Feed(uri.href(), Name, Img));
				})
				.error(function(data, status, headers, config){
					console.log(uri.href()+" ist caput mit status:", status);
				});
		};
	});
