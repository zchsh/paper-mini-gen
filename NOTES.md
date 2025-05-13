# Project Notes

## Next steps

- [x] Clean up `public/demo/debug-offset-step` for re-use
  - [x] Draft description and JSDoc for `public/demo/debug-offset-step/simplify-regions.js`
  - [x] Draft description and JSDoc for `public/demo/debug-offset-step/apply-offset-to-regions.js`
  - [x] Draft description and JSDoc for `public/demo/debug-offset-step/regions-from-path-data-string.js`
  - [x] In `public/demo/debug-offset-step/simplify-regions.js`, consider using Clipper's `CleanPolygons`
  - [x] In `public/demo/debug-offset-step`, investigate why `CleanRegions` doesn't seem to work _after_ offset
  - 2025-05-13 at 17:23 - pretty happy with the clean-up results here! Heck, pretty sure I can use ClipperJS for the Union part of things too... something to look into soon, I think, would be nice to cut down the wide spread libraries I've explored in my desperate state of ignorance.

- [ ] Do a little more organizing in `public/demo/debug-offset-step`
  - The "step folders" approach to module organization in the main tool is already showing signs of not being a great long-term solution
  - With `debug-offset-step`, it feels like there are a few distinct categories: parse SVG path data to regions, render regions to SVG nodes (including all the neat debug visuals on point location and winding order), and the ClipperJS stuff, namely `simplify-regions`, `clean-regions`, and `apply-offset-to-regions`.
  - With the above in mind... maybe make a few new folders within `modules`? `parse`, for parsing SVG path data, `render`, for rendering regions to SVG nodes, and `clipper-wrappers`, for the functions I've written that kinda just wrap ClipperJS.

- [ ] Try re-using `public/demo/debug-offset-step` in main tool
  - Uses [ClipperJS](https://sourceforge.net/p/jsclipper/wiki/documentation/) rather than [svg-path-outline](https://github.com/danmarshall/svg-path-outline)

### Later

#### Support transparent images

- one approach is make a threshold mask based on the alpha channel, then apply that mask
- eg <https://github.com/image-js/image-js?tab=readme-ov-file#paint-a-mask>
- tried before with `sample-taxi-transparent.png`, in `demo-image-js`
- may be worth exploring alternatives to `image-js`... (?)

#### Support "backside" images

- Requires more art, but really adds something I think, and could maybe encourage hand-drawing over AI tool use, eg see <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Totally optional
- Art has to kind of match up from front to back in terms of shape... cutout from front would always be used.

#### Consider post-trace option to "remove interior voids"
  
- I've been thinking about doing _line drawings_. This would leave significant "holes", or interior shapes, within a larger main shape.
- Could there be an option to remove these interior voids? Option to remove them completely could make sense.
- Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour

#### Consider use of imagetracer's imagedataToTracedata API

- <https://github.com/jankovicsandras/imagetracerjs?tab=readme-ov-file#api>
- May remove need for roundtrip through `<svg>` element, which I think is currently being done?
- As with other steps... data transformation happens outside the DOM, rendering to DOM is a convenience that happens in the browser

#### Update image-js version

- currently on `0.37.0` ish - <https://github.com/image-js/image-js>

#### Look into performance

- Seems way worse on my M1 laptop than on M1 mac mini... why?

#### Stub in documentation

- <https://documentation.js.org/>

#### Improve curved-to-straight-line conversion

- Current algorithm grabs all the points, no nuance between the points of an arc
- Maybe ideal scenario: same as now, but for any curved _segments_, convert to straight lines based on some _angle tolerance_
  - This same "angle tolerance" principle is what i want for `create-circular-polygon` as well....

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
