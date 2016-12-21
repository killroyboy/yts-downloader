# yts-downloader

Summary
---------------
yts-downloader is an open source project providing automatic downloading of torrents for recent movies from yts.ag. You can filter based on quality (720p, 1080p, 3D), genre, rotten tomato rating or even MPA rating.

Requirements
---------------
- Node 6.x
- NPM

Download
---------------

Configuration
---------------
This is the default configuration. You can easily customize and override any setting by copying the `config/default.json` file to `config/development.json` and then change any settings you desire.

Note: `cron_pattern` overrides frequency unit/value. `since` is not currently supported.

```js
{
  "frequency" : {
	"unit" : "hours",
	"value" : "*/2",
	"cron_pattern" : ""
  },
  "query" : {
	"mpa_ratings" : ["G", "PG", "PG-13"],
	"minimum_rating" : 5,
	"genre" : "",
	"quality" : "1080p"
  },
  "baseurl" : "https://yts.ag/api/v2",
  "destination" : "./torrents",
  "run_at_start" : true,
  "log_level" : "info",
  "cache_ttl" : 2592000,
  "since" : 1482032238
}
```

Features
---------------
- [x] Filter by genre
- [x] Filter by MPA rating
- [x] Filter by quality (1080p, 720p, 3D)
- [x] Filter by Rotten Tomotos rating

Author
---------------
Dan Wilson ([@killroyboy](https://twitter.com/killroyboy) / [Web](http://codeality.com))

License
---------------
MIT

Contributing
---------------
Code contributions are greatly appreciated, please submit a new [pull request](https://github.com/killroyboy/yts-downloader/pull/new/master)!
