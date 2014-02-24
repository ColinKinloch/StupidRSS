StupidRSS
=========

It's RSS, dumdum.

Running
-------

This project may not work as a chrome extension yet, it's being developed using grunt.

As a chrome extension a production version will not be effected CORS, however in production I decided to use grunt serve in lieu of loading it as a chrome extension, this means web security need to be disabled to test in chrome.

```
$git clone
$npm install
$bower install
$open -a 'Google Chrome' --args --disable-web-security #Allows cross domain
$grunt serve
```
