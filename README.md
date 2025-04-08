# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

### Continue work on path to polygon conversion

- Latest lead is the `path-to-polygon.html` code, which I swiped from <https://betravis.github.io/shape-tools/path-to-polygon/>
- I've made `basic-point-at-length.html` more or less from scratch... I mean, from StackOverflow... but it falls down when shapes are contained within each other, as in example `(2)`
- It seems like `path-to-polygon.html` doesn't suffer from this issue
- [x] Play around and look at `path-to-polygon.html` code to try to grok it
  - Splitting out a separate file for key functions seems like a good first step
- [x] Create a toy file like `basic-point-at-length.html`, but with `path-to-polygon` implementation
  - Make the same thing, but make it work for weirdly layered paths
- [x] Play around with image filtering
  - I have something I'm super happy with in `image-js-demo.html`!
- [ ] Add image filtering to main workflow
  - Starting to split out `.js` files probably makes a lot of sense at this point
  - Localinzing `image-js` probably makes sense.
  - First, update the "toy" example to split out the JS. HTML should be super simple. But function should be pure JS, no HTML injection.
  - Then, update the main `index.html` to use the same approach.
- [ ] Final packaging as a `.zip` file with an `index.html` etcetera
  - Could also build into a single `.html` file with simple `@include` style assembly, a la Mustache... self container "app" that runs in your browser, even offline! Zero external dependencies... pretty cool!
  - Could then share this with folks... creative commons etc
  - Consider browser print functionality...
  - Consider arrangement of "results" on page... maybe let them be dragged around, even rotated?
