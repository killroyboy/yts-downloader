# yts-downloader

Summary
---------------
yts-downloader is an open source project providing automatic downloading of torrents for recent movies from yts.ag. You can filter based on quality (720p, 1080p, 3D), genre, rotten tomato rating or even MPA rating.

Requirements
---------------
- Node 6.x
- NPM 3.x

Features
---------------
- [x] Set frequency of fetching downloads
- [x] Cache when it already examined a movie, so it doesn't try to redownload
- [x] Filter by genre
- [x] Filter by MPA rating
- [x] Filter by quality (1080p, 720p, 3D)
- [x] Filter by Rotten Tomotos rating

Configuration
---------------
This is the default configuration. You can easily customize and override any setting by copying the `config/default.json` file to `config/development.json` and then change any settings you desire.

Notes: 
- `cron_pattern` overrides frequency unit/value. 
- leave `mpa_ratings` as empty array ([]) to retrieve all
- `log_level` can be 'error', 'warn', 'info', 'debug'
- `since` is not currently supported.

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

Author
---------------
Dan Wilson ([@killroyboy](https://twitter.com/killroyboy) / [Web](http://codeality.com))

License
---------------
MIT

Contributing
---------------
Code contributions are greatly appreciated, please submit a new [pull request](https://github.com/killroyboy/yts-downloader/pull/new/master)!
