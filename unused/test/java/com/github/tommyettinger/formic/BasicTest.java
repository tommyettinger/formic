package com.github.tommyettinger.formic;

import org.junit.Assert;
import org.junit.Test;

public class BasicTest {
	@Test
	public void testString(){
		Stringf format = Stringf.compile("%10s");
		System.out.println(format.run("foo"));
	}
	@Test
	public void testInt() {
		int[] testInts = {0, 1, -1, 0x7FFFFFFF, 0x80000000};
		long[] testLongs = {0L, 1L, -1L, 0x7FFFFFFFL, 0x80000000L};
		Stringf format = Stringf.compile("%+012d");
		System.out.println(format.run(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.run(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.run(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.run(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
		for(int t : testInts)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));
		for(long t : testLongs)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));
		
		format = Stringf.compile("%012d");
		System.out.println(format.run(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.run(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.run(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.run(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
		for(int t : testInts)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));
		for(long t : testLongs)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));
		
		format = Stringf.compile("%024o");
		System.out.println(format.run(-0x80000000)  + " should be " + String.format(format.source(), -0x80000000));
		System.out.println(format.run(-0x80000000L) + " should be " + String.format(format.source(), -0x80000000L));
		System.out.println(format.run(0x7FFFFFFF)   + " should be " + String.format(format.source(), 0x7FFFFFFF));
		System.out.println(format.run(0x7FFFFFFFL)  + " should be " + String.format(format.source(), 0x7FFFFFFFL));
		for(int t : testInts)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));
		for(long t : testLongs)
			Assert.assertEquals(format.run(t), String.format(format.source(), t));

	}
}
