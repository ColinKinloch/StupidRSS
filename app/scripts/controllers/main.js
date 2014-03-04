'use strict';
/*global $:false */
/*global URI:false */

/*
var fakegoogleChromeRSSID = 'kgoadapppofjjmcfmlhcdooejpikhdgo';
var googleChromeRSSID = 'nlbjncdgjeocebhnmkbbbdekmmmcbfjd';
*/

angular.module('stupidRssApp')
	.controller('MainCtrl', function ($scope, $http, localStorageService)
	{
		
		function Article(guid)
		{
			this.guid = guid;
			this.tag = null;
		}
		
		function Feed(url, name, icon, articles)
		{
			if('undefined' !== typeof url)
			{
				this.url = url || Feed.prototype.url;
			}
			else
			{
				return;
			}
			this.name = name || Feed.prototype.name;
			this.icon = icon || Feed.prototype.icon;
			this.articles = articles || Feed.prototype.articles;
		}
		
		Feed.prototype.url = '';
		Feed.prototype.name = 'New Feed';
		Feed.prototype.icon = 'images/icon48.png';
		Feed.prototype.articles = [];
		
		Feed.prototype.updateXML = function()
		{
			var xmlDoc;
			//var that = this;
			//console.log(that.xml);
			$http({method: 'GET', url: this.url})
				.success(function(data){
					xmlDoc = $.parseXML(data);
					//TODO Fix stringification
					//that.xml = xmlDoc;
				});
		};
		Feed.prototype.pollName = function()
		{
			
		};
		Feed.prototype.pollIcon = function()
		{
			
		};
		Feed.prototype.toJSON = function()
		{
			return JSON.stringify({url: this.url, name: this.name, icon: this.icon});
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
		
		var storedFeeds = localStorageService.get('feeds');
		var storedSettings = localStorageService.get('settings');
		$scope.folderOpen = true;
		$scope.newContent = false;
		$scope.sortOpts = {
			distance: 3,
			placeholder: 'a',
			helper: function(e, el)
			{
				console.log($(el).parent().width($(el).parent().width()));
				return el;
			},
			stop: function(e)
			{
				$(e.target).css('width', 'initial');
			}
		};
		$scope.feeds = (function(){
			var feeds = [];
			if(null !== storedFeeds)
			{
				console.log(typeof storedFeeds, storedFeeds);
				
				storedFeeds.forEach(function(feed){
					var articles = [];
					var fed = JSON.parse(feed);
					if('undefined' !== typeof fed.articles)
					{
						feed.articles.forEach(function(article){
							articles.push(new Article(article));
						});
					}
					feeds.push(new Feed(fed.url, fed.name, fed.icon, articles));
				});
			}
			return feeds;
		}());
		$scope.$watchCollection('feeds', function(/*oldFeed, newFeed*/)
		{
			localStorageService.set('feeds', $scope.feeds);
		});
		
		$scope.settings = storedSettings || {
			read: false,
			view: 'list',
			folderOpen: false,
			tags: [
				'blue',
				'green',
				'yellow',
				'red'
			]
		};
		$scope.$watch('settings', function(/*oldSetting, newSetting*/){
			console.log('settings changed');
			localStorageService.set('settings', $scope.settings);
		}, true);
		$scope.views = ['list',
			'grid'];
		$scope.showAddFeed = false;
		$scope.showAddFolder = false;
		$scope.toggleAddFeed = function()
		{
			$scope.showAddFeed = !$scope.showAddFeed;
			if($scope.showAddFeed)
			{
				$('#addFeedInputUrl').focus();
			}
		};
		$scope.toggleAddFolder = function()
		{
			$scope.showAddFolder = !$scope.showAddFolder;
			if($scope.showAddFolder)
			{
				$('#addFeedInputUrl').focus();
			}
		};
		$scope.addFeed = function(url, name, icon)
		{
			if('' === url)
			{
				console.log('URL blank');
				return;
			}
			var uri = new URI(url).normalize();
			if('' === uri.protocol())
			{
				uri = new URI(URI.build({hostname:url})).normalize();
			}
			var exists = false;
			console.log('Domain:', uri.domain(), 'path', uri.pathname());
			console.log(uri.href());
			//TODO Move this?
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
			//TODO Figure out valid protocols
			if('' === uri.scheme())
			{
				uri.scheme('http');
			}
			console.log('getting:', uri.href());
			$http({method: 'GET', url:uri.href()})
				.success(function(data/*, status, headers, config*/)
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
						//TODO Check undefined
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
						if('undefined' === typeof name)
						{
							name = xml.find('channel').children('title').text();
						}
						if('undefined' === typeof icon)
						{
							icon = xml.find('channel').children('image').children('url').text();
						}
					}
					else if(xml.children('feed').length?xml.children('feed').attr('xmlns').match(/.*atom.*/i):false)
					{
						console.log('Atom');
						name = xml.find('feed').children('title').text();
					}
					else if(xml.children('html').length)
					{
						//TODO Get the favicon here
						console.log('Valid XHTML');
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
						return $scope.addFeed(rssUrls[0].href(), name, icon);
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
					$scope.feeds.push(new Feed(uri.href(), name, icon));
				})
				.error(function(data, status/*, headers, config*/){
					console.log('failed to get', uri.href(), 'with status', status);
				});
		};
		$scope.rmFeed = function(url)
		{
			console.log('attempting to remove:', url);
			var uri = URI(url).normalize();
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
