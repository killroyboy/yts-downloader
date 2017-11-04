/**
 * YTS-downloader
 * Download recently released torrent files from yts.ag based on criteria specified
 *
 * @license MIT
 * @copyright 2016, Dan Wilson [killroyboy@gmail.com]
 */

var cron = require('cron').CronJob,
    got = require('got'),
    _ = require('lodash'),
    config = require('config'),
    moment = require('moment'),
    pattern = config.frequency.cron_pattern,
    fs = require('fs'),
    path = require('path'),
    flatCache = require('flat-cache'),
    cache = flatCache.load('yts-downloader', path.resolve('./cache')),
    logger = require('eazy-logger').Logger({
        useLevelPrefixes: true,
        level : config.log_level
    }),
    downloaded = 0, total = parseInt(cache.getKey('total-downloaded')) || 0, responded = 0, requested = 0;

// compile a manual pattern
if (!pattern) {
    var order = ['seconds', 'minutes', 'hours', 'daymonth', 'months', 'dayweek'],
        patternParts = [];

    var unit = config.frequency.unit,
        value = config.frequency.value,
        found = false;

    for (var x = 0; x < order.length; x++) {
        if (order[x] === unit) {
            found = true;
            patternParts.push(value);
        } else if (found) {
            patternParts.push('*');
        } else {
            patternParts.push('0');
        }
    }
    pattern = patternParts.join(' ');
}

// create the directory if it doesn't exist
if (!fs.existsSync(config.destination)) {
    logger.info('Creating destination directory', config.destination);
    fs.mkdirSync(config.destination);
}

/**
 * Request the recent movies from the base URL (yts.ag)
 * @param callback
 */
var requestRecentMovies = function (callback) {
    var url = config.baseurl + '/list_movies.json?',
        query = config.query;

    if (query.minimum_rating) {
        url += '&minimum_rating=' + query.minimum_rating;
    }

    if (query.quality) {
        url += '&quality=' + query.quality;
    }

    if (query.genre) {
        url += '&genre=' + query.genre;
    }

    logger.debug('Requesting url', url);
    got(url).then(response => {
        logger.debug('Response:', response.statusCode, response.statusMessage);
        callback(response.body);
    }).catch(error => {
        logger.error('Error requesting url:', error.response.body);
    });
};

/**
 * Download the torrent file and save it to the destination directory
 * @param torrents
 * @param movie
 */
var downloadFile = function (movie) {
    requested++; // track how many downloads we request
    var localFile = config.destination + '/' + movie.title + '.torrent';
    _.each(movie.torrents, function (torrent) {
        logger.trace('Checking for quality', torrent.quality, config.query.quality);
        if (torrent.quality === config.query.quality) {
            logger.debug('Downloading Torrent', movie.title, torrent.url, localFile);
            // if pre-download script, run it 
            if (config.pre_download_script) {
                //exec(config.pre_download_script); 
            } 
 
            got.stream(torrent.url).on('error', (error) => {
                responded++; // track how many we get back
                logger.error('Error Downloading', movie.title, error.toString());
            }).on('response', (response) => {
                logger.trace('Setting cache key for', movie.id, movie.title);
                cache.setKey(movie.id, true);
                responded++; // track how many we get back
                downloaded++;
            }).pipe(fs.createWriteStream(localFile));
        }
    });
};

/**
 * Parse the JSON body and cycle through each movie
 *
 * @param body
 */
var handleResponse = function (body) {
    var response = JSON.parse(body),
        movies = response.data.movies,
        matchCriteria = true,
        checked = 0,
        printer = null,
        last = cache.getKey('last_uploaded') || config.since;

    // reset current run count
    downloaded = 0;

    // loop through all the movies and download if it's new
    _.each(movies, function (movie) {
        matchCriteria = true;
        logger.trace('Checking cache key', movie.id, movie.title);
        if (!cache.getKey(movie.id)) {
            logger.debug('Examining', movie.title_long);

            if (config.filter.mpa_ratings.length) {
                if (config.filter.mpa_ratings.indexOf(movie.mpa_rating) < 0) {
                    logger.debug('Ignoring', movie.title, 'because MPA Rating:', movie.mpa_rating);
                    cache.setKey(movie.id, true);
                    matchCriteria = false;
                }
            }

            // only check this if we are still planning to download
            if (matchCriteria && config.filter.minimum_year) {
                if (parseInt(movie.year) < parseInt(config.filter.minimum_year)) {
                    logger.debug('Ignoring', movie.title, 'because year:', movie.year);
                    cache.setKey(movie.id, true);
                    matchCriteria = false;
                }
            }

            if (matchCriteria) {
                logger.info('Downloading', movie.title_long);
                if (config.script_before) {
					const { execFile } = require('child_process');
					const child = execFile('node', ['--version'], (error, stdout, stderr) => {
						if (error) {
							throw error;
						}
					});
                }
                downloadFile(movie);
            }

            // cache the latest uploaded date
            if (movie.date_uploaded_unix > last) {
                last = movie.date_uploaded_unix;
            }
        }
    });
    cache.setKey('last_uploaded', last);

    var final = setInterval(function () {
        if (responded === requested || ++checked > (movies.length * 2)) {
            clearInterval(final);
            total += downloaded;
            cache.setKey('total-downloaded', total);
            printer = config.always_log_results || downloaded > 0 ? logger.info : logger.debug;
            printer('Movies:', movies.length);
            printer('Downloaded:', downloaded);
			printer('Total:', total);
            cache.save();
        }
    }, 200);
};

logger.trace('Cron Pattern:', pattern);

/**
 * Start the cron
 */
var job = new cron({
    cronTime : pattern,
    onTick : function () {
        logger.info('yts-downloader', moment().toString());
        requestRecentMovies(handleResponse);
    },
    runOnInit : config.run_at_start,
    start : true
});
