# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

Next step is to make some final-layout-related steps _after_ the current boolean addition

- [ ] Convert the boolean-added shape to a polygon
  - We'll need to boolean-add it again, so needs to be a polygon
  - Is it already a polygon? Maybe this is already done?
- [ ] Write (or find) a function to create x,y points for a circular polygon, `n` number of sides
  - Good candidate for tests etc
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

#### Explore image masking

- [ ] Would be nice to be able to mask image
  - Doing this in the `<svg>`-approved way probably makes sense
  - Use the offset mask, I think, same outline as what'll get cut out

#### Explore path smoothing AFTER boolean addition

- [ ] Explore path smoothing, so scissors-based cutout is easier
  - <https://www.smoothsvg.com/> is a starting point
    - this was the first search result, could probably dive deeper
  - also this: <https://stackoverflow.com/a/28722732>
  - Want it to be easy to cut out the shapes
  - Path smoothing of some kind might help with that

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
