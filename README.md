# formic
Allows using String.format() on GWT simply by changing to Stringf.format().

Ever ported some Java code to run on GWT and found there's no counterpart for `String.format()`?
Well, now there's this. If you change `String.format()` calls to `Stringf.format()` calls, formic
will delegate at minimal (possibly 0) cost to `String.format()` when it is available natively, or
call a JS library, [format4js](https://github.com/madogiwa/format4js), when running on GWT. Using
format4js means the hard work is done, so most of this library is a wrapper.

## Install

Using this needs a little bit of setup before the application will run correctly.
You can add a dependency on formic using your build tool (probably Gradle, but Maven should work
too). Maven Central is now supported; see the
[right sidebar here](https://search.maven.org/artifact/com.github.tommyettinger/formic/0.1.1/jar)
for Gradle and Maven instructions. If you want a newer commit, you can also use
[JitPack.io](https://jitpack.io/#tommyettinger/formic). Choosing release v0.1.1 should be good,
but you can also pick a commit. JitPack shows instructions when you click "Get it" on a commit
or release, and you probably need to add JitPack as a repository as well as to add the given
dependency to your core project (if you have a project that is GWT-agnostic). Regardless of whether
you use Maven Central or JitPack.io, you should also add a dependency to your GWT project (or only
project, if you just have GWT as a target); this is the same as the dependency JitPack or Maven
Central lists but has `:sources` appended after the version for Gradle, or
`<classifier>sources</classifier>` for Maven. JitPack and Maven Central always show the
dependencies as using `implementation`, but older Gradle needs `compile` instead, or if you have a
core project with recent Gradle, `api` may be correct instead. The last setup step is to add a GWT
inherit line to your `.gwt.xml` file, such as `GdxDefinition.gwt.xml`:
```xml
<inherits name="text.formic" />
```

Now you're ready to write code. I hope the setup wasn't too bad...

## API

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
[format4js](https://github.com/madogiwa/format4js). The team behind vue-gwt also deserves
significant credit for both the utility code that made some parts of this feasible and the
injection code that obviates the need for separate JavaScript and HTML configuration.
