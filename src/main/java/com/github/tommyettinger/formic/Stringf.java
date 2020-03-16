/* Copyright (c) 2008-2015, Avian Contributors

   Permission to use, copy, modify, and/or distribute this software
   for any purpose with or without fee is hereby granted, provided
   that the above copyright notice and this permission notice appear
   in all copies.

   There is NO WARRANTY for this software.  See license.txt for
   details. */

package com.github.tommyettinger.formic;

import java.util.ArrayList;
import java.util.IllegalFormatCodePointException;
import java.util.UnknownFormatConversionException;

// ------------------------------------------------------------------------- //
// things that must be done in order to call this semi-complete: 
// ------------------------------------------------------------------------- //
//  * get the date formatter working for individual fields at a minimum 
// ------------------------------------------------------------------------- //

/**
 * A pure-Java alternative to String.format(), available for GWT.
 * <br>
 * Each instance of this class is a threadsafe pre-parsed format pattern. Refer
 * to the very detailed class description of java.util.Formatter in the OpenJDK
 * API documentation for an explanation of the supported formats.
 * <br>
 * Should be easily portable to other Java runtimes that do not include the
 * formatting functionality that was introduced in Java 5, including GWT.
 * <br>
 * Aims to be lightweight and reasonably fast, and provide reasonably complete
 * API compatibility with the OpenJDK implementation. To clarify what
 * "reasonably complete" means in this context, this implementation should
 * accept any valid format string that the OpenJDK version accepts. However,
 * it should not be relied upon to throw an Exception for every format pattern
 * that the OpenJDK implementation does.
 * <br>
 * If your program's behavior relies on the side effects from an Exception
 * being thrown for an invalid format string, this might not be for you.
 * The same is true if you need to know a particular Exception's type or
 * message, since there's little way to change these from outside the JDK.
 * <br>
 * Perhaps more troubling is the fact that the correct localization of numbers
 * and temporal values is barely even attempted, even though the parser accepts
 * the flags without even a warning. The plan is to work on EN-US localization
 * first, and then see about more complex other locales.
 *
 * @author bcg
 */
public final class Stringf {

	/**
	 * Parses a format string and returns a compiled representation of it.
	 */
	public static Stringf compile (String fmt) {
		return new Stringf(fmt);
	}

	/**
	 * A convenience method meant to mimic the syntax of String.format().
	 * The format string {@code fmt} allows all the same options as the one for String.format(), but
	 * some options may be ignored if they aren't yet implemented. The args can be an Object array or
	 * given as varargs of any type.
	 * <br>
	 * Consider building a Stringf pattern object if you expect to use the same format String more
	 * than once; {@link #compile(String)} will construct a new Stringf and {@link #run(Object...)}
	 * will format one set of args. Alternatively, {@link #run(StringBuilder, Object...)} will format
	 * a set of args and append the result to a StringBuilder.
	 *
	 * @param fmt  a format String with the "printf syntax" that Java's String.format uses
	 * @param args an Object array or varargs of any type that can be used by fmt
	 * @return the formatted String
	 */
	public static String format (String fmt, Object... args) {
		return new Stringf(fmt).run(args);
	}

	/**
	 * The original string value that was parsed
	 */
	public String source () {
		return _source;
	}

	/**
	 * Processes the supplied arguments through the compiled format string
	 * and returns the result as a String.
	 */
	public final String run (Object... args) {
		final StringBuilder bldr = new StringBuilder();
		run(bldr, args);
		return bldr.toString();
	}

	/**
	 * Processes the supplied arguments through the compiled format string
	 * and writes the result of each component directly to a StringBuilder
	 */
	public final void run (final StringBuilder a, Object... fmt_args) {
		final Object[] args = fmt_args != null ? fmt_args : new Object[0];
		int cntr = 0;
		for (final FmtCmpnt cmp : _components) {
			if (cmp._conversion == CONV_LITRL) {
				a.append(cmp._source);
				continue;
			}
			final Object arg;
			if (!acceptsArgument(cmp._conversion)) {
				arg = null;
			} else {
				final int index = cmp._argument_index;
				switch (index) {
				case AIDX_NONE:
					if ((cntr) >= args.length) {
						throw new UnknownFormatConversionException("Format specified at least " + (cntr + 1) + " arguments, but " + cntr + " were supplied.");
					}
					arg = args[cntr++];
					break;
				case AIDX_PREV:
					arg = args[cntr];
					break;
				default:
					if (index < 1) {
						throw new IllegalArgumentException();
					} else if (index > args.length) {
						throw new IllegalArgumentException();
					} else {
						arg = args[index - 1];
					}
				}
			}
			convert(a, arg, cmp._conversion, cmp._flags, cmp._width, cmp._precision);
		}
	}

	//- conversions
	static final byte CONV_LITRL = 0x0;
	static final byte CONV_NLINE = 0x1;
	static final byte CONV_PRCNT = 0x2;
	static final byte CONV_BOOLN = 0x3;
	static final byte CONV_DTIME = 0x4;
	static final byte CONV_STRNG = 0x5;
	static final byte CONV_HCODE = 0x6;
	static final byte CONV_CHRCT = 0x7;
	static final byte CONV_DECML = 0x8;
	static final byte CONV_OCTAL = 0x9;
	static final byte CONV_HXDEC = 0xA;
	static final byte CONV_CPSCI = 0xB;
	static final byte CONV_GNSCI = 0xC;
	static final byte CONV_FLOAT = 0xD;
	static final byte CONV_HXEXP = 0xE;

	//- format component flags 
	static final byte FLAG_FORCE_UPPER_CASE = (byte)(1 << 7);
	static final byte FLAG_NEGATIVES_IN_PARENS = (byte)(1 << 6); // ('(')
	static final byte FLAG_GROUPING_SEPARATORS = (byte)(1 << 5); // (',') 
	static final byte FLAG_LEADING_ZERO_PADDED = (byte)(1 << 4); // ('0')
	static final byte FLAG_LEADING_SPACE_PADDED = (byte)(1 << 3); // (' ')
	static final byte FLAG_ALWAYS_INCLUDES_SIGN = (byte)(1 << 2); // ('+')
	static final byte FLAG_ALTERNATE_FORM = (byte)(1 << 1); // ('#')
	static final byte FLAG_LEFT_JUSTIFIED = (byte)(1 << 0); // ('-')

	//- conversion capability flags
	static final byte CFLG_WDTH_SUPPRT = CONV_PRCNT;
	static final byte CFLG_ACCEPTS_ARG = CONV_BOOLN;
	static final byte CFLG_NUMERIC_VAL = CONV_DECML;
	static final byte CFLG_PREC_SUPPRT = CONV_STRNG;

	//- special argument indices
	static final int AIDX_PREV = -1;
	static final int AIDX_NONE = 0;

	/**
	 * the original serialized format string
	 */
	private final String _source;

	/**
	 * array of components parsed from the source string
	 */
	private final FmtCmpnt[] _components;

  /*/ keeping this private for now to encourage access through the static 
      compile method, which might allow caching format string instances if it 
      turns out there is an advantage to that. /*/

	/**
	 * Constructor
	 */
	private Stringf (final String fmt) {
		this._source = fmt;
		final ArrayList<FmtCmpnt> cmps = new ArrayList<FmtCmpnt>();
		for (int i = 0; (i = next(fmt, cmps, i)) > -1; )
			;
		this._components = cmps.toArray(new FmtCmpnt[cmps.size()]);
	}

	/**
	 * Iterates over the tokens in an input string to extract the components
	 */
	private static int next (final String fmt, final ArrayList<FmtCmpnt> cmps, final int startIndex) {
		final int strln = fmt.length();
		if (startIndex >= strln) {
			return -1;
		}
		final char c = fmt.charAt(startIndex);
		if (c == '%') {
			// this is the start of a specifier
			final FmtSpecBldr bldr = new FmtSpecBldr();
			for (int i = startIndex + 1; i < strln; i++) {
				final char ch = fmt.charAt(i);
				final FmtCmpnt cmp = bldr.append(ch);
				if (cmp != null) {
					cmps.add(cmp);
					return (i + 1);
				}
			}
			throw new UnknownFormatConversionException("Incomplete specifier at end of fmt");
		} else {
			// this is the start of a literal
			final StringBuilder literal = new StringBuilder();
			literal.append(c);
			for (int i = startIndex + 1; i < strln; i++) {
				final char ch = fmt.charAt(i);
				// write the current buffer if the next character starts a specifier
				if (ch == '%') {
					final FmtCmpnt cmp = new FmtCmpnt(literal.toString());
					cmps.add(cmp);
					return i;
				}
				literal.append(ch);
			}
			// write the current buffer if the end of the format has been reached
			final FmtCmpnt cmp = new FmtCmpnt(literal.toString());
			cmps.add(cmp);
			return -1;
		}
	}

	/**
	 * Checks a flag byte to see if a given flag is set. Only FLAG_* constants
	 * from the enclosing class should be passed in for toCheck... otherwise the
	 * behavior is undefined.
	 */
	static boolean checkFlag (final byte flags, final byte toCheck) {
		return (flags & toCheck) != 0;
	}

	/**
	 * Checks if a given conversion accepts(requires) an argument. Only the CONV_
	 * flags from the enclosing class should be passed in, otherwise the result
	 * of this method is undefined as should not be used.
	 */
	static boolean acceptsArgument (final byte conversion) {
		return conversion >= CFLG_ACCEPTS_ARG;
	}

	/**
	 * Checks if a given conversion allows specifying a precision. Only the CONV_
	 * flags from the enclosing class should be passed in, otherwise the result
	 * of this method is undefined as should not be used.
	 */
	static boolean precisionSupported (final byte conversion) {
		return conversion >= CFLG_PREC_SUPPRT;
	}

	/**
	 * Checks if a given conversion allows specifying a width. Only the CONV_
	 * flags from the enclosing class should be passed in, otherwise the result
	 * of this method is undefined and should not be trusted.
	 */
	static boolean widthSupported (final byte conversion) {
		return conversion >= CFLG_WDTH_SUPPRT;
	}

	/**
	 * Checks if a given conversion expects a numeric value. Only the CONV_
	 * flags from the enclosing class should be passed in, otherwise the result
	 * of this method is undefined and should not be trusted.
	 */
	static boolean isNumeric (final byte conversion) {
		return conversion >= CFLG_NUMERIC_VAL;
	}

	/**
	 * The newline character for the current platform.
	 */
	static final String NEWLINE = System.getProperty("line.separator");

	/**
	 * Performs conversion on the supplied argument
	 */
	static void convert (final StringBuilder appendable, final Object arg, final byte conversion, final byte flags, final int width, final int precision) {
		int radix = 0;
		switch (conversion) {
		case CONV_LITRL:
			throw new IllegalArgumentException("cannot convert a literal");
		case CONV_NLINE:
			appendable.append(NEWLINE);
			return;
		case CONV_PRCNT:
			convertPercent(appendable, arg, flags, width, precision);
			return;
		case CONV_BOOLN:
			convertBoolean(appendable, arg, flags, width, precision);
			return;
		case CONV_DTIME:
			convertDate(appendable, arg, flags, width, precision);
			return;
		case CONV_STRNG:
			convertString(appendable, arg, flags, width, precision);
			return;
		case CONV_HCODE:
			convertHashcode(appendable, arg, flags, width, precision);
			return;
		case CONV_CHRCT:
			convertChar(appendable, arg, flags, width, precision);
			return;
		case CONV_DECML:
			if (radix == 0) { radix = 10; }
        case CONV_OCTAL:
			if (radix == 0) { radix = 8; }
        case CONV_HXDEC:
			if (radix == 0) { radix = 16; }
          if (arg instanceof Long) {
				convertLong(appendable, (Long)arg, flags, width, precision, radix);
			} else {
				convertInteger(appendable, arg, flags, width, precision, radix);
			}
			return;
		case CONV_CPSCI:
		case CONV_GNSCI:
		case CONV_FLOAT:
		case CONV_HXEXP:
			convertFloat(appendable, arg, flags, width, precision, 10);
			return;
		}
		throw new IllegalStateException("not implemented: " + conversion);
	}

	static void convertPercent (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val = "%";
		appendify(a, val, flags, width, precision);
	}

	static void convertDate (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val = (arg == null) ? "null" : arg.toString();
		appendify(a, val, flags, width, precision);
	}

	static void convertString (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val = (arg == null) ? "null" : arg.toString();
		appendify(a, val, flags, width, precision);
	}

	static void convertHashcode (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val = (arg == null) ? "null" : Integer.toHexString(arg.hashCode());
		appendify(a, val, flags, width, precision);
	}

	static void convertBoolean (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val;
		if (arg == null) {
			val = "false";
		} else if (arg instanceof Boolean) {
			val = String.valueOf(arg);
		} else {
			val = "true";
		}
		appendify(a, val, flags, width, precision);
	}

	static void convertChar (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision) {
		final String val;
		if (arg instanceof Character) {
			val = ((Character)arg).toString();
		} else if (arg instanceof Byte || arg instanceof Short || arg instanceof Integer) {
			final int codePoint = ((Number)arg).intValue();
			if (codePoint >= 0 && codePoint <= 0x10FFFF) { //<-- isValidCodePoint()?
				val = new String(Character.toChars(codePoint));
			} else {
				throw new IllegalFormatCodePointException(codePoint);
			}
		} else {
			throw new UnknownFormatConversionException("Cannot do char conversion: " + arg);
		}
		appendify(a, val, flags, width, precision);
	}

	static void convertLong (final StringBuilder a, final Long arg, final byte flags, final int width, final int precision, final int radix) {
		final String val;
		final long longValue = arg;
		switch (radix) {
		case 2:
			val = '+' + Long.toBinaryString(longValue);
			break;
		case 8:
			val = '+' + Long.toOctalString(longValue);
			break;
		case 16:
			val = '+' + Long.toHexString(longValue);
			break;
		default:
			val = (longValue >= 0) ? '+' + Long.toString(longValue) : Long.toString(longValue);
		}
		appendify(a, val, flags, width, precision);
	}

	static void convertInteger (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision, final int radix) {
		final String val;

		final Number n = (Number)arg;
		final long mask;
		if (arg instanceof Integer)
			mask = 0xFFFFFFFFL;
		else if (arg instanceof Short)
			mask = 0xFFFFL;
		else if (arg instanceof Byte)
			mask = 0xFFL;
		else
			throw new UnknownFormatConversionException("not an integer number: " + arg);
		final long longValue = n.longValue();
		switch (radix) {
		case 2:
			val = '+' + Long.toBinaryString(longValue & mask);
			break;
		case 8:
			val = '+' + Long.toOctalString(longValue & mask);
			break;
		case 16:
			val = '+' + Long.toHexString(longValue & mask);
			break;
		default:
			val = (longValue >= 0) ? '+' + Long.toString(longValue) : Long.toString(longValue);
		}
		appendify(a, val, flags, width, precision);
	}

	// FIXME: I'm lazy, so hexidecimal exponential isn't implemented, sorry - bcg
	static void convertFloat (final StringBuilder a, final Object arg, final byte flags, final int width, final int precision, final int radix) {
		final String val;
		final Number n = (Number)arg;
		switch (radix) {
		case 3:
			if (arg instanceof Float) {
				val = Float.toHexString(n.floatValue());
			} else if (arg instanceof Double) {
				val = Double.toHexString(n.doubleValue());
			} else {
				throw new UnknownFormatConversionException("not a floating point number: " + arg);
			}
			break;
		case 16:
			if (arg instanceof Float) {
				val = Float.toHexString(n.floatValue());
			} else if (arg instanceof Double) {
				val = Double.toHexString(n.doubleValue());
			} else {
				throw new UnknownFormatConversionException("not a floating point number: " + arg);
			}
			break;
		default:
			if (arg instanceof Float) {
				val = Float.toString(n.floatValue());
			} else if (arg instanceof Double) {
				val = Double.toString(n.doubleValue());
			} else {
				throw new UnknownFormatConversionException("not a floating point number: " + arg);
			}
		}
		appendify(a, val, flags, width, precision);
	}

	static void appendify (final StringBuilder a, final String val, final byte flags, final int width, final int precision) {
		String result = val;
		if (checkFlag(flags, FLAG_FORCE_UPPER_CASE)) {
			result = result.toUpperCase();
		}
		// TODO: implement other flags
		// (+) always include sign
		// (,) grouping separators
		// (() negatives in parentheses
		if (precision > 0) {
			// FIXME: this behavior should be different for floating point numbers
			final int difference = result.length() - precision;
			if (difference > 0) {
				result = result.substring(0, precision);
				a.append(result);
				return;
			}
		}
		if (width > 0) {
			final int difference = width - result.length();
			final boolean leftJustified = checkFlag(flags, FLAG_LEFT_JUSTIFIED);
			final char sign = result.charAt(0);
			final boolean hasSign = checkFlag(flags, FLAG_ALWAYS_INCLUDES_SIGN) || sign == '-';
			if (hasSign)
				a.append(sign);
			if (!leftJustified && difference > 0) {
				char fill = checkFlag(flags, FLAG_LEADING_ZERO_PADDED) ? '0' : ' ';
				fill(a, difference + (hasSign ? 0 : 1), fill);
			}
			a.append(result, 1, result.length());
			if (leftJustified && difference > 0) {
				fill(a, difference + (hasSign ? 0 : 1), ' ');
			}
			return;
		}
		a.append(result);
	}

	private static void fill (StringBuilder a, int num, char c) {
		while (num > 0) {
			a.append(c);
			num--;
		}
	}

	/**
	 * Represents a single chunk of the format string, either a literal or one of
	 * the specifiers documented in OpenJDK's javadoc for java.util.Formatter.
	 * This struct is immutable so can be safely shared across threads.
	 */
	private static final class FmtCmpnt {

		private final String _source;
		private final byte _conversion;
		private final int _argument_index;
		private final int _width;
		private final int _precision;
		private final byte _flags;

		private FmtCmpnt (final String literal) {
			this(literal, CONV_LITRL, 0, 0, 0, (byte)0);
		}

		private FmtCmpnt (final String src, final byte conversion, final int argumentIndex, final int width, final int precision, final byte flags) {
			this._source = src;
			this._conversion = conversion;
			this._argument_index = argumentIndex;
			this._width = width;
			this._precision = precision;
			this._flags = flags;
		}

		@Override
		public String toString () {
			return "{ " + "source = '" + _source + "', " + "conversion = " + _conversion + ", " + "flags = " + Integer.toBinaryString(_flags & 0xFF) + ", " + "arg_index = " + _argument_index + ", " + "width = " + _width + ", " + "precision = " + _precision + ", " + "}";
		}
	}

	/**
	 * Helper class for parsing a stream of characters into FmtCmpnt objects.
	 */
	private static final class FmtSpecBldr {

		private StringBuilder _source;
		private byte _conversion;
		private int _argument_index;
		private int _width;
		private int _precision;
		private byte _flags;

		private FmtSpecBldr () {
			this.init();
		}

		private final void init () {
			_argument_index = _width = _precision = _conversion = _flags = 0;
			_source = null;
		}

		private final FmtCmpnt build () {
			final FmtCmpnt result = new FmtCmpnt(_source.toString(), _conversion, _argument_index, _width, _precision, _flags);
			init();
			return result;
		}

		private final FmtCmpnt append (char c) {

			if (_source == null) {
				_source = new StringBuilder();
			}
			_source.append(c);

			// FIXME: none of these date formats are implemented, because lazy
			// if a datetime is specified, after the conversion character a time 
			// format specifier is expected.  This is the only case where a character
			// is allowed after the conversion character.
			if (_conversion == CONV_DTIME)
				switch (c) {

				// Hour of the day for the 24-hour clock, formatted as two digits with a 
				// leading zero as necessary i.e. 00 - 23.
				case 'H':

					// Hour for the 12-hour clock, formatted as two digits with a leading 
					// zero as necessary, i.e. 01 - 12.
				case 'I':

					// Hour of the day for the 24-hour clock, i.e. 0 - 23.
				case 'k':

					// Hour for the 12-hour clock, i.e. 1 - 12.
				case 'l':

					// Minute within the hour formatted as two digits with a leading zero 
					// as necessary, i.e. 00 - 59.
				case 'M':

					// Seconds within the minute, formatted as two digits with a leading 
					// zero as necessary, i.e. 00 - 60 ("60" is a special value required to 
					// support leap seconds).
				case 'S':

					// Millisecond within the second formatted as three digits with leading 
					// zeros as necessary, i.e. 000 - 999.
				case 'L':

					// Nanosecond within the second, formatted as nine digits with leading 
					// zeros as necessary, i.e. 000000000 - 999999999.
				case 'N':

					// Locale-specific morning or afternoon marker in lower case, 
					// e.g."am" or "pm". Use of the conversion prefix 'T' forces this 
					// output to upper case.
				case 'p':

					// RFC 822 style numeric time zone offset from GMT, e.g. -0800.
				case 'z':

					// A string representing the abbreviation for the time zone. The 
					// Formatter's locale will supersede the locale of the argument 
					// (if any).
				case 'Z':

					// Seconds since the beginning of the epoch 
					// starting at 1 January 1970 00:00:00 UTC, 
					// i.e. Long.MIN_VALUE/1000 to Long.MAX_VALUE/1000.
				case 's':

					// Milliseconds since the beginning of the epoch 
					// starting at 1 January 1970 00:00:00 UTC, 
					// i.e. Long.MIN_VALUE to Long.MAX_VALUE.
				case 'Q':

					// ------------------------------------------------------------------
					// The following conversion characters are used for formatting dates:
					// ------------------------------------------------------------------

					// Locale-specific full month name, e.g. "January", "February".
				case 'B':

					// Locale-specific abbreviated month name, e.g. "Jan", "Feb".
				case 'b':

					// Same as 'b'.
				case 'h':

					// Locale-specific full name of the day of the week, e.g. "Sunday"
				case 'A':

					// Locale-specific short name of the day of the week, e.g. "Sun"
				case 'a':

					// Four-digit year divided by 100, formatted as two digits with leading 
					// zero as necessary, i.e. 00 - 99
				case 'C':

					// Year, formatted as at least four digits with leading zeros 
					// as necessary, e.g. 0092 equals 92 CE for the Gregorian calendar.
				case 'Y':

					// Last two digits of the year, formatted with leading zeros 
					// as necessary, i.e. 00 - 99.
				case 'y':

					// Day of year, formatted as three digits with leading zeros 
					// as necessary, e.g. 001 - 366 for the Gregorian calendar.
				case 'j':

					// Month, formatted as two digits with leading zeros as necessary, 
					// i.e. 01 - 13.
				case 'm':

					// Day of month, formatted as two digits with leading zeros as 
					// necessary, i.e. 01 - 31
				case 'd':

					// Day of month, formatted as two digits, i.e. 1 - 31.
				case 'e':

					// -------------------------------------------------------------------
					// The following conversion characters are used for formatting common 
					// date/time compositions.
					// -------------------------------------------------------------------

					// Time formatted for the 24-hour clock as "%tH:%tM"
				case 'R':

					// Time formatted for the 24-hour clock as "%tH:%tM:%tS".
				case 'T':

					// Time formatted for the 12-hour clock as "%tI:%tM:%tS %Tp". The location
					// of the morning or afternoon marker ('%Tp') may be locale-dependent.
				case 'r':

					// Date formatted as "%tm/%td/%ty".
				case 'D':

					// ISO 8601 complete date formatted as "%tY-%tm-%td".
				case 'F':

					// Date and time formatted as "%ta %tb %td %tT %tZ %tY", e.g. 
					// "Sun Jul 20 16:17:00 EDT 1969".
				case 'c':
					return seal(CONV_DTIME);

				default:
					throw new UnknownFormatConversionException("Illegal date/time modifier: " + c);
				}

			// -- Flags and Switches -----------------------------------------------
			// these are the possible characters for flags, width, etc. if the input
			// is not one of these characters, it needs to be a valid conversion char.
			// because the possible flags can vary based on the type of conversion,
			// it is easiest to just buffer the flags, argument index, etc. until a
			// conversion character has been reached.  The seal() method will then
			// work out if the specified flags are valid for the given conversion.
			switch (c) {
			case '$':
			case '<':
			case '0':
			case '1':
			case '2':
			case '3':
			case '4':
			case '5':
			case '6':
			case '7':
			case '8':
			case '9':
			case '-':
			case '+':
			case '\'':
			case ' ':
			case '#':
			case ',':
			case '.':
			case '(':
				return null;
			// -- End of Flags and Switches ----------------------------------------

			// -- Conversion characters --------------------------------------------
			// If this point is reached, then the current character must be a valid
			// conversion character. If it is not, it should fall through the rest
			// of the switch statement below and throw an UnknownFormatConversionException

			// string conversion
			case 'S':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 's':
				return seal(CONV_STRNG);

			// newline conversion
			case 'n':
				return seal(CONV_NLINE);

			// percent conversion
			case '%':
				return seal(CONV_PRCNT);

			// decimal numeric conversion
			case 'd':
				return seal(CONV_DECML);

			// hexidecimal numeric conversion
			case 'X':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'x':
				return seal(CONV_HXDEC);

			// datetime conversion
			case 'T':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 't':
				_conversion = CONV_DTIME;
				return null;

			// boolean conversion
			case 'B':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'b':
				return seal(CONV_BOOLN);

			// hashcode conversion
			case 'H':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'h':
				return seal(CONV_HCODE);

			// character conversion
			case 'C':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'c':
				return seal(CONV_CHRCT);

			// octal numeric conversion
			case 'o':
				return seal(CONV_OCTAL);

			// computerized scientific conversion
			case 'E':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'e':
				return seal(CONV_CPSCI);

			// floating point conversion
			case 'f':
				return seal(CONV_FLOAT);

			// general scientific floating point conversion
			case 'G':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'g':
				return seal(CONV_GNSCI);

			// hexidecimal exponential floating point conversion
			case 'A':
				setFlagTrue(FLAG_FORCE_UPPER_CASE);
			case 'a':
				return seal(CONV_HXEXP);
			// -- End of Conversion characters --------------------------------------

			default:
				throw new UnknownFormatConversionException("Invalid character encountered while parsing specifier: " + c);
			}
		}

		@Override
		public String toString () {
			return "{ " + "source = '" + _source + "', " + "conversion = " + _conversion + ", " + "flags = " + Integer.toBinaryString(_flags & 0xFF) + ", " + "arg_index = " + _argument_index + ", " + "width = " + _width + ", " + "precision = " + _precision + ", " + "}";
		}

		private final FmtCmpnt seal (final byte conversion) {

			// throwing IllegalStateException instead of UnknownFormatConversionException
			// because this should only occur if there is a bug in the append()
			// method. In that case I'd prefer to fail fast even if the user is
			// explicitly trying to catch UnknownFormatConversionException.
			if (conversion < 0 || conversion > 0xE) {
				throw new IllegalArgumentException();
			}

			this._conversion = conversion;

			// if the length is less than 2, it must mean that only the conversion
			// character was specified. Since a conversion character by itself is a
			// valid pattern, just build and return
			if (_source.length() < 2) {
				return build();
			}

			// ---------------------------------------------------------------------
			// spec format: [argument_index$][flags][width][.precision] 
			// ---------------------------------------------------------------------
			// the last character of the spec is the conversion character which has 
			// already been translated the appropriate byte by the append() method,
			// so the last character gets chopped off before processing
			final String spec = _source.substring(0, _source.length() - 1);

			// if argument index is supported, it should be followed by a '$' and be
			// comprised only of digit characters, or it should be a single '<' char
			final int dollarIndex = spec.indexOf('$');
			if (dollarIndex > -1) {
				if (acceptsArgument(conversion)) {
					if (spec.charAt(dollarIndex - 1) == '<') {
						_argument_index = AIDX_PREV;
					} else {
						_argument_index = Integer.valueOf(spec.substring(0, dollarIndex));
					}
				} else {
					throw new UnknownFormatConversionException("Formats that do not accept arguments cannot specify an index.");
				}
			}
			if (dollarIndex == (spec.length() - 1)) {
				return build();
			}

			// if precision is supported, look for the first period and assume that
			// everything before is the width and everything after is the precision
			final int dotIndex = spec.indexOf('.');
			if (dotIndex > -1) {
				if (precisionSupported(conversion)) {
					_precision = Integer.valueOf(spec.substring(dotIndex + 1));
				} else {
					throw new UnknownFormatConversionException("Precision is not supported for " + conversion);
				}
			}

			// Now loop over the remaining characters to get the width as well as any
			// applicable flags. Note: 0 is a valid flag so must be handled carefully
			final String remaining = spec.substring(Math.max(dollarIndex, 0), dotIndex > -1 ? dotIndex : spec.length());
			int flagsEnd = -1;
			for (int i = 0, n = remaining.length(); i < n && (flagsEnd == -1); i++) {
				final char c = remaining.charAt(i);
				switch (c) {
				case '-':
					ensureLeftJustifySupported();
					setFlagTrue(FLAG_LEFT_JUSTIFIED);
					break;
				case '#':
					ensureNumeric(c);
					setFlagTrue(FLAG_ALTERNATE_FORM);
					break;
				case '+':
					ensureNumeric(c);
					setFlagTrue(FLAG_ALWAYS_INCLUDES_SIGN);
					break;
				case ' ':
					ensureNumeric(c);
					setFlagTrue(FLAG_LEADING_SPACE_PADDED);
					break;
				case ',':
					ensureNumeric(c);
					setFlagTrue(FLAG_GROUPING_SEPARATORS);
					break;
				case '(':
					ensureNumeric(c);
					setFlagTrue(FLAG_NEGATIVES_IN_PARENS);
					break;
				case '0':
					ensureNumeric(c);
					setFlagTrue(FLAG_LEADING_ZERO_PADDED);
					break;
				case '1':
				case '2':
				case '3':
				case '4':
				case '5':
				case '6':
				case '7':
				case '8':
				case '9':
					flagsEnd = i;
					_width = Integer.valueOf(remaining.substring(flagsEnd));
					return build();
				}
			}
			throw new IllegalStateException();
		}

		private final void ensureLeftJustifySupported () {
			if (!widthSupported(_conversion)) {
				throw new UnknownFormatConversionException("Conversion must support width if specifying left justified.");
			}
		}

		private final void ensureNumeric (final char c) {
			if (!isNumeric(_conversion)) {
				throw new UnknownFormatConversionException("flag " + c + " only supported on numeric specifiers.");
			}
		}

		private final void setFlagTrue (final byte flag) {
			_flags |= flag;
		}/*
    final void setFlagFalse(final byte flag) {
      _flags &= ~flag;
    }*/
	}
}
