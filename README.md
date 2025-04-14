# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

Next step is to make some final-layout-related steps _after_ the current boolean addition

- [x] Write (or find) a function to create x,y points for a circular polygon, `n` number of sides
  - Good candidate for tests etc
  - 2025-04-11 at 17:17 - got the `toy-circular-polygon.html` file prototyped in, which uses `createCircularPolygon`

- [x] Consider writing new function `render-polygon-as-svg.js`
  - Existing function `render-polygon-as-path-svg.js` renders `<path />` elements... we want to stick to polygons though?
  - In general... seems like it'd be nice to get to `<polygon />` compatible lists of points at some point early in the process... and then use `render-polygon-as-svg.js` as an _optional_ way to preview the data that's been created.
  - Once this is done... could in theory start declaring actual consts, eg `polygonsTracedImage = ...`, and not have to write-into and read-from `<svg />` elements as is currently being done.
  - 2025-04-11 at 17:29 - started in `render-polygon-points-string.js`
  - 2025-04-11 at 17:39 - wait, unions could result in multiple closed shapes... but `<polygon />` can represent only a single closed shape, I think? I do need to worry about fill, and winding order... so rendering to `<path />` rather than `<polygon />` is not only _fine_, it's _necessary_.
  - 2025-04-11 at 17:56 - Instead of worrying about what I'm _rendering_, I should just worry about the data format that'll be used throughout the process after the initial trace-and-polygonize. I think the `polygon` object format makes sense, where `polygon` is an array of `region` entries, and a `region` entry is an array of points. Exterior rings (filled shapes) and interior rings (holes) are distinguished by the clockwise-ness of their points. Exterior rings are counterclockwise, and interior rings are clockwise ([ref](https://datatracker.ietf.org/doc/html/rfc7946#section-3.1.6))

- [x] Write toy file for copying `<svg />`
- [x] Write toy file for copying `<svg />` with embedded image
  - 2025-04-12 at 10:28 - took a bit of finagling, but have a manually copied in, hard-coded base64 dataUrl working! Still wanna get the `toy-copy-svg-with-embed.html` file set up so that it grabs the image source from the `#image-preview` `<img />` element's `src` property.
  - 2025-04-12 at 11:02 - got this working with image upload

- [x] Continue work on `demo-image-js` file
  - In particular, finish implementing `get-fallback-threshold`
  - Add image upload to this demo
  - Immediately after an image is uploaded, start with new "fallback threshold"
  - Set that "fallback threshold" in a number input. User can then adjust that input & re-render

- [ ] Covert `cleanupTrace()` workflow so `<svg />` is a "render" step, not a pass-the-data step
  - Note that previous `ImageTracer` step seems to yield an SVG string... gonna leave that for now
  - Docs on `ImageTracer` for later: <https://github.com/jankovicsandras/imagetracerjs>

- [ ] Review full workflow so that `<svg />` is a "render" step, not a middleman step
  - First step that generates `polygon` data should store it in a `const`
  - Subsequent steps should read from the previous step's `const`
  - The use of `<svg />` elements should be a "render" or "preview" step not necessary for the whole page to work

- [ ] Write (or find) a function to flip a set of x,y points vertically (ie on the horizontal axis)
- [ ] Create a new SVG with all your polygons to add
  - Three circular polygons, for the base and stuff
  - Two of your boolean-offset polygons, one of the flipped vertically
- [ ] Run the boolean union on the above SVG
- [ ] Test copy-to-clipboard of new SVG
- [ ] Try embedding an image into a random spot in the new SVG
- [ ] Test copy-to-clipboard of new SVG with image
- [ ] Try embedding the correct image into a random spot in the new SVG
- [ ] Try embedding the correct image into the correct spot in the new SVG

### Later

#### Use JavaScript modules

- <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules>

#### Stub in documentation

- <https://documentation.js.org/>

#### Improve curved-to-straight-line conversion

- Current algorithm grabs all the points, no nuance between the points of an arc
- Maybe ideal scenario: same as now, but for any curved _segments_, convert to straight lines based on some _angle tolerance_
  - This same "angle tolerance" principle is what i want for `create-circular-polygon` as well....

#### Explore image masking

- [ ] Would be nice to be able to mask image
  - Doing this in the `<svg>`-approved way probably makes sense
  - Use the offset mask, I think, same outline as what'll get cut out

#### Explore path smoothing after boolean addition

- [ ] Explore path smoothing, so scissors-based cutout is easier
  - <https://www.smoothsvg.com/> is a starting point
    - this was the first search result, could probably dive deeper
  - also this: <https://stackoverflow.com/a/28722732>
  - Want it to be easy to cut out the shapes
  - Path smoothing of some kind might help with that
  - 2025-04-13 at 18:05 - stubbedin `demo-smooth-to-polyline`

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
