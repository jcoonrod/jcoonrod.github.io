//similar to cards but with tiles (.tile defined in index for now)
const board = document.getElementById("board");
const deck = shuffle(); //
const backup = [...deck]; // used for a replay
repaint(buildHTML(makeTiles()));
function repaint(x) {
 board.innerHTML=x;
}
function makeTile(tile) { // tile is an element of the array tiles
	return "<div class=tile>" + tile + "<div>";
}
function makeTiles() {
	const start = 0x1F000; // 🀀 (East Wind)
	const end = 0x1F02B;   // 🀫 (Mahjong Tile Back - last assigned character)
	let mytiles = [];
	for (let codePoint = start; codePoint <= end; codePoint++) {
		mytiles.push(String.fromCodePoint(codePoint));
	}
	console.log("mytiles", mytiles);
	return mytiles;
}
function deal() { // 4 layers and 4 special positions
	const bases = [[12, 8, 10, 12, 12, 10, 8, 12], [6, 6, 6, 6, 6, 6], [4, 4, 4, 4], [2, 2]]; // plus 4 specials
}

function shuffle(){
	let deck=[];
	for (let i=0; i<144; i++) deck[i]=i;
	for (let i=0; i<144; i++) { // do lots random interchanges
		const j=Math.floor(Math.random() * 52);
		[deck[i],deck[j]]=[deck[j],deck[i]];
    }
	return deck;
}

function buildHTML(tarray) { // turn the turtule array into html
	let myHTML = "";
	for (let i = 0; i < tarray.length; i++) {
		myHTML += makeTile(tarray[i]);
		console.log("tile", tarray[i]);
	}
	return myHTML;
}

function replay(myHTML) {
	repaint();
}

board.addEventListener('click', function (event) { // impure click handler
	if (typeof clicked === 'undefined') {
		window.clicked = -1; // Explicitly attaches to global scope
	}
	let moved = false;
	const div = event.target.closest('.tile');
	moved = tryMove();
	if (moved) repaint();
});
