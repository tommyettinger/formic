# formic
Allows using String.format() on GWT simply by changing to Stringf.format().

Using this needs a little bit of setup before the application will run correctly.
You'll need to save the file [format4js-min.js](format4js-min.js) (as the raw text, not an HTML
page) into your GWT project's `webapp` folder, keeping the filename. Then you need to add a line
to the `<head>` section of your `index.html`:
```html
<script src="format4js-min.js"></script>
```

Once these are both in place, you can add a dependency on formic using your build tool (probably
Gradle, but Maven should work too). Maven Central will be supported later; for now use
[JitPack.io](https://jitpack.io/#tommyettinger/formic), choosing the latest commit from the
Commits tab should be good here. JitPack shows instructions when you click "Get it" on a commit
or release, and you probably need to add JitPack as a repository as well as to add the given
dependency to your core project (if you have a project that is GWT-agnostic). You should also add
a dependency to your GWT project (or only project, if you just have GWT as a target); this is the
same as the dependency JitPack lists but has `:sources` appended after the version for Gradle, or
`<classifier>sources</classifier>` for Maven. The last setup step is to add a GWT inherit line to
your `.gwt.xml` file, such as `GdxDefinition.gwt.xml`:
```xml
<inherits name="text.formic" />
```

Now you're ready to write code. Isn't boilerplate *just fantastic*...

In your Java code, `text.formic.Stringf` has one static method,
`format(String, Object...)` that should act almost exactly like Java's
`java.lang.String.format(String, Object...)` even on GWT. Some features aren't supported, namely
`%h`, `%H` (hashCode() results), `%tN`, `%TN` (nanosecond time), `%tZ`, `%TZ` (time zone), `%tc`,
and `%Tc` (full date and time string). Using Stringf.format() in non-GWT code will simply
delegate to String.format(); using it in GWT will use a super-sourced alternative implementation.
The super-sourcing relies on format4js (technically, a modified version that allows better
transfer from Java) and does almost no work of its own.

## Credits

Most of the credit here goes to Hidenori Sugiyama, who made
https://github.com/madogiwa/format4js . The team behind vue-gwt also deserves credit for
showing some useful utilities in their repo that enabled this library to fake having varargs.
