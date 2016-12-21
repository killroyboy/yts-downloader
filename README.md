# yts-downloader

Summary
---------------
*yts-downloader* is an open source NodeJS project providing automatic torrent downloading for recent movies published by [yts.ag](http://yts.ag). You can filter based on quality (720p, 1080p, 3D), genre, rotten tomato rating, minimum year or even MPA rating. This project will only download the torrent files. The assumption is that a separate torrent downloader utility, like [Transmission](https://transmissionbt.com), be used to download the actual movies. Transmission can watch a designated directory for new torrent files to automaticaly add the torrent files and start downloading the movies. This directory should be designated as the `destination` in the *yts-downloder* configuration file.

Requirements
---------------
- Node 6.x
- NPM 3.x

Features
---------------
- [x] Set frequency of fetching torrents
- [x] Cache when it already examined a movie, so it doesn't try to redownload
- [x] Filter by genre
- [x] Filter by quality (1080p, 720p, 3D)
- [x] Filter by Rotten Tomatoes rating
- [x] Filter by MPA rating
- [x] Filter by minimum year

Installation
---------------
To use *yts-downloader*, you must first install [NodeJS](https://nodejs.org/en/download/). After Node is installed, download and unzip the latest [release](https://github.com/killroyboy/yts-downloader/releases) into any given directory. 

Customize the configuration by copying the `config/default.json` file to `config/development.json` and then editing your settings. If you edit default.json directly, it is likely that future versions of *yts-downloder* will overwrite your customizations.

Open a command line window (`terminal` on MacOS or follow [these instructions](https://www.lifewire.com/command-prompt-2625840) for Windows) and issue the following commands within the yts-downloader directory:
- npm install
- node index.js

The first command will install all the prerequisits and the second stars *yts-downloader*. You will need to keep this window and process running in order to allow it to continue to retrieve torrent files. There are tools available (like [forever](https://www.npmjs.com/package/forever)) to ensure the process runs in the background.


Configuration
---------------
Below is the default configuration. You can easily customize and override any setting by copying the `config/default.json` file to `config/development.json` and then change any settings you desire.

```js
{
  "frequency" : {
	"unit" : "hours",
	"value" : "*/2",
	"cron_pattern" : ""
  },
  "query" : {
	"minimum_rating" : 5,
	"genre" : "",
	"quality" : "1080p"
  },
  "filter" : {
	"mpa_ratings" : ["G", "PG", "PG-13"],
	"minimum_year" : ""
  },
  "baseurl" : "https://yts.ag/api/v2",
  "destination" : "./torrents",
  "run_at_start" : true,
  "log_level" : "info",
  "cache_ttl" : 2592000,
  "since" : 1482032238
}
```
Notes: 
- `cron_pattern` overrides frequency unit/value. 
- leave `mpa_ratings` as empty array ([]) to retrieve all
- `log_level` can be 'error', 'warn', 'info', 'debug'
- `since` is not currently supported.

Author
---------------
Dan Wilson ([@killroyboy](https://twitter.com/killroyboy) / [Web](http://codeality.com))

License
---------------
MIT

Contributing
---------------
Code contributions are greatly appreciated, please submit a new [pull request](https://github.com/killroyboy/yts-downloader/pull/new/master)!
