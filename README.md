# formic
Allows using String.format() on GWT by changing to Stringf.format().

Using this should be simple once it's more ready; `text.formic.Stringf` has one static method,
`format(String, Object...)` that should act almost exactly like Java's
`java.lang.String.format(String, Object...)` even on GWT. Some features aren't supported, namely
`%h`, `%H` (hashCode() results), `%tN`, `%TN` (nanosecond time), `%tZ`, `%TZ` (time zone), `%tc`,
and `%Tc` (full date and time string). Using Stringf.format() in non-GWT code will simply
delegate to String.format(); using it in GWT will use a super-sourced alternative implementation.

## Credits

Most of the credit here goes to Hidenori Sugiyama, who made
https://github.com/madogiwa/format4js . The team behind vue-gwt also deserves significant credit
for the framework they provided (we don't use Vue here, but we do use a JS library).
