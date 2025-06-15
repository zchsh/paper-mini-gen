# Project Notes

## Next steps

### Implement dark mode

- [x] Implement dark mode
  - Why not, would be nice I think, I just found myself wanting it
  - Nice to establish a pattern for these types of lil projects early
  - 2025-06-12 at 10:29 - got this done in a very basic way

### Separate arrangement tool

Not everyone knows how to work with SVGs. Bit of a pain. Consider arrangement of "results" on page...

- maybe let them be dragged around, even rotated?
- nah... seems to make more sense to have this as a separate tool
- character mini generator should render to `.svg`, or to `.jpeg` or `.png`. The exported asset can then be placed and duplicated in other programs (eg Figma). If I happen to want to create an HTML-based standalone program that lets you arrange imported `.svg`, `.png`, and `.jpeg` files on a page, that might be cool. But, can be completely separate from the "paper minis" generator.
- probably makes sense as a separate project...
- 2025-06-09 at 09:38 - maybe this doesn't need to be a fully separate project? if aim is to make it a nicely packaged, browser-only thing... maybe you could start by building it within this project?
- Core functionality: import SVG (drag-drop, or paste from clipboard). arrange SVGs on page. adjust page size. print to PDF (use browser).

- [x] Stub in a rough prototype of how printing will work
  - [x] New page exists
  - [x] New page can print border to 8.5 by 11 page
  - Stubbed in `/demo/print-letter-page`
- [x] Stub in navigable view
  - Gonna lean on browser zoom and scroll for now
  - More purpose-built document navigation can come later... maybe even have artboards? Mark them for printing? `@page` directive in CSS might make that feasible, even if pages are different sizes? Something to dive into _later_.
  - Stubbed in `/demo/print-letter-page`, works for now
- [x] Look into using <https://spencer.place/creation/playhtml>
  - Great option, but it's also real-time-multiplayer which I don't need (via <https://www.partykit.io/>)
  - Started digging some stuff outta this, maybe look into <https://github.com/react-grid-layout/react-draggable> to init "drag" events (handle both touch and mouse)?
  - 2025-06-13 at 08:53 - have this _kind of_ working, it's janky and I need to learn more about event listeners, but it feels workable enough to move on for now to other hurdles

- [x] Investigate why Firefox doesn't seem to print images embedded in an SVG
  - Images are shown in the print preview... but upon saving to PDF, the images aren't there
  - Happens with the raw SVG files as well
  - Doesn't happen in Chrome, Chrome seems to print to PDF fine, with images included.
  - Is this related to how I've formatted the SVG? Or is it a deeper issue in FireFox? Feels worth investigating...
  - Alternately, maybe the answer is "just use Chrome"? That sucks though.
  - Have repro case of relative simple SVG file with embedded image... maybe try with something even simpler, exported from Figma? If the simplest use cases aren't working, then it's probably more of a Firefox problem.
  - 2025-06-13 at 09:43 - pretty sure this is a bit of a bug in Firefox... [clipPath](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/clipPath) should be able to contain `<use>` elements... but in my case at lease, they don't seem to print correctly.
  - 2025-06-13 at 09:53 - have a minimal repro... maybe worth filing a bug report? Seems petty and tiny, but maybe fixing all the petty and tiny things adds up to a more usable browser.
  - 2025-06-13 at 10:15 - filed a bug report - <https://bugzilla.mozilla.org/show_bug.cgi?id=1972006>

- [x] Revisit `layout-final-svg.js` to work around Firefox issue
  - Copy approach in `2025-06-13-firefox-print-to-pdf-test-svg-09-sample-output-working-with-defs.svg`
  - Reference `path` should be declared within the `clipPath`, and can then be referenced later

- [x] In `layout-final-svg`, use `href` instead of `xlink:href`, latter is deprecated

- [x] Stub in paste-from-clipboard to add an SVG to the page

- [ ] Refine document structure to allow SVG export
  - Currently one big HTML document, with many SVG documents within it.
  - Currently solution is to add `uuid` values to ids within each SVG document... this works fine for now because I have control over the SVG source... but for this "print and arrange SVGs" tool to be really useful, maybe it shouldn't rely on that property?
  - Alternate solution... when an `<svg />` document is pasted, grab the _contents_ of the SVG, and paste those into the DOM, within an existing `<svg />` paste target.
  - Main reason to do this: allows `Export SVG` functionality, which would be really nice.
  - Hurdle: may want to automatically modify the incoming SVG contents to add a `uuid` to any `id` values, and any `#<id>` references to those original values? Maybe this should be a toggle-able option... as in my case, it feels like it might be ideal to instead _match_ any incoming definitions by their `id`, and thereby keep SVG (and PDF) file size really trim, but actually re-using definitions across any duplicate paste elements.
  - Note: this will change event listeners significantly, I think? Or maybe wrapping incoming contents in a `<g />` group, and applying the same kind of `transform: translate` approach to the group makes sense?
  - Related note: scope here is `paste and repositioning smaller incoming SVGs within a page-sized SVG document`, and that page-sized SVG document can then be printed using browser print.

- [ ] Stub in showing bounding box on "selection" of an individual element
- [ ] Stub in "delete" option on individual pasted elements
- [ ] Stub in drag-and-drop to add an SVG to the page

- [ ] Zoom and pan document, in container
  - By default, click and drag should select
  - So... shift-click to pan? Seems to be pretty standard
- [ ] Initial auto-zoom to fit document in viewport

- [ ] Implement basic z-index layering
  - The last element you touched should have the highest z-index
  - To avoid going to infinite z-indices, maybe this means having to touch every `can-move` element's z-index at once... might be more performant to avoid z-index completely, and re-append the last touched element to the DOM, so it's the last child and therefore highest in z-index due to ordering.

- [ ] Select multiple items
- [ ] Delete multiple items
- [ ] Export to SVG

- [ ] Add on-page docs-ish notes about print quirks
  - Printing from certain browsers can be annoying.
  - Chrome seems to have the most considered approach.
  - Firefox seems to work pretty well, though I've run into some nitpicky bugs when printing SVGs.
  - Safari can be frustrating. The print preview sometimes doesn't match the printed document.

### Later

#### Publish to a more permanent domain home

- Maybe `zch.sh/paper-miniature-generator`
- Could rename the repository to match

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

#### Consider joiner arc settings

- [ ] Consider "joiner arc" settings
  - Standing-up part of mini is "joined" to base, currently by half-circle
  - Could have "arc height" and "arc width" instead, for flexibility
  - Some art may be "floating" very high up... special joiner settings for that?
  - Maybe this is something like... "joiner style"... default is "arc"... and then "joiner height", "joiner width"
  - Note: keep in mind implications to `arrangeOffsetY` when changing this setting. Should work nicely, worth testing out!

#### Support "backside" images

- Requires more art, but really adds something I think, and could maybe encourage hand-drawing over AI tool use, eg see <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Totally optional
- Art has to kind of match up from front to back in terms of shape... cutout from front would always be used.

#### Consider post-trace option to "remove interior voids"
  
- I've been thinking about doing _line drawings_. This would leave significant "holes", or interior shapes, within a larger main shape.
- Could there be an option to remove these interior voids? Option to remove them completely could make sense.
- Another way to implement this option, more manual maybe a separate thing, would be manual removal of specific shapes, eg by clicking on them and having them change colour
- Possible first cut option... a given polygon is made up of many REGIONS. Group the regions of a given polygon based on whether they overlap - any overlapping regions should be placed in a single group. Determining overlap might be done with a "minowski diff"? <https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibclipperminkowskidiff>. In longer form, running an intersection of the two regions, and then determining whether the intersection has a surface area greater than zero might be another option. Once you have a group of overlapping regions, then determine the surface area of each region, with <https://sourceforge.net/p/jsclipper/wiki/documentation/#clipperlibjsareaofpolygon>. Finally, sort by surface area, and keep only the region with the largest surface area.

#### Image resizing performance

- [ ] Image resize performance
  - Image resize should only need to happen once, on upload
  - Currently happens every time a raster-related setting is changed
  - Incidentally... maybe resized image would be efficient to embed into the SVG? Could potentially debounce the actual image data resizing, while immediately updating the display image size.

#### Consider alternate approach to centering traced shapes

As-is, traced polygons are centered with "offset" based on their bounding box... which kind of works, but feels like it could be better.

What if you found the "center of mass" of the incoming polygon, and used that as a "base" offset? The input offset could be applied on top of that "base" offset.

#### Clean up ImageTraceJS local files

- [ ] Clean up `imagetracejs-remixes`
  - I'm not concerned about this for now, cause it's working fine for my purposes... if I had to worry about abstracting all the cases in which it'd probably break, that'd be another story, but for now I think I can just not care.

#### Separate background removal tool

- One option could be threshold-based... make the silhouette mask, then apply it. Might work for some character art.
- Another option might be using an existing library. Have one written down somewhere.

#### Separate sticker tool

- Without the "base" parts, this is kind of a sticker generator
- Making a separate "sticker" tool might be a neat exercise in testing the re-usability of the work here

#### Look into performance

- Seems to have gotten better since swapping Jimp in and ripping out ImageJS
- Seems fine for now

#### Stub in documentation

- <https://documentation.js.org/>

#### Clean up demos

- Many are no longer relevant, i think, since have swapped in a few libraries

## Inspiration

- <https://www.youtube.com/watch?v=ehjWZRPq9JA>
- Printable chess could be a good spin-off
- <https://papermini.arkanatools.com/> - existing tool i found after starting this one
