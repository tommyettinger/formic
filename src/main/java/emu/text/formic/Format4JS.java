package text.formic;
class Format4JS {
	static boolean isF4JSLibInjected() {
		return ((JsPropertyMap) DomGlobal.window).get("f4js") != null;
	}
}
