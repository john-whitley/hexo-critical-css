'use strict';

/*
 * Include the necessary libraries
 */
var Critical = require('critical');
var fs = require('hexo-fs');
var pathFn = require('path');
var assign = require('object-assign');
var minimatch = require('minimatch');

/**
 * @parameter {boolean} needWorker is it necessary to register the worker
 */
var needWorker = true;

/**
 * If the candidateName that of an HTML file
 *
 * @param {string} candidateName the filename to assess
 *
 * @return {boolean} true if the filename looks like an HTML file
 */
function isHtmlFile(candidateName) {
  var extname = pathFn.extname(candidateName) || candidateName;

  var extention =  extname[0] === '.' ? extname.slice(1) : extname;

  return extention === 'html' || extention === 'htm';
}

/**
 * Match the candidate name against all the given
 * candidateFilters.  The filters are in
 *
 * @param  {string} candidateName the filename to assess
 * @param  {string[]} candidateFilters paths to filter against.  These are in
 *                    {@link https://www.npmjs.com/package/minimatch|minimatch}
 *                    format.
 *
 * @return {boolean} true if the candidateName matches any combination
 *                        of filters in candidateFilters.
 */
function filterFiles(candidateName, candidateFilters) {
  var filters = [];

  if (Array.isArray(candidateFilters)) {
    filters = candidateFilters;
  }

  return filters.reduce(function(currentlyBeingKept, filter) {
    if (currentlyBeingKept) {
      var candidateNameMatches = minimatch(candidateName, filter);
      var candidateIsToBeKept = !candidateNameMatches;

      return candidateIsToBeKept;
    }

    return false;
  }, true);
}

/**
 * Get the critical generate options
 *
 * @param {string} publicDir the hexo public directory
 * @param {string} htmlFile the HTML file
 * @param {object} options the criticalcss options
 * @param {bunyan} log the bunyan.createLogger instance given to use
 *                 by hexo.
 *
 * @return {object} the options for critical.generate
 */
function getCriticalOptions(publicDir, htmlFile, options, log) {
  // join publicDir and htmlFile to get absolute file path
  var src = pathFn.normalize(pathFn.join(publicDir, htmlFile));

  // remove file name from absolute file path to get
  // base directory
  var base = src.replace(pathFn.basename(src), '');

  var criticalOptions = assign(
    options.critical,
    {
      base: base,
      src: src
    }
  );

  delete criticalOptions.dest;

  return criticalOptions;
}

/**
 * Apply Critical to one file.  To ensure that the Critical is placed
 * in the head regardless of where the css is called (hopefully the end
 * of the HTML) the Critical is generated, then the </head> is prefixed
 * with the Critical CSS.
 *
 * @param {string} publicDir the hexo public directory
 * @param {string} htmlFile the HTML file
 * @param {object} options the criticalcss options
 * @param {bunyan} log the bunyan.createLogger instance given to use
 *                 by hexo.
 *
 * @return {Promise} the work to generate Critical on this file
 */
function applyCriticalToFile(publicDir, htmlFile, options, log) {
  var destFilename = publicDir + '/' + htmlFile;
  var criticalOptions = getCriticalOptions(publicDir, htmlFile, options, log);
  var criticalPromise = Critical.generate(criticalOptions);

  if (criticalOptions.inline) {
    return criticalPromise.then(function (criticalCssHtml) {
      fs.writeFileSync(destFilename, criticalCssHtml);

      log.log('Generated critical CSS for', htmlFile);

      return;
    })
    .catch(function(error) {
      log.error('Unable to inline critical CSS for', htmlFile);
      log.error(error);
    });
  }

  return criticalPromise.then(function (criticalCss) {
    var contents = fs.readFileSync(destFilename);
    var toReplace = new RegExp(options.htmlTagToReplace);
    var replacement = options.replacementHtmlHeader + criticalCss + options.replacementHtmlTrailer;
    var STRING_IS_NOT_PRESENT = -1;

    if (!toReplace.test(replacement)) {
      log.warn('The HTML tag hexo-critical-css is replacing is not put back by the replacement');
    }

    if (criticalCss === '') {
      log.warn('critical did not return any CSS. hexo-critical-css will not inject an empty style string into the file', htmlFile);
      return;
    }

    if (toReplace.test(contents)) {
      if (contents.indexOf(replacement) === STRING_IS_NOT_PRESENT) {

        contents = contents.replace(toReplace, replacement);

        fs.writeFileSync(destFilename, contents);

        log.log('Generated critical CSS for', htmlFile);

        return;
      }
      log.log('critical CSS was already present in the file', htmlFile);

      return;
    }

    log.error('The HTML expression hexo-critical-css is attempting to replace is not present in the HTML for file', htmlFile, ': the match was', options.htmlTagToReplace);

    return;
  })
  .catch(function(error) {
    log.error('Unable to generate critical CSS for', htmlFile);
    log.error(error);
  });
}

/**
 * Apply the Critical CSS onto the top of each of the HTML files.
 *
 * @return {Promise} the work to ensure that the Critical CSS is applied
 *                   to each HTML file.
 *
 * @todo when converting to be a proper class, "var notSkipRenderFiles" should be made to look like "var htmlFiles".
 */
function CriticalCssWorker() {
  var log = this.log;
  var options = this.config.criticalcss;
  var publicDir = this.public_dir;
  var renderer = this.extend.renderer;
  var skipRenderPatterns = this.config.skip_render;

  if (!options.enable) {
    return Promise.all([]);
  }

  return fs.exists(publicDir).then(function (exist) {
    if (!exist) {
      log.error('public directory does not exist');
      return;
    }

    var files = fs.listDirSync(publicDir);
    var notSkipRenderFiles = files.filter(function(file) {
      return filterFiles(file, skipRenderPatterns);
    });
    var htmlFiles = notSkipRenderFiles.filter(isHtmlFile);

    return new Promise(function(resolve, reject) {
      var initialPromiseQueue = Promise.resolve();

      htmlFiles.reduce(function(promiseQueue, htmlFile) {
        return promiseQueue.then(function() {
          return applyCriticalToFile(publicDir, htmlFile, options, log);
        });
      }, initialPromiseQueue).then(function() {
        resolve();
      });
    }).then(function(resolvedPromises) {
      log.log('Finished including all critical css into the html files');
      return resolvedPromises;
    });
  });
}

/**
 * If this is called, then we need to register the worker to run critical
 * on the HTML files.
 *
 * @param {string} htmlContent the content of the HTML file. This is
 *                             defined by hexo.
 * @param {object} data information about the theme file that caused this
 *                      to render.  This is defined by hexo.
 *
 * @return {string} the content with replacements.  This is defined
 *                  by hexo.
 *
 * @todo this would be better to replace in line, but I couldn't
 *       get a promise to return and hexo resolve it before inserting
 *       it, so the toString was erroneous.  This is likely to be my
 *       short-comming, and so I am keeping the interface as it should
 *       be and using this to register a before_exit filter.
 */
function CriticalCss(htmlContent, data) {
  if (needWorker) {
    needWorker = false;

    this.extend.filter.register(
      'before_exit',
      CriticalCssWorker
    );
  }

  return htmlContent;
}

module.exports = {
    CriticalCss: CriticalCss
};
