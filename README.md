# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

Next step is to keep working on `js-modules` setup.

- [x] Add `03-trace` step to `js-modules` setup
  - Takes the silhouette image as input
  - Note that previous `ImageTracer` step seems to yield an SVG string... gonna leave that for now
  - Docs on `ImageTracer` for later: <https://github.com/jankovicsandras/imagetracerjs>
  - This step should yield a set of regions compatible with `<polygon />` shapes

- [x] Add `04-offset` step to `js-modules` setup
  - Takes the traced silhouette as input
  - In this step, the traced polygon(s) should have their paths offset
  - `toy-offset-and-addition` contains the latest bits of work on the offset front (ignore the addition part)
  - The offset tool I'm using yields paths with curves... these need to be flattened
  - `demo-flatten-svg` was my latest bit of work and exploration on the flattening front
  - This step should yield a set of regions compatible with `<polygon />` shapes

- [x] Write a function to visit points, and do something to do those points
  - Could try translate first?

- [x] Write (or find) a function to flip a set of x,y points vertically (ie on the horizontal axis)
  - Maybe looking at <https://g.js.org/ref/mirror.html> could be good?
  - Could also look into <https://maker.js.org/docs/intermediate-drawing/>. Already used for offset. Has mirror function... so maybe that's a good way to go?
  - Probably makes sense to start by stubbing `demo-vertical-mirror`
  - 2025-04-17 at 22:16 - meh, already have an approach here I think... if I think about this as "reflect a single point about some line", that seems more feasible to DIY. and that "line" can be the horizontal line that passes through the bottom-most point (max Y i think?) of the polygon itself (or, could be centre point?)
  - Example algorithm: <https://www.mathwarehouse.com/transformations/reflections-in-math.php>
  - Note: for _winding order_, may need to _reverse points_ after the flip is done

- [ ] Add `05-arrange` step to `js-modules` setup
  - Takes the offset silhouette polygons as input
  - Should add three circular polygons, for the base and stuff
  - See `lib/create-circular-polygon.js`. Convert to module!
  - Two of your boolean-offset polygons, one of the flipped vertically
  - This step should yield a set of regions compatible with `<polygon />` shapes
  - 2025-04-25 - implemented scaling!
  - 2025-04-25 - implemented xy tweaks

- [ ] Add `06-union` step to `js-modules` setup
  - Takes the arranges polygon-compatible shapes as input
  - Executes a boolean addition on all the input shapes
  - This step should yield a set of regions compatible with `<polygon />` shapes
  - This step yields the outline of the paper mini (ideally one shape, may be more than one)
    - Could grab the largest area shape? Meh, many shapes is fine. Can use small feature filter at `trace` stage.

- [ ] Add `07-layout` step to `js-modules` setup
  - Takes the set of points for the outline of the paper mini as input
  - Renders those points into an SVG (note, may have cutout regions, will use `<path />`)
  - Embeds the original image into the SVG, at the correct position (and z-index!)
  - This step should yield SVG artwork

- [ ] Add `08-export` step to `js-modules` setup
  - Allow copying the final SVG to the clipboard (paste into Figma!)

### Later

#### Look into performance

- Seems way worse on my M1 laptop than on M1 mac mini... why?

#### Support transparent images

- one approach is make a threshold mask based on the alpha channel, then apply that mask
- eg <https://github.com/image-js/image-js?tab=readme-ov-file#paint-a-mask>
- tried before with `sample-taxi-transparent.png`, in `demo-image-js`
- may be worth exploring alternatives to `image-js`... (?)

#### Update image-js version

- currently on `0.37.0` ish - <https://github.com/image-js/image-js>

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
