# rtc-plugin-nicta-ios

This is a plugin for bridging the functionality provided by a NICTA iOS webkit plugin.
While this plugin integration layer is provided opensource, the iOS plugin itself is
part of http://build.rtc.io/.


[![NPM](https://nodei.co/npm/rtc-plugin-nicta-ios.png)](https://nodei.co/npm/rtc-plugin-nicta-ios/)

[![unstable](https://img.shields.io/badge/stability-unstable-yellowgreen.svg)](https://github.com/dominictarr/stability#unstable) 

## Getting More Information

If you are after more information regarding the plugin feel free to
reach out to either of the following people, and we will do our best
to answer your questions:

- Damon Oehlman <damon.oehlman@nicta.com.au>
- Silvia Pfeiffer <silvia.pfeiffer@nicta.com.au>

### supported(platform) => Boolean

The supported function returns true if the platform (as detected using
`rtc-core/detect`) is compatible with the plugin. By doing this prelimenary
detection you can specify a number of plugins to be loaded but only
the first the is supported on the current platform will be used.

### init(callback)

The `init` function is reponsible for ensuring that the current HTML
document is prepared correctly.

### attachStream(stream, bindings)

### prepareElement(opts, element) => HTMLElement

The `prepareElement` function is used to prepare the video container
for receiving a video stream.  If the plugin is able to work with
standard `<video>` and `<audio>` elements then a plugin should simply
not implement this function.

## License(s)

### Apache 2.0

Copyright 2014 National ICT Australia Limited (NICTA)

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
