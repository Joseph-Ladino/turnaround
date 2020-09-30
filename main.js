var width = document.body.offsetWidth;
var height = document.body.offsetHeight;

var centEl = document.getElementById("center"); // textEl parent
var textEl = document.getElementById("text"); // actual text element
var blnkEl = document.getElementById("cursor"); // blink cursor

var hnd = 0; // main loop handle
var text = "turn back"; // text to be shown

var trimChars = 0; // num of characters to delete
var addChars = ""; // chars to add to the current text value
var lastCharMod = 0; // time of last adding/removing of character

var lastBlink = 0; // time of last blink
var blinkSpeed = 530; // time in ms the cursor takes to toggle from on and off
var charSpeed = 135; // time in ms between adding/removing a character

// returns font size required to fit the text in the given width
function calcFontSize(text = text, font = "default", compressAmount = 0.95, targetWidth = width) {
	let ratio = 0;
	let temp = document.createElement("span");

	temp.innerText = text;
	temp.id = "sizeOlicious";
	temp.style.fontSize = "200px";
	temp.style.fontFamily = font;

	document.body.appendChild(temp);
	ratio = (200 * compressAmount) / temp.offsetWidth;
	document.body.removeChild(temp);

	return ratio * targetWidth;
}

// processes deleting or adding chars one by one
function addRemoveChars(now) {
	let elapsed = now - lastCharMod;

	if (elapsed < charSpeed) return;

	if (trimChars > 0) {
		text = text.slice(0, text.length - 1);

		lastCharMod = now;
		trimChars--;
	} else if (addChars.length > 0) {
		text += addChars[0];

		lastCharMod = now;
		addChars = addChars.slice(1);
	}
}

// returns index where the strings diverge, i.e. 2 for "cop" and "cob"
function indexOfChange(str1, str2) {
	let minLength = Math.min(str1.length, str2.length);
	for (let i = 0; i < minLength; i++) if (str1[i] != str2[i]) return i;

	return minLength;
}

// set blink cursor
// -1 for toggle, 0 for off, 1 for on
function setBlink(option) {
	let blinkOff = option == -1 ? blnkEl.classList.contains("blinkOff") : option > 0;

	if (blinkOff) blnkEl.classList.remove("blinkOff");
	else blnkEl.classList.add("blinkOff");
}

function changeDisplayText(newText) {
	if (text == newText) return;

	let ioc = indexOfChange(text, newText);
	let delCount = text.length - ioc;

	trimChars = delCount < 0 ? 0 : delCount;
	addChars = newText.slice(ioc);
}

function updateDisplayedText(now) {
	let elapsed = now - lastBlink;

	if (trimChars > 0 || addChars.length > 0) setBlink(1);
	else if (elapsed >= blinkSpeed) {
		setBlink(-1);
		lastBlink = now;
	}

	if (text == textEl.value) return;

	textEl.innerText = text;
}

let phrases = [
	"turn back",
	"turn away",
	"look behind you",
	"god please stop",
	"save me",
	"stop my pain",
	"over your shoulder",
	"he's in your blindspot",
	"eye see you",
	"tell my grandpa I say hi",
	"it's rude to ignore him",
	"he sees you",
	"dont turn off the lights",
	"he likes it when you sleep late",
	"listen for the whispers",
	"the kids are laughing, not a tear in sight",
	"dont pretend to be asleep",
	"your night light changes nothing",
	"check the corners",
	"he sees through the shadows",
	"country road, your new home, in the ditch, covered in shit",
];

var lastPhraseChange = 0;
var waitTime = 5000;

function loop(ms) {
	hnd = requestAnimationFrame(loop);

	addRemoveChars(ms);

	updateDisplayedText(ms);

	if (text.length > 4) resize();

	if (ms - lastPhraseChange >= waitTime) {
		changeDisplayText(phrases[Math.floor(Math.random() * phrases.length)]);
		lastPhraseChange = ms;
		waitTime = (trimChars + addChars.length) * charSpeed + 1500 + Math.round(Math.random() * 20000);
	}
}

function resize() {
	width = document.body.offsetWidth;
	height = document.body.offsetHeight;

	centEl.style.fontSize = `${calcFontSize(text + "|", "default", 0.9)}px`;
}

hnd = requestAnimationFrame(loop);
resize();

window.onresize = resize;
