package com.github.tommyettinger.formic;

import org.junit.Test;

public class BasicTest {
	@Test
	public void testString(){
		FormatString format = FormatString.compile("%10s");
		System.out.println(format.format("foo"));
	}
	@Test
	public void testInt() {
		FormatString format = FormatString.compile("%+012d");
		System.out.println(format.format(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.format(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.format(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.format(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
		format = FormatString.compile("%012d");
		System.out.println(format.format(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.format(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.format(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.format(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
		format = FormatString.compile("%024o");
		System.out.println(format.format(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.format(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.format(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.format(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
	}
}
