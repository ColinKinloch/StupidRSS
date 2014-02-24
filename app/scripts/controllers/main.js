'use strict';
/*global $:false */
/*global URI:false */

function Article(guid)
{
	this.guid = guid;
}

function Feed(url, name, icon, articles)
{
	if('undefined' !== typeof url)
	{
		this.url = ('undefined' !== typeof url) ? url : Feed.prototype.url;
	}
	else
	{
		return;
	}
	this.name = ('undefined' !== typeof name) ? name : Feed.prototype.name;
	this.icon = ('undefined' !== typeof icon) ? icon : Feed.prototype.icon;
	this.articles = ('undefined' !== typeof articles) ? articles : Feed.prototype.articles;
}

Feed.prototype.url = '';
Feed.prototype.name = 'New Feed';
Feed.prototype.icon = 'images/icon48.png';
Feed.prototype.articles = [];

Feed.prototype.getXML = function($http)
{
	$http({method: 'GET', url: this.url})
		.success(function(data){
			
	});
	return;
};
Feed.prototype.pollName = function()
{
	
};
Feed.prototype.pollIcon = function()
{
	
};
Feed.prototype.getObjects = function()
{
	return {url: this.url, name: this.name, img: this.img};
};
function Folder(name, contents)
{
	if('undefined' !== typeof name)
	{
		this.name = ('undefined' !== typeof name) ? name : Folder.prototype.name;
	}
	if('undefined' !== typeof contents)
	{
		this.contents = ('undefined' !== typeof contents) ? contents : Folder.prototype.contents;
	}
	this.open = false;
}

Folder.prototype.name = 'New Folder';
Folder.prototype.contents = [];

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope, $http, localStorageService)
	{
		var storedFeeds = localStorageService.get('feeds');
		$scope.folderOpen = true;
		$scope.newContent = false;
		$scope.feeds = function(){
			var feeds = [];
			if(null !== storedFeeds)
			storedFeeds.forEach(function(feed){
				var articles = [];
				feed.articles.forEach(function(article){
					articles.push(new Article(article));
				});
				feeds.push(new Feed(feed.url, feed.name, feed.icon, articles));
			});
			return feeds;
		}();
		$scope.$watch(function()
		{
			localStorageService.add('feeds', JSON.stringify($scope.feeds));
		});
		
		$scope.showAdd = false;
		$scope.addFeed = function(Url, Name, Img)
		{
			var uri = URI(Url).normalize();
			var exists = false;
			console.log(uri.domain(), 'hey', uri.pathname());
			console.log(uri.href());
			$scope.feeds.forEach(function(feed)
			{
				if(uri.equals(feed.url))
				{
					exists = true;
				}
			});
			if(exists)
			{
				console.log('cannot add:', uri.href(), 'entry exists');
				return;
			}
			if('' === uri.scheme())
			{
				uri.scheme('http');
			}
			if('' === uri.host())
			{
				//TODO do this better
				uri.host(uri.filename());
				uri.filename('');
			}
			console.log('getting:', uri.href());
			$http({method: 'GET', url:uri.href()})
				.success(function(data, status, headers, config)
				{
					var xmlDoc;
					try
					{
						xmlDoc = $.parseXML(data);
					}
					catch(e)
					{
						console.log('URL not XML, searching for html rss/atom link');
						var rssTags = data.match(/<link.*type=.*(rss|atom).*>/ig);
						var rssUrls = [];
						rssTags.forEach(function(tag)
						{
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
						if('undefined' === typeof Name)
						{
							Name = xml.find('channel').children('title').text();
						}
						if('undefined' === typeof Img)
						{
							Img = xml.find('channel').children('image').children('url').text();
						}
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
							var $el = $(el);
							if($el.attr('type')?$el.attr('type').match(/.*(rss|atom).*/i):false)
							{
								rssUrls.push(URI($el.attr('href')));
							}
						});
						if('' === rssUrls[0].host())
						{
							rssUrls[0] = uri.clone().filename(rssUrls[0].href()).normalize();
						}
						return $scope.addFeed(rssUrls[0].href(), Name, Img);
					}
					else
					{
						console.log('Not RSS nor Atom');
						return;
					}
					$scope.feeds.forEach(function(feed){
						if(uri.equals(feed.url))
						{
							console.log('cannot add', uri.href(), 'last minute feed exists');
							exists = true;
						}
					});
					if(exists)
					{
						return;
					}
					console.log('adding:', uri.href());
					$scope.feeds.push(new Feed(uri.href(), Name, Img));
				})
				.error(function(data, status, headers, config){
					console.log('failed to get', uri.href(), 'with status', status);
				});
		};
		$scope.rmFeed = function(Url)
		{
			console.log('attempting to remove:', Url);
			var uri = URI(Url).normalize();
			if('' === uri.scheme())
			{
				uri.scheme('http');
			}
			if('' === uri.host())
			{
				//TODO do this better
				uri.host(uri.filename());
				uri.filename('');
			}
			$scope.feeds.forEach(function(feed, i, arr)
			{
				if(feed.url === uri.href())
				{
					console.log('removing:', uri.href());
					arr.splice(i, 1);
				}
			});
		};
	});
