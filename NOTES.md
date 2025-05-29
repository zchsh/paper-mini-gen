# Project Notes

## Next steps

- [x] Clean up `main.js` and that whole setup generally
  - [x] `<script>` content in `index.html` could be moved to `main.js`
  - This would remove the need for all those `window.<someFunction> = <someFunction>` assignments, then you could split out `<someFunction>.js` as a module and import it into `main.js`
  - Moving away from the numbered module directories probably makes sense... it feels close though, seems like it's more useful to organize purely by functionality (`parse`, `render`, `trace`, `polygon-manipulation` which is where clipper stuff could live)
  - [x] Clean up `silhouetteExecute` in `main.js`
  - 2025-05-19 at 15:01 - starting to clean this up... feeling a little better already. Lots to learn!
  - [x] Split out `traceExecute` and `cleanupTrace`
    - [x] Get out of `main.js` and into separate modules
  - [x] Split out `renderAppliedOffset` and `applyOffsetV2` (latter could be renamed)
  - [x] Split out `arrangeForUnion`
  - [x] Split out `unionPolygonObjects`
  - [x] Split out `applyUnion`
  - [x] Split out `applyLayout`
  - [x] Split out `buildSvgNode`

- [x] Split out `flatten-image.js`
- [x] Split out `resize-image.js`

- [x] Refactor `traceImage` to accept image data, and yield polygon data
  - [x] Experiment with refactoring the tracing part, namely `imagedataToTracedata`
    - Need to construct `ImageData`... see <https://developer.mozilla.org/en-US/docs/Web/API/ImageData/ImageData#dataarray> maybe?
    - `jimpImage.bitmap.data` is a `Buffer` or raw image data...
    - can turn that `Buffer` into Unit8ClampedArray... see <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8ClampedArray/Uint8ClampedArray>
  - [x] Experiment with refactoring the `flattenSvg` part
  - 2025-05-22 at 15:54 - experimentation in progress in `trace-image-data.js`. Seems promising so far.
  - 2025-05-24 at 16:03 - working in `flatten-path-data-strings.js`
  - 2025-05-24 at 16:57 - have swapped in the new tracing flow, still lots of cleanup work to do. For example, need to clean up now-unused files... and might be a nice time to move files that are being used into the new directory structure.
  - 2025-05-24 at 18:36 - continue to clean up `flatten-path-data-strings.js`, specifically working on `polygonsFromFlattenedPaths`

- [x] Clean up `arrange-for-union.js`
  - First define what you want the function signature to be... return `polygons` probably?

- [x] Clean up `apply-union`

- [x] Try swapping an `apply-union` function that uses `ClipperJS`
  - Started... but struggling with proper intersection, currently inverted
  - How are the `subj` vs `objs` clips supposed to work... maybe they can all be `subj`?
  - Maybe this is a "fillType" thing?
  - <https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperexecute>
  - Working in `clipperjs-wrappers/apply-union.js`

- [ ] Clean up `apply-layout`
  - Return value should be SVG string maybe? Haven't thought about it much.

- [ ] Think through new tool layout and workflow
  - Maybe worth doing in Figma? Sketching on paper, as always, probably a nice place to start

- [ ] Clean up `imagetracejs-remixes`
  - I'm not concerned about this for now, cause it's working fine for my purposes... if I had to worry about abstracting all the cases in which it'd probably break, that'd be another story, but for now I think I can just not care.

### Later

#### Replace example images with NOT random art ripped from the internet

- [ ] Replace example images with NOT random art ripped from the internet
  - It's been fine and has felt okay during development, but doesn't feel right if I'm going to share this tool at all
  - Original art might be fun, alternately, look up creative commons or public domain work and attribute it
  - Steamboat Willie's in the public domain, that'd be fun, and call attention to public domain stuff which i love

#### Reconsider offset ordering for better consistency

- [ ] Reconsider offset ordering for better consistency
  - Currently I think it's, offset first, scale after?
  - Maybe it should be... scale first, then offset?
  - Cause as is... a "tall" piece of art will get scaled down less, and the offset therefore looks thicker... where a "short" piece of art gets scaled down a lot, and the offset gets scaled down as well, and thus looks thinner
  - This would be a relatively significant refactor, so seems to make sense to clean things up first.

#### Explore path smoothing after boolean addition

- [ ] Explore path smoothing after boolean addition
  - Currently, scissors-based cutout is kinda not realistic with the actual path
  - Would be nice to be able to smooth out... not sure how to do this while ensuring offset? Maybe there's some kind of algorithm that ensures the area doesn't decrease? Like a kind of 2D shrink-wrap?
  - <https://www.smoothsvg.com/> is a starting point
    - this was the first search result, could probably dive deeper
  - also this: <https://stackoverflow.com/a/28722732>
  - Want it to be easy to cut out the shapes
  - Path smoothing of some kind might help with that
  - 2025-04-13 at 18:05 - stubbedin `demo-smooth-to-polyline`
  - 2025-05-10 at 10:27 - there's a Figma plugin for this that might be worth trying: <https://www.figma.com/community/plugin/809139536998662893/simplify>. Might make sense to set up "Copy SVG" at every step for debug purposes... then you can test the smoothing process in Figma, see if it works, and if it does and the plugin is licensed appropriately, swipe the code and integrate it here.
  - 2025-05-13 at 09:41 - <https://mourner.github.io/simplify-js/> looks perfect

### Look into bug with voids in inverted shape

- [ ] Look into bug with voids in inverted shape
  - See `notes/2025-05-17-invert-issue-in-dnd-mini-tool.png`
  - Doesn't seem to be consistent, and not that big a deal anyways
  - Might make more sense to elimited voids in the final output anyways, pretty sure very few people will wanna go in there with an X-Acto knife... though for bigger pieces of art maybe? Debatable. In any case the maybe-bug doesn't seem that big a deal relative to other cleanup work.

#### Consider post-trace option to "remove interior voids"
  
- I've been thinking about doing _line drawings_. This would leave significant "holes", or interior shapes, within a larger main shape.
- Could there be an option to remove these interior voids? Option to remove them completely could make sense.
- Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour
- Possible first cut option... a given polygon is made up of many REGIONS. Group the regions of a given polygon based on whether they overlap - any overlapping regions should be placed in a single group. Determining overlap might be done with a "minowski diff"? <https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperminkowskidiff>. In longer form, running an intersection of the two regions, and then determining whether the intersection has a surface area greater than zero might be another option. Once you have a group of overlapping regions, then determine the surface area of each region, with <https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsareaofpolygon>. Finally, sort by surface area, and keep only the region with the largest surface area.

#### Support "backside" images

- Requires more art, but really adds something I think, and could maybe encourage hand-drawing over AI tool use, eg see <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Totally optional
- Art has to kind of match up from front to back in terms of shape... cutout from front would always be used.

#### Consider use of imagetracer's imagedataToTracedata API

- <https://github.com/jankovicsandras/imagetracerjs?tab=readme-ov-file#api>
- May remove need for roundtrip through `<svg>` element, which I think is currently being done?
- As with other steps... data transformation happens outside the DOM, rendering to DOM is a convenience that happens in the browser

#### Consider alternate approach to offsetting shapes

As-is, traced polygons are centered with "offset" based on their bounding box... which kind of works, but feels like it could be better.

What if you found the "center of mass" of the incoming polygon, and used that as a "base" offset? The input offset could be applied on top of that "base" offset.

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
