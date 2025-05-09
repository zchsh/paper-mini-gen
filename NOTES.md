# Project Notes

## Next steps

- [ ] Revisit trace-and-offset step, to address buggy cases
  - Repro case: `sample-char-art-01-small.jpeg` with current default settings. Trace succeeds but "offset" fails. Increasing blur radius to `6`, a single point, seems to "fix" the issue, or work around it at least. Blur radius of `2` produces weird results, the trace looks right but the "offset" doesn't.
  - MAYBE there's a possibility of MERGING POINTS THAT AREA VERY CLOSE TO EACH OTHER.... For each point... if the next point is within a certain distance, then replace both points with a point at the average of the co-ordinates of the two points. When a replacement happens, move on to the next point. In theory you could run this multiple times, but not sure that'll be needed. Might be a neat algorithm to try to implement, and MAYBE it'll address the issue here.
  - 2025-04-27 at 11:44 - offset seems to fail when there are _multiple_ shapes... maybe I need to separate the shapes before proceeding with the trace? This may be more relevant than path smoothing. Blur may be fixing thing because it prevents separate shapes? Default sample icon with 30 blur radius produces this case.
  - 2025-05-09 at 10:22 - have some basic examples working at `/demo-average-redundant-points`. Might be nice to get some less basic examples working... namely, polygons with multiple regions, which will probably break things in interesting ways.

- [ ] Clean up repository a bit
  - `js-modules` could be organized a little bit, rename to `modules`, remove redundant dir
  - all `demo` and `toy` things could be consolidated into a single directory
  - create `sample-image` directory, maybe

- [ ] Consider post-trace option to "remove interior voids"
  - I've been thinking about doing _line drawings_. This would leave significant "holes", or interior shapes, within a larger main shape.
  - Could there be an option to remove these interior voids? Option to remove them completely could make sense.
  - Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour.

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
