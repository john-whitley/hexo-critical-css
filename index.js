'use strict';

var assign = require('object-assign');
var CriticalCss = require('./lib/critical-css.js');

hexo.config.criticalcss = assign({}, hexo.config.criticalcss);

hexo.config.criticalcss.critical = assign({
  minify: true,
  ignore: ['@font-face'],
  width: 1300,
  height: 900
}, hexo.config.criticalcss.critical);

hexo.config.criticalcss = assign({
  enable   : true,
  priority : 10000,
  htmlTagToReplace : '<\\/\\s*head>',
  replacementHtmlHeader : '<style type="text/css">',
  replacementHtmlTrailer : '</style></head>',
}, hexo.config.criticalcss);

hexo.extend.filter.register(
  'after_render:html',
  CriticalCss.CriticalCss,
  hexo.config.criticalcss.priority,
  false
);
