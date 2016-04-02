'use strict';

var assign = require('object-assign');
var CriticalCss = require('./lib/critical-css.js');

hexo.config.criticalcss = assign({
  enable   : true,
  priority : 10000,
}, hexo.config.criticalcss);

hexo.extend.filter.register(
  'after_render:html',
  CriticalCss.CriticalCss,
  hexo.config.criticalcss.priority,
  false
);
