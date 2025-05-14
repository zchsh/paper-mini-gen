# Project Notes

## Next steps

- [x] Work on a demo tool to support transparent images
  - [x] Create a new `demo/demo-image-js-handle-png`
  - [x] Copy over work from `demo-image-js`
  - [x] Add second example with identical image, but it's a transparent PNG
  - One approach is make a threshold mask based on the alpha channel, then apply that mask
  - 2025-05-13 at 21:06 - next step is probably to grab a newer version of ImageJS... which one has the best documentation? 0.37.0 is latest... Pretty sure I'm currently using <https://www.lactame.com/lib/image-js/0.21.2/image.min.js>. There's a directory listing at <https://www.lactame.com/lib/image-js/>. Docs for 0.37.0 are at <https://image-js.github.io/image-js/>.
  - 2025-05-14 at 07:43 - swapped in new version, currently working on <http://localhost:3000/demo/demo-image-js-handle-png>
  - 2025-05-14 at 14:00 - really getting there with `Jimp`!
  - [x] Draft description for `create-silhouette.js`
  - [x] Try cleaning up `demo/demo-jimp`, to prep for re-use in main
  - 2025-05-14 at 14:26 - done! I think `Jimp` is gonna work well. I dig that it could run in Node too.

- [ ] Try porting over `create-silhouette.js` with `Jimp` to main tool
  - Grab your work from `demo/demo-jimp`

- [ ] Clean up `main.js` and that whole setup generally
  - `<script>` content in `index.html` could be moved to `main.js`
  - This would remove the need for all those `window.<someFunction> = <someFunction>` assignments, then you could split out `<someFunction>.js` as a module and import it into `main.js`
  - Moving away from the numbered module directories probably makes sense... it feels close though, seems like it's more useful to organize purely by functionality (`parse`, `render`, `trace`, `polygon-manipulation` which is where clipper stuff could live)

### Later

#### Consider post-trace option to "remove interior voids"
  
- I've been thinking about doing _line drawings_. This would leave significant "holes", or interior shapes, within a larger main shape.
- Could there be an option to remove these interior voids? Option to remove them completely could make sense.
- Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour

#### Explore path smoothing after boolean addition

- [ ] Explore path smoothing, so scissors-based cutout is easier
  - <https://www.smoothsvg.com/> is a starting point
    - this was the first search result, could probably dive deeper
  - also this: <https://stackoverflow.com/a/28722732>
  - Want it to be easy to cut out the shapes
  - Path smoothing of some kind might help with that
  - 2025-04-13 at 18:05 - stubbedin `demo-smooth-to-polyline`
  - 2025-05-10 at 10:27 - there's a Figma plugin for this that might be worth trying: <https://www.figma.com/community/plugin/809139536998662893/simplify>. Might make sense to set up "Copy SVG" at every step for debug purposes... then you can test the smoothing process in Figma, see if it works, and if it does and the plugin is licensed appropriately, swipe the code and integrate it here.
  - 2025-05-13 at 09:41 - <https://mourner.github.io/simplify-js/> looks perfect

#### Support "backside" images

- Requires more art, but really adds something I think, and could maybe encourage hand-drawing over AI tool use, eg see <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Totally optional
- Art has to kind of match up from front to back in terms of shape... cutout from front would always be used.

#### Consider use of imagetracer's imagedataToTracedata API

- <https://github.com/jankovicsandras/imagetracerjs?tab=readme-ov-file#api>
- May remove need for roundtrip through `<svg>` element, which I think is currently being done?
- As with other steps... data transformation happens outside the DOM, rendering to DOM is a convenience that happens in the browser

#### Look into performance

- Seems way worse on my M1 laptop than on M1 mac mini... why?

#### Stub in documentation

- <https://documentation.js.org/>

#### Improve curved-to-straight-line conversion

- Current algorithm grabs all the points, no nuance between the points of an arc
- Maybe ideal scenario: same as now, but for any curved _segments_, convert to straight lines based on some _angle tolerance_
  - This same "angle tolerance" principle is what i want for `create-circular-polygon` as well....

#### Revisit image processing

- [ ] Revisit image processing for speed & path simplicity
  - Currently image processing is the slowest part of the whole thing
  - In addition, I've noticed the traced paths are pretty complex for large images. More complex than they need to be.
  - Could the image be scaled down by a certain factor (say, `2`), and then processed and traced, and then the resulting path scaled back up?
  - Would such a scale-trace-revertscale approach be faster? And would it produce similar results

#### Final packaging

- [ ] Final packaging as a `.zip` file with an `index.html` etcetera
  - Could also build into a single `.html` file with simple `@include` style assembly, a la Mustache... self container "app" that runs in your browser, even offline! Zero external dependencies... pretty cool!
  - Could then share this with folks... creative commons etc
  - At this point, final tool exporting a single mini outline as `.svg` seems most feasible... embed the original image in the SVG as a `dataURI`
  - Stretch goal might be using `<canvas />` to render the outline `.svg` and the original image to a `.jpeg` or `.png`. Transparent-supporting `.png` in particular is interesting, as it would be nice to be able to place characters close together... but might need to use the offset-and-outlined path as a mask... Seems feasible, even if it could get a little messy!

#### Separate arrangement tool

- [ ] Consider arrangement of "results" on page...
  - maybe let them be dragged around, even rotated?
  - nah... seems to make more sense to have this as a separate tool
  - character mini generator should render to `.svg`, or to `.jpeg` or `.png`. The exported asset can then be placed and duplicated in other programs (eg Figma). If I happen to want to create an HTML-based standalone program that lets you arrange imported `.svg`, `.png`, and `.jpeg` files on a page, that might be cool. But, can be completely separate from the "paper minis" generator.

## Inspiration

- <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Printable chess could be a good spin-off
