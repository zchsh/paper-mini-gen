# Project Notes

## Next steps

- [x] Update so on upload, values reset properly
  - Currently, "center" is always -5, subtle and hard to catch, due to settings reset in `onload`

- [x] Update so downloaded SVG has similar filename to uploaded image
  - First need to see if I can get uploaded image name...

- [ ] Add "Compatible SVGs for mediocre software" setting
  - Remove uses of core SVG features such as `<def>` and `<use>`. Some software still struggles to support those basic features. File size will be much larger, as duplicate path geometry and image data will need to be repeated rather than referenced.

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
  - 2025-06-26 at 19:55 - for this specific use case I think what I'm looking for is more of a "shrink wrap" situation... like <https://stackoverflow.com/questions/56511668/2d-path-shrink-wrap-algorithms> . Maybe run <https://mourner.github.io/simplify-js/> first, then some shrink wrap-ish algorithm? Maybe there's some kind of "concave-ness" tolerance that'd make sense? Look at three points at a time, start from starting point? Great case for a separate little demo thing. Maybe useful: <https://www.codeproject.com/Articles/114797/Polyline-Simplification>, <https://dyn4j.org/2021/06/2021-06-10-simple-polygon-simplification/>
  - 2025-06-26 at 20:13 - dug a little more, I think what I might want is step 1, simplify with <https://mourner.github.io/simplify-js/>, and step 2, use the simplified points as a cubic spline, and then render points on that cubic spline with specific curve tolerance. See <https://eli.thegreenplace.net/2023/cubic-spline-interpolation/>. Need to try this out though, i don't really know what I'm talking about... but could maybe combine with concept of "convex hull"... for segments that are concave, ie "indentations" in the shape, use those as approximating points in the spline (guides the line, will likely not intersect, therefore ending up more convex than original polyline), while the already-convex points could be used as interpolating points (line must pass through these points, again ensures the curved spline ends up more convex than the original polyline). More on splines at <https://courses.cs.duke.edu/compsci344/spring15/classwork/12_curves/srm_splines.pdf>.

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
