"undefined"==typeof f4js&&(f4js={}),function(){function t(t,r,e){for(var o=0;o<e;o++)t.push(r);return t}function r(r,e,o){return(t(Array(),e,o).join("")+r).slice(-o)}function e(r,e,o){return(r+t(Array(),e,o).join("")).slice(0,o)}function o(t,r){var e=t.length%3,o=t.slice(e).split(/(.{3})/);o.unshift(t.slice(0,e));for(var n=[],a=0;a<o.length;a++)o[a]&&n.push(o[a]);return n.join(r)}void 0===String.prototype.format&&(String.prototype.format=function(){var t=Array.prototype.slice.apply(arguments).slice(0);return(new C).doFormat(this,t)}),void 0===String.format&&(String.format=function(t){var r=Array.prototype.slice.apply(arguments).slice(1);return(new C).doFormat(t,r)}),"undefined"!=typeof f4js&&(f4js.format=function(t,r){return(new C).doFormat(t.toString(),r)});var n={0:"January",1:"February",2:"March",3:"April",4:"May",5:"June",6:"July",7:"August",8:"September",9:"October",10:"November",11:"December"},a={0:"Jan",1:"Feb",2:"Mar",3:"Apr",4:"May",5:"June",6:"July",7:"Aug",8:"Sep",9:"Oct",10:"Nov",11:"Dec"},i={0:"Sunday",1:"Monday",2:"Tuesday",3:"Wednesday",4:"Thursday",5:"Friday",6:"Saturday"},s={0:"Sun",1:"Mon",2:"Tue",3:"Wed",4:"Thu",5:"Fri",6:"Sat"},p=function(t){this.isUpperCase=t};p.prototype.convert=function(t,e,o,p){var u="";switch(p.charAt(1)){case"H":u=r(t.getHours(),"0",2);break;case"I":u=r((t.getHours()-1)%12+1,"0",2);break;case"k":u=t.getHours();break;case"l":u=(t.getHours()-1)%12+1;break;case"M":u=r(t.getMinutes(),"0",2);break;case"S":u=r(t.getSeconds(),"0",2);break;case"L":u=r(t.getMilliseconds(),"0",3);break;case"N":throw new Error("unsupported time format: N");case"p":u=24==(h=t.getHours())||h<13?"am":"pm","T"==p.charAt(0)&&(u=u.toUpperCase());break;case"z":var c=t.getTimezoneOffset();u=(c>0?"-":"+")+r(Math.abs(c)/60*100,"0",4);break;case"Z":throw new Error("unsupported time format: Z");case"s":u=Math.floor(t.getTime()/1e3);break;case"Q":u=t.getTime();break;case"B":u=n[t.getMonth()];break;case"b":case"h":u=a[t.getMonth()];break;case"A":u=i[t.getDay()];break;case"a":u=s[t.getDay()];break;case"C":var f=t.getFullYear();u=r(Math.floor(f/100),"0",2);break;case"Y":u=r(t.getFullYear(),"0",4);break;case"y":u=r(t.getYear(),"0",2);break;case"j":var l=new Date(t.getFullYear(),0,1),g=t-l;u=r(Math.round(g/864e5)+1,"0",3);break;case"m":u=r(t.getMonth()+1,"0",2);break;case"d":u=r(t.getDate(),"0",2);break;case"e":u=t.getDate();break;case"R":u=(h=r(t.getHours(),"0",2))+":"+(m=r(t.getMinutes(),"0",2));break;case"T":u=(h=r(t.getHours(),"0",2))+":"+(m=r(t.getMinutes(),"0",2))+":"+(v=r(t.getSeconds(),"0",2));break;case"r":var h=r(t.getHours(),"0",2),m=r(t.getMinutes(),"0",2),v=r(t.getSeconds(),"0",2);t.getHours();u=h+":"+m+":"+v+" "+(24==t.getHours()||t.getHours()<13?"am":"pm").toUpperCase();break;case"D":f=r(t.getYear(),"0",2);u=r(t.getMonth()+1,"0",2)+"/"+r(t.getDate(),"0",2)+"/"+f;break;case"F":u=(f=t.getFullYear())+"-"+r(t.getMonth()+1,"0",2)+"-"+r(t.getDate(),"0",2);break;case"c":throw new Error("unsupported time format: c");default:throw new Error("unknown time format: "+p)}return this.format(u,e,o)},p.prototype.format=function(t,o,n){if(o.alternateForm)throw new Error("format flags conversion mismatch: alternative form is not supported in date and time conversion.");return n&&t.length<n&&(t=o.leftAlign?e(t," ",n):r(t," ",n)),this.isUpperCase&&(t=t.toUpperCase()),t};var u=function(t){this.isUpperCase=t};u.prototype.convert=function(t,r,e,o){var n="";return n=null==t?"false":"boolean"==typeof t?t?"true":"false":"true",this.format(n,e,o)},u.prototype.format=function(t,o,n){if(o.alternateForm)throw new Error("format flags conversion mismatch: alternative form is not supported in boolean conversion.");return n&&t.length<n&&(t=o.leftAlign?e(t," ",n):r(t," ",n)),this.isUpperCase&&(t=t.toUpperCase()),t};var c=function(){};c.prototype.convert=function(t,o,n,a){var i=JSON.stringify(t);return a&&i.length<a&&(i=n.leftAlign?e(i," ",a):r(i," ",a)),i};var f=function(t){this.isUpperCase=t};f.prototype.format=function(t,o,n){if(o.alternateForm)throw new Error("format flags conversion mismatch: alternative form is not supported in character conversion.");return n&&t.length<n&&(t=o.leftAlign?e(t," ",n):r(t," ",n)),this.isUpperCase&&(t=t.toUpperCase()),t};var l=function(t){f.call(this,t)};(l.prototype=new f).convert=function(t,r,e,o){var n=t.toString();return this.format(n,e,o)};var g=function(t){f.call(this,t)};(g.prototype=new f).convert=function(t,r,e,o){var n=t.toString();if(1!=n.length)throw new Error("string length != 1");return this.format(n,e,o)};var h=function(t){this.isUpperCase=t};h.prototype.format=function(t,r,e,o){return e.groupingSeparator&&(r=this.formatGroupingSeparator(r)),e.alternateForm&&(r=this.formatAlternateForm(r)),e.signPlus&&(r=this.formatSignPlus(r,t)),e.signSpace&&(r=this.formatSignSpace(r,t)),e.surroundNegative&&(r=this.formatSurroundNegative(r,t)),o&&r.length<o&&(r=this.formatPadding(r,e,o)),this.isUpperCase&&(r=r.toUpperCase()),r},h.prototype.formatPadding=function(t,o,n){o.leftAlign?t=e(t," ",n):t=r(t,o.zeroPadding?"0":" ",n);return t},h.prototype.formatSignPlus=function(t,r){throw new Error("format flags conversion mismatch: sign plus is not supported in integer conversion.")},h.prototype.formatSignSpace=function(t,r){throw new Error("format flags conversion mismatch: sign space is not supported in integer conversion.")},h.prototype.formatGroupingSeparator=function(t){throw new Error("format flags conversion mismatch: grouping separator is not supported in integer conversion.")},h.prototype.formatSurroundNegative=function(t,r){throw new Error("format flags conversion mismatch: surround negative is not supported in integer conversion.")},h.prototype.formatAlternateForm=function(t){throw new Error("format flags conversion mismatch: alternate form is not supported in integer conversion.")};var m=function(){h.call(this,!1)};(m.prototype=new h).convert=function(t,r,e,o){var n=Math.floor(t),a=n.toString();return a=this.format(n,a,e,o)},m.prototype.formatSignPlus=function(t,r){return r>0?"+"+t:t},m.prototype.formatSignSpace=function(t,r){return r>0?" "+t:t},m.prototype.formatGroupingSeparator=function(t){var r=0===t.indexOf("-")?1:0,e=o(t.slice(r),",");return 0===r?e:"-"+e},m.prototype.formatSurroundNegative=function(t,r){return r<0?"("+t.substring(1,t.length)+")":t};var v=function(t){h.call(this,t)};(v.prototype=new h).convert=function(t,r,e,o){var n=Math.floor(t),a=n.toString(8);return this.format(n,a,e,o)},v.prototype.formatAlternateForm=function(t){return"0"+t};var d=function(t){h.call(this,t)};(d.prototype=new h).convert=function(t,r,e,o){var n=t>>>0,a=n.toString(16);return this.format(n,a,e,o)},d.prototype.formatAlternateForm=function(t){return"0x"+t};var w=function(t){this.isUpperCase=t};w.prototype.format=function(t,r,e,o){return e.groupingSeparator&&(r=this.formatGroupingSeparator(r)),e.alternateForm&&(r=this.formatAlternateForm(r)),e.signPlus&&(r=this.formatSignPlus(r,t)),e.signSpace&&(r=this.formatSignSpace(r,t)),e.surroundNegative&&(r=this.formatSurroundNegative(r,t)),o&&r.length<o&&(r=this.formatPadding(r,e,o)),this.isUpperCase&&(r=r.toUpperCase()),r},w.prototype.formatPadding=function(t,o,n){o.leftAlign?t=e(t," ",n):t=r(t,o.zeroPadding?"0":" ",n);return t},w.prototype.formatAlternateForm=function(t){return-1==t.indexOf(".")?t+".":t},w.prototype.formatSignPlus=function(t,r){return r>0?"+"+t:t},w.prototype.formatSignSpace=function(t,r){return r>0?" "+t:t},w.prototype.formatGroupingSeparator=function(t){var r=t.split("."),e=r[0],n=0===e.indexOf("-")?1:0,a=o(e.slice(n),",");return a=0===n?a:"-"+a,2==r.length?a+"."+r[1]:a},w.prototype.formatSurroundNegative=function(t,r){return r<0?"("+t.substring(1,t.length)+")":t},w.prototype.normalize=function(t,r){var e={},o=t.toExponential(r-1).split(/e/);return e.real=o[0],e.sign=o[1].charAt(0),e.base=o[1].substring(1,o[1].length),e};var y=function(t){w.call(this,t)};(y.prototype=new w).convert=function(t,r,e,o){-1==r&&(r=6);var n=parseFloat(t),a=this.normalize(n,r+1),i=this.toExponential(a,r);return this.format(n,i,e,o)},y.prototype.formatGroupingSeparator=function(t,r){throw new Error("format flags conversion mismatch: grouping separator is not supported in exponential conversion.")},y.prototype.toExponential=function(t,e){return t.real+"e"+t.sign+r(t.base,"0",2)};var S=function(){w.call(this,!1)};(S.prototype=new w).convert=function(t,r,e,o){-1==r&&(r=6);var n=parseFloat(t),a=this.toFloat(n,r);return this.format(n,a,e,o)},S.prototype.toFloat=function(t,r){var o=(Math.round(t*Math.pow(10,r))/Math.pow(10,r)).toString(),n=o.indexOf("."),a=-1!=n?o.substring(0,n):o,i=-1!=n?o.substring(n+1,o.length):"";i.length<r&&(i=e(i,"0",r));return i.length>0?a+"."+i:a};var b=function(){w.call(this,!1)};(b.prototype=new w).convert=function(t,r,e,o){-1==r?r=6:0==r&&(r=1);var n=this.normalize(parseFloat(t),r),a=this.exponentialToFloatValue(n);return Math.abs(a)<Math.pow(10,-4)||Math.abs(a)>=Math.pow(10,r)?converted=this.toExponential(n,r):converted=this.toFloat(a,r),this.format(a,converted,e,o)},b.prototype.formatAlternateForm=function(t){throw new Error("format flags conversion mismatch: alternative form is not supported in computerized conversion.")},b.prototype.toExponential=function(t,e){return t.real+"e"+t.sign+r(t.base,"0",2)},b.prototype.toFloat=function(t,r){return t.toPrecision(r)},b.prototype.exponentialToFloatValue=function(t,r){return t.real*Math.pow(10,parseInt(t.sign+t.base))};var F=function(t){w.call(this,t)};(F.prototype=new w).convert=function(t,r,o,n){var a=parseFloat(t),i=t.toExponential().match(/([0-9.]+)e([+-][0-9]+)/),s=(i[1]-2).toString(2).replace(".","");if(s.length%4!=0){var p=4-s.length%4;s=e(s,"0",s.length+p)}var u="0x1."+parseInt(s,2).toString(16)+"p"+(parseInt(i[2])+1);return this.format(a,u,o,n)},F.prototype.formatPadding=function(t,r,e){if(r.zeroPadding){var o=t.substring(2,t.length);return"0x"+(o=w.prototype.formatPadding.call(this,o,r,e-2))}return w.prototype.formatPadding.call(this,t,r,e)},F.prototype.formatGroupingSeparator=function(t){throw new Error("format flags conversion mismatch: grouping separator is not supported in hexadecimal float conversion.")},F.prototype.formatSurroundNegative=function(t){throw new Error("format flags conversion mismatch: surround negative is not supported in hexadecimal float conversion.")};var k=function(){},A=function(){};(A.prototype=new k).convert=function(t,r,e){return this.format("%",r,e)},A.prototype.format=function(t,r,e){return t};var E=function(){};(E.prototype=new k).convert=function(t,r,e){return this.format("\n",r,e)},E.prototype.format=function(t,r,e){if(e>=0)throw new Error("illegal format width: "+e);return t};var M={b:new u(!1),B:new u(!0),j:new c(!0),s:new l(!1),S:new l(!0),c:new g(!1),C:new g(!0),d:new m,o:new v(!1),O:new v(!0),x:new d(!1),X:new d(!0),e:new y(!1),E:new y(!0),f:new S,g:new b(!1),G:new b(!0),a:new F(!1),A:new F(!0)},P={"%":new A,n:new E},x={t:new p(!1),T:new p(!0)},C=function(){};C.prototype.doFormat=function(t,r){this.args=r,this.count=0,this.previous=-1;var e=this;return t.replace(/%(([1-9][0-9]*)\$|\<)?([-#+ 0,(]+)?(\d+)?(\.\d+)?([^tT]|[tT][a-zA-Z])/g,function(t,r,o,n,a,i,s){return e.replace(t,r,o,n,a,i,s)})},C.prototype.replace=function(t,r,e,o,n,a,i){var s=this.count;r&&"<"==r?s=this.previous:e&&0!=e.length?s=e-1:"%"!=i&&"\n"!=i&&this.count++,this.previous=s;var p=o&&0!=o.length?this.parseFlags(o):{},u=n&&0!=n.length?n:-1,c=a&&0!=a.length?parseInt(a.substring(1,a.length)):-1,f=i,l="";if("%"==f||"n"==f){l=(h=P[f]).convert(c,p,u)}else{if(s>=this.args.length||s<0)throw new Error("missing argument '$"+s+"'");var g=this.args[s];if(f.match(/^[Tt]/)){l=(h=x[f.charAt(0)]).convert(g,p,u,f)}else{var h;if(void 0===(h=M[f.charAt(0)]))throw new Error("unknown conversion '"+f.charAt(0)+"'");l=h.convert(g,c,p,u,f)}}return l},C.prototype.hasDuplication=function(t){for(var r=0;r<t.length-1;r++)for(var e=r+1;e<t.length;e++)if(t.charAt(r)==t.charAt(e))return!0;return!1},C.prototype.parseFlags=function(t){var r={leftAlign:!1,signPlus:!1,signSpace:!1,zeroPadding:!1,surroundNegative:!1,alternateForm:!1,groupingSeparator:!1};if(this.hasDuplication(t))throw new Error("has duplication in flags: "+t);for(var e=0;e<t.length;e++){var o=t.charAt(e);switch(o){case"-":r.leftAlign=!0;break;case"#":r.alternateForm=!0;break;case"+":r.signPlus=!0;break;case" ":r.signSpace=!0;break;case"0":r.zeroPadding=!0;break;case",":r.groupingSeparator=!0;break;case"(":r.surroundNegative=!0;break;default:throw new Error("unknown format flag: '"+o+"'")}}if(r.signPlus&&r.signSpace)throw new Error("illegal format flags: '+' & ' '");if(r.leftAlign&&r.zeroPadding)throw new Error("illegal format flags: '-' & '0'");return r}}();
