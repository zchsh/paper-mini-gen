# Project Notes

## Next steps

### Basic arrangement tool

Prototype started at `/demo/paste-and-print-letter-page-svg`.

- [x] Stub in display of bounding box on click-to-select of an individual element
  - Clicking outside any element should de-select any currently selected element
- [x] Stub in "delete" option on individually selected element
  - Maybe it's a little action button at the top left of the bounding box?
  - Only show when selected
- [x] Stub in drag-and-drop to add an SVG to the page
  - Drag-and-drop area above page, I think?

- [x] Implement basic z-index layering
  - The last element you touched should have the highest z-index
  - To avoid going to infinite z-indices, maybe this means having to touch every `can-move` element's z-index at once... might be more performant to avoid z-index completely, and re-append the last touched element to the DOM, so it's the last child and therefore highest in z-index due to ordering.
  - 2025-06-26 - implemented this in a really basic way

- [ ] Move `print-svgs-prototype` to separate project
  - Separate domain probably makes sense too

- [ ] Add on-page docs-ish notes about print quirks
  - This tool is likely easiest to use on a larger screen, such as a tablet or laptop
  - Printing from certain browsers can be annoying.
  - Chrome seems to have the most considered approach.
  - Firefox seems to work pretty well, though I've run into some nitpicky bugs when printing SVGs.
  - Safari can be frustrating. The print preview sometimes doesn't match the printed document.

- [ ] Implement page size adjustment
  - In theory could rely on browser print... in practice, nice to have a preview
  - Number inputs for width and height

- [ ] Implement page size presets
  - Probably more useful than custom units

- [ ] Implement page size units
  - Start with `inches` most likely, cause that's how paper works where I am...
  - Add `mm` probably, that's it really

### Later

#### Publish to a more permanent domain home

- Maybe `paper-mini.zch.sh`
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

#### Arrange-and-print tool enhancements

At times this feels a little close to "re-implementing a completely basic version of Figma"... but hey, why not I guess.

- [ ] Refine document structure to allow SVG export
  - Currently one big HTML document, with many SVG documents within it.
  - Currently solution is to add `uuid` values to ids within each SVG document... this works fine for now because I have control over the SVG source... but for this "print and arrange SVGs" tool to be really useful, maybe it shouldn't rely on that property?
  - Alternate solution... when an `<svg />` document is pasted, grab the _contents_ of the SVG, and paste those into the DOM, within an existing `<svg />` paste target.
  - Main reason to do this: allows `Export SVG` functionality, which would be really nice.
  - Hurdle: may want to automatically modify the incoming SVG contents to add a `uuid` to any `id` values, and any `#<id>` references to those original values? Maybe this should be a toggle-able option... as in my case, it feels like it might be ideal to instead _match_ any incoming definitions by their `id`, and thereby keep SVG (and PDF) file size really trim, but actually re-using definitions across any duplicate paste elements.
  - Note: this will change event listeners significantly, I think? Or maybe wrapping incoming contents in a `<g />` group, and applying the same kind of `transform: translate` approach to the group makes sense?
  - Related note: scope here is `paste and repositioning smaller incoming SVGs within a page-sized SVG document`, and that page-sized SVG document can then be printed using browser print.

- [ ] Zoom and pan document, in "canvas" container
  - In this little program, fixed to single artboard (control size later though), and toolset is _vastly_ simplified (select only, plus document navigation)
  - Move elements - click and drag, starting ON a selectable object
  - Select - click and drag, starting OFF any selectable object
    - Shift-click, or shift-click-drag, to invert selection
  - Zoom - command-scroll. Zoom about current pointer position
    - `transform: scale` I think?
  - Pan - separate "tool"? In Figma, it's `H` for hand.
    - Pan shorcut could be clicking down scroll wheel and moving (as in Figma)
    - Command + click-and-drag might work. Or "alt". Choose a default, allow user to customize `Pan modifier`?
    - Either way... basic "toolbar", either "select" (pointer icon) or "pan" (hand icon)?
    - `transform: translate` on the broader canvas, I think?
- [ ] Size "canvas" container to same width and height as viewport
  - Activate "canvas" container to interact (eg click), this brings it into scroll view, input captured, scrolling navigates canvas (shift-scroll scrolls horizontally)
  - `Esc` or activate escape button within "canvas" container to leave, input no longer captured, scrolling scrolls page
- [ ] Initial auto-zoom to fit document in viewport
  - Maybe this is where case for instructions "outside" the "canvas" makes sense? Otherwise this could scale text to tiny proportions.

- [ ] Select multiple items
- [ ] Delete multiple items
- [ ] Export to SVG

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
