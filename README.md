# Paper Mini Generator

An attempt at making it easier to create printable paper miniatures.

## Next steps

### Continue work on path to polygon conversion

- Latest lead is the `path-to-polygon.html` code, which I swiped from <https://betravis.github.io/shape-tools/path-to-polygon/>
- I've made `basic-point-at-length.html` more or less from scratch... I mean, from StackOverflow... but it falls down when shapes are contained within each other, as in example `(2)`
- It seems like `path-to-polygon.html` doesn't suffer from this issue
- [ ] Play around and look at `path-to-polygon.html` code to try to grok it
  - Splitting out a separate file for key functions seems like a good first step
- [ ] Create a toy file like `basic-point-at-length.html`, but with `path-to-polygon` implementation
  - Make the same thing, but make it work for weirdly layered paths
- [ ] Final packaging as a `.zip` file with an `index.html` etcetera
  - Could also build into a file with simple `@include` style assembly, a la Mustache
  - Could then share this with folks... creative commons etc
  - Consider browser print functionality...
  - Consider arrangement of "results" on page... maybe let them be dragged around, even rotated?
