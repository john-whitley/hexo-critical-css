# Hexo Critical CSS

A Hexo wrapper filter for [critical](https://github.com/addyosmani/critical#readme).

## Installation

```Shell
npm install --save hexo-critical-css
```

## Motivation

Speed up the initial load of your hexo website.

Ensure critical parts of your CSS are within the HTML page, and then
load your full CSS file in a defered manner.

## Configuration
* [critical](#critical)
* [htmlTagToReplace](#htmltagtoreplace)
* [priority](#priority)
* [replacementHtmlHeader](#replacementhtmlheader)
* [replacementHtmlTrailer](#replacementhtmltrailer)

### critical
#### Purpose
The options object that would be given to `critical.generate`
#### Type
object, the options that are defined by
[critical](https://github.com/addyosmani/critical#options).

**NOTE** hexo-critical-css stripes the option `dest`, because
hexo-critical-css library cannot cope with dest (yet).

This is mostly a pass-through so we limit the coupling that this library
and critical has, so critical options can change with minimal impact
on hexo-critical-css.
#### See also
* [critical generate](https://github.com/addyosmani/critical#options)

#### Example
Add this rule in `_config.yml` to ensure critical minify options is set.
```YAML
criticalcss:
  critical:
    minify: true
```

### htmlTagToReplace
#### Purpose
The expression used to search the HTML document for a token or HTML tag to inject the critical CSS into
#### Type
regular expression string, suitable to be passed into `new RegExp(htmlTagToReplace)`.
#### See also
* [replacementHtmlHeader](#replacementhtmlheader)
* [replacementHtmlTrailer](#replacementhtmltrailer)

#### Example
Add this rule in `_config.yml` to match the closing `</head>` of the HTML file.
```YAML
criticalcss:
  htmlTagToReplace: "</\\s*head>"
```

### priority
#### Purpose
Allows hexo-critical-css to be run in a different order in regards to other filters.
#### Type
integer
#### See also
[https://hexo.io/api/filter.html](https://hexo.io/api/filter.html)

#### Example
Add this rule in `_config.yml` to adjust the priority
```YAML
criticalcss:
  priority: 10000
```

### replacementHtmlHeader
#### Purpose
When injecting the critical CSS into the HTML document, it may be useful to have a prefix.
#### Type
string, which the critical CSS will be prefixed with
#### See also
* [htmlTagToReplace](#htmltagtoreplace)
* [replacementHtmlTrailer](#replacementhtmltrailer)

#### Example
Add this rule in `_config.yml` to prepend the critical CSS output with.
```YAML
criticalcss:
  replacementHtmlHeader: "<style type=\"text/css\">"
```

### replacementHtmlTrailer
#### Purpose
When injecting the critical CSS into the HTML document, it may be useful to have a suffix.
#### Type
string, which the critical CSS will be suffixed with
#### See also
* [htmlTagToReplace](#htmlTagToReplace)
* [replacementHtmlHeader](#replacementHtmlHeader)

#### Example
Add this rule in `_config.yml` to postpend the critical CSS output with.
```YAML
criticalcss:
  replacementHtmlTrailer: "</style></head>"
```

## TODO

This was written very quickly as I needed it for another project I
am undertaking.  This means that I have work still to do.  At least:

* Find a way to allow [critical](https://github.com/addyosmani/critical#options) `dest` option to be passed through.
* Create an enable/disable config option.
* Provide coding style guides
* Move to an ECMA6 structure for future-proofing
* Add babel as a pre-publish step to ensure current compatibility
* Add example of best way to implement CSS in a theme

## License

Copyright (c) 2016, John Whitley
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of hexo-critical-css nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
