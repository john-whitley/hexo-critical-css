# Change log

## 1.0.3
### Added
* configuration to allow enable/disable hexo-critical-css plugin

### Amended
* fixed intra-README links for the replacementHtmlTrailer configuration section

## 1.0.3
### Amended
* fixed calling `hexo generate` repeated times, critical being injected repeated times

## 1.0.2
### Added
* configuration to pass [critical generate](https://github.com/addyosmani/critical#options) options through to critical
* missing dependency, `object-assign`

### Amended
* fixed the github intra-README links - I had not appreciated that anchor links were always lowercase
* fixed a missing @param in README
* updated the TODO list in README to reflect the next work package created by having to delete `dest` critical option.

## 1.0.1
### Added
* configuration to allow the pattern being looked for within the HTML to inject the critical CSS to be controlled via a config setting
* configuration to release control of how the Critical CSS will be framed when being injected.
* improved the documentation to describe configuration

### Amended
* installation instructions in README.md are now Shell highlighted

## 1.0.0
Initial working version of hexo-critical-css.
