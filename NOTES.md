# Project Notes

## Next steps

- [x] Clean up repository a bit
  - [x] `js-modules` could be organized a little bit, rename to `modules`, remove redundant dir
  - [x] create `sample-art` directory
  - [x] all `demo` and `toy` things could be consolidated into a single `demo` directory
  - 2025-05-10 at 16:53 - currently working on trying to clean up `applyOffset`

- [ ] Revisit offset step, to address buggy "offset" cases
  - To reproduce, pick any example, reset blur to `1`, and step up through the blur values. Every example seems to have at least a couple points where the trace step is fine but the "offset" step fails.
  - Polygons with simple straight segments only, with no weird clustered points, are coming out of the trace step. Why is the union step failing sometimes?
  - 2025-05-10 at 17:29 - Maybe Clipper would be a good fit: <https://sourceforge.net/p/jsclipper/wiki/Home%206/>. Probably worth making a separate demo page... but, that can come later. For now, continue cleanup!
  - 2025-05-11 at 12:55 - maybe this has more to do with weird "winding order" hacks... i don't feel i had a great handle on all of that. Might be a bit of an "exercise", but for each "region" could be neat to render _arrows_ at each point, pointing towards the "next" point in the array... this way, could visualize winding order. Then could set up some test cases with different holes and stuff. I feel like that _might_ have an impact on the boolean addition issue... i have a feeling something like that was happening with the `/demo/demo-boolean-operations` test... see also `/demo/demo-bool-ops-01` and `/demo/demo-bool-ops-02`, which both use `polybool` rather than `clipper`...
  - 2025-05-11 at 13:06 - vaguely related, neat comparison of polygon boolean operation algorithms: <https://daef.github.io/poly-bool-comparison/>
  - 2025-05-11 at 13:12 - might be worth taking the traced SVGs that are failing to offset, copying them from the browser, and running in some local test cases. Started in `/demo/debug-offset-step/post-trace-fixtures`. Note that different `offset` values seem to affect the success of the operation a _lot_... so it does seem worth doing a side-by-side demo of different "offset outline" libraries.
  - 2025-05-11 at 13:35 - starting points for trying out ClipperJS - [ClipperOffset](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperoffset), but first ensure no self-intersections, maybe with a union operation in Clipper? [SimplifyPolygon](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclippersimplifypolygon). And see also [Strictly Simple Polygons](https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperstrictlysimple), maybe that should be applied right after tracing?

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
- Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour.

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
