'use strict';

/*
 * Include the necessary libraries
 */
var Critical = require('critical');
var fs = require('hexo-fs');
var pathFn = require('path');

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
 * Apply Critical to one file.  To ensure that the Critical is placed
 * in the head regardless of where the css is called (hopefully the end
 * of the HTML) the Critical is generated, then the </head> is prefixed
 * with the Critical CSS.
 *
 * @param {string} publicDir the hexo public directory
 * @param {string} htmlFile the HTML file
 * @param {bunyan} log the bunyan.createLogger instance given to use
 *                 by hexo.
 *
 * @return {Promise} the work to generate Critical on this file
 */
function applyCriticalToFile(publicDir, htmlFile, options, log) {
  var destFilename = publicDir + '/' + htmlFile;
  var criticalPromise = Critical.generate({
    minify: true,
    base: publicDir,
    src: htmlFile,
    ignore: ['@font-face'],
    width: 1300,
    height: 900
  }).then(function(criticalCss) {
    var contents = fs.readFileSync(destFilename);
    var toReplace = new RegExp(options.htmlTagToReplace);
    var replacement = options.replacementHtmlHeader + criticalCss + options.replacementHtmlTrailer;

    if (!toReplace.test(replacement)) {
      log.warn('The HTML tag hexo-critical-css is replacing is not put back by the replacement');
    }

    if (toReplace.test(contents)) {
      contents = contents.replace(toReplace, replacement);

      fs.writeFileSync(destFilename, contents);

      log.log('Generated critical CSS for', htmlFile);

      return;
    }

    log.error('The HTML expression hexo-critical-css is attempting to replace is not present in the HTML for file', htmlFile, ': the match was', options.htmlTagToReplace);

    return;
  });

  return criticalPromise;
}

/**
 * Apply the Critical CSS onto the top of each of the HTML files.
 *
 * @return {Promise} the work to ensure that the Critical CSS is applied
 *                   to each HTML file.
 */
function CriticalCssWorker() {
  var log = this.log;
  var options = this.config.criticalcss;
  var publicDir = this.public_dir;
  var renderer = this.extend.renderer;

  return fs.exists(publicDir).then(function (exist) {
    if (!exist) {
      log.error('public directory does not exist');
      return;
    }

    var files = fs.listDirSync(publicDir);
    var htmlFiles = files.filter(isHtmlFile);

    var promises = [];

    htmlFiles.forEach(function(htmlFile) {
      var criticalPromise = applyCriticalToFile(publicDir, htmlFile, options, log);

      promises.push(criticalPromise);
    });

    return Promise.all(htmlFiles);
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