/**
 * YTS-downloader
 * Download recently released torrent files from yts.ag based on criteria specified
 *
 * @licence ISC
 * @copyright 2016, Dan Wilson [dan@codeality.com]
 */

var cron = require('cron').CronJob,
    got = require('got'),
    _ = require('lodash'),
    config = require('config'),
    moment = require('moment'),
    pattern = config.frequency.cron_pattern,
    fs = require('fs'),
    flatCache = require('flat-cache'),
    cache = flatCache.load('yts-downloader'),
    logger = require('eazy-logger').Logger({
        useLevelPrefixes: true,
        level : config.log_level
    }),
    downloaded = 0, checked = 0;

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
 * @param url
 * @param title
 */
var downloadFile = function (url, title) {
    var localFile = config.destination + '/' + title + '.torrent';
    logger.debug('Downloading Torrent', title, url, localFile);
    got.stream(url).pipe(fs.createWriteStream(localFile));
    downloaded++;
};

/**
 * Parse the JSON body and cycle through each movie
 *
 * @param body
 */
var handleResponse = function (body) {
    var response = JSON.parse(body),
        movies = response.data.movies,
        last = cache.getKey('last_uploaded') || config.since;

    _.each(movies, function (movie) {
        if (!cache.getKey(movie.id)) {
            logger.debug('Examining', movie.title_long);
            if (config.query.mpa_ratings.length) {
                logger.debug('Checking MPA Ratings:', movie.mpa_rating);
                if (config.query.mpa_ratings.indexOf(movie.mpa_rating) > -1) {
                    downloadFile(movie.torrents[0].url, movie.title);
                }
            } else {
                downloadFile(movie.torrents[0].url, movie.title);
            }
            cache.setKey(movie.id, true);

            if (movie.date_uploaded_unix > last) {
                cache.setKey('last_uploaded', movie.date_uploaded_unix);
            }
        }
    });
    cache.save();

    logger.info('Movies:', movies.length);
    logger.info('Downloaded:', downloaded);
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
    start : config.get('run_at_start')
});
job.start();