# Project Notes

## Next steps

- [x] Implement dark mode
  - Why not, would be nice I think, I just found myself wanting it
  - Nice to establish a pattern for these types of lil projects early
  - 2025-06-12 at 10:29 - got this done in a very basic way

### Publish to a more permanent domain home

- Maybe `zch.sh/paper-miniature-generator`
- Could rename the repository to match

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
- [ ] Stub in static position SVG, see how it prints
- [ ] Stub in moveable SVG, see how it prints
- [ ] Stub in paste-from-clipboard to add a static SVG to the page
- [ ] Stub in paste-from-clipboard to add a moveable SVG to the page
- [ ] Stub in drag-and-drop to add a static SVG to the page
- [ ] Stub in drag-and-drop to add a moveable SVG to the page
- [ ] Sketch out how an arrangement tool would work

### Later

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
