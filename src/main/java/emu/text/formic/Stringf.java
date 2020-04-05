package text.formic;
import elemental2.core.JsArray;

public final class Stringf {
	private Stringf(){}
	static {
		F4JSLibInjector.ensureInjected();
	}
	public static String format(String format, Object... args){
		return fmt(format, new JsArray(args));
	}
	
	private static native String fmt(String form, JsArray<Object> args) /*-{
		return f4js.format(form, args);
	}-*/;
}
