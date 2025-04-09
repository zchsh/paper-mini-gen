# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

### Implement offset on traced path

- [x] Test path offset in "toy" file, with two simple shapes
  - Done in `toy-offset-and-addition.html`
- [ ] Clean up offset path utilities
- [ ] Add path offset step to main "index" file

### Implement boolean addition on traced and offset path

- [x] Test boolean addition in "toy" file, with two simple shapes
  - Currently a work in progress, in `toy-offset-and-addition.html`
  - Ended up splitting out to separate files while testing boolean operation libraries
  - Settled on `polybool`, fruits of labour are in `demo-bool-ops-02.html`
- [ ] Clean up boolean path addition utilities
- [ ] Add boolean path addition step to main "index" file

### Explore path smoothing AFTER boolean addition

- Want it to be easy to cut out the shapes
- Path smoothing of some kind might help with that

### Revisit image processing

- [ ] Revisit image processing for speed & path simplicity
  - Currently image processing is the slowest part of the whole thing
  - In addition, I've noticed the traced paths are pretty complex for large images. More complex than they need to be.
  - Could the image be scaled down by a certain factor (say, `2`), and then processed and traced, and then the resulting path scaled back up?
  - Would such a scale-trace-revertscale approach be faster? And would it produce similar results

### Later

- [ ] Final packaging as a `.zip` file with an `index.html` etcetera
  - Could also build into a single `.html` file with simple `@include` style assembly, a la Mustache... self container "app" that runs in your browser, even offline! Zero external dependencies... pretty cool!
  - Could then share this with folks... creative commons etc
  - At this point, final tool exporting a single mini outline as `.svg` seems most feasible... embed the original image in the SVG as a `dataURI`
  - Stretch goal might be using `<canvas />` to render the outline `.svg` and the original image to a `.jpeg` or `.png`. Transparent-supporting `.png` in particular is interesting, as it would be nice to be able to place characters close together... but might need to use the offset-and-outlined path as a mask... Seems feasible, even if it could get a little messy!

- [ ] Consider arrangement of "results" on page...
  - maybe let them be dragged around, even rotated?
  - nah... seems to make more sense to have this as a separate tool
  - character mini generator should render to `.svg`, or to `.jpeg` or `.png`. The exported asset can then be placed and duplicated in other programs (eg Figma). If I happen to want to create an HTML-based standalone program that lets you arrange imported `.svg`, `.png`, and `.jpeg` files on a page, that might be cool. But, can be completely separate from the "paper minis" generator.
