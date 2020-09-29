const dsp = document.getElementById("display");
const ctx = dsp.getContext("2d");
var hnd = 0;
var glitches = [];

var font = "roboto";
var text = "turn back";
var nextText = text;

var offsetX = 0;
var offsetY = 0;
var targetWidth = 0;
var fixedFontSize = 0;

var lastBlink = 0;
var blinkDurOn = 530;
var blinkDurOff = 530;
var charSpeed = 150;

var deleting = false;
var deleteUntil = 10;
var lastDelete = 0;

var typing = false;
var toAppend = "";
var lastType = 0;

class glitch {
	constructor() {
		this.font = "roboto";
		this.text = "turn back";
	}
}

function getTextDimensions(text, style) {
	let out = { width: ctx.measureText(text).width, height: 0 };
	let test = document.createElement("span");
	test.innerText = "M";
	test.setAttribute("style", style);

	out.height = test.offsetHeight;

	return out;
}

function calcWidthRatio(text, font) {
	let tFont = ctx.font;
	let out = 0;

	ctx.font = `200px ${font}`;
	out = 200 / ctx.measureText(text).width;
	ctx.font = tFont;

	return out;
}

function updateFFS(font) {
	fixedFontSize = calcWidthRatio(text + "|", font) * targetWidth;
}

function indexOfChange(text1, text2) {
	let minLen = Math.min(text1.length, text2.length);

	for (let i = 0; i < minLen; i++) if (text1[i] != text2[i]) return i;

	return minLen - 1;
}

function tryDelete(ts) {
	if (deleting && ts - lastDelete > charSpeed) {
		if (text.length - 1 > deleteUntil) text = text.slice(0, text.length - 1);
		else deleting = false;

		lastDelete = ts;
	}
}

function tryAppend(ts) {
	if (typing && ts - lastType > charSpeed) {
		if (toAppend.length > 0) {
			text += toAppend[0];
			toAppend = toAppend.slice(1);
		} else typing = false;

		lastType = ts;
	}
}

function tryChangeText(ts) {
	tryDelete(ts);
	if (!deleting) tryAppend(ts);
}

function queueChangeText(_text) {
	if (text == _text) return;

	let ioc = indexOfChange(text, _text);
    let minLen = Math.min(text.length, _text.length);

	deleting = true;
	deleteUntil = ioc; 

    if (text.slice(0, ioc + 1) == _text) return;
    
    let mod = _text.length > text.length && ioc == minLen - 1;

    typing = true;
    deleteUntil -= !mod;
    toAppend = _text.slice(ioc + mod);
}

let time = 0;

function loop(ts) {
	hnd = requestAnimationFrame(loop);
	time = ts;

	// fill background
	ctx.fillStyle = "#FAFAFA";
	// ctx.fillStyle = "#B5001E";
	ctx.fillRect(0, 0, dsp.width, dsp.height);

	// blinks the | character bc why not
	let tText;
	let blinkDelta = ts - lastBlink;
	if (blinkDelta > blinkDurOff + blinkDurOn) lastBlink = ts;
	tText = blinkDelta > blinkDurOff || typing || deleting ? text + "|" : text;

	tryChangeText(ts);

	let fontStyle = `${fixedFontSize}px ${font}`;

	ctx.font = fontStyle;
	ctx.fillStyle = "#000";
	// ctx.fillStyle = "#141414";

	ctx.textBaseline = "middle";
	ctx.fillText(tText, offsetX, offsetY);
}

function start() {
	hnd = requestAnimationFrame(loop);
	window.onresize = resize;
}

function resize() {
	dsp.width = document.body.offsetWidth;
	dsp.height = document.body.offsetHeight;

	targetWidth = dsp.width * 0.95;
	offsetX = (dsp.width - targetWidth) * 0.5;
	offsetY = dsp.height * 0.5;

	if(!typing && !deleting) updateFFS(font);
}

resize();
start();
