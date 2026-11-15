const board=document.getElementById("board");
const msg=document.getElementById("status");

var cursor=0; // this keeps track of which card we've just turned over
var clicked=-1; // if >0 then paint this card yellow
board.addEventListener('click', function(event) { // impure click handler
	if (typeof clicked === 'undefined') {
    window.clicked = -1; // Explicitly attaches to global scope
  }
	const div = event.target.closest('.card'); 
	if (!div) return;
	const ctype=div.id.substring(0,1);
	const card=parseInt(div.id.substring(1)); // this should be an integer
	let moved=false;
	if(ctype=='v'){ // the playing card ids
		console.log("Click on",card,"clicked");
		moved=tryNuke(pyramid,card);
	}else if(div.id='s0'){ // this is the stock pile
		console.log("click on s0");
		cursor=next(deck,cursor);
		moved=(cursor>-1); 
	}
	if(moved)repaint();
});

function tryNuke(pyramid,card){
	let moved=false;
	v1=getVal(card);
	console.log("tryNuke card",card,"v1",v1);
	if(v1==12) {nuke(pyramid,card); moved=true;}
	if(moved) return moved;
	if(card==clicked) {clicked=-1; moved=true;}
	if(moved) return moved;
	if(!moved && clicked>-1){
		const v2=getVal(clicked);
		console.lot("try pair v1",v1,"v2",v2);
		if((v1+v2)==13) {nuke(pyramid,card); nuke(pyramid); moved=true;}		
	}
	if(clicked==-1 && !moved){clicked=card; moved=true;}
	return moved;
}

function next(deck,cursor){//handle the flipping over of cards
	const n=deck.length;
	cursor++;
	if(n>0 && cursor>n) {cursor=0;}
	if(n==0) cursor=-1;
	console.log("next",cursor);
	return cursor;
}

function nuke(pyramid,card){
	const i=pyramid.indexOf(card);
	console.log("Nuke",card,"i",i);
	pyramid[i]=-1;
}

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}

// main game play - no automation here
const deck=shuffle(); // deck is constant for the game but mutated via pops
var pyramid=deal(deck); // pyramid is a collection of absolutely positioned cells 
repaint();

function shuffle(){
	let deck=[];
	for (let i=0; i<52; i++) deck[i]=i;
	for (let i=0; i<52; i++) { // do lots random interchanges
		const j=Math.floor(Math.random() * 52);
		[deck[i],deck[j]]=[deck[j],deck[i]];
    }
	return deck;
}
function deal(deck) { // return an array with cards assigned
    let pyramid=[];
    let k=0; // index into pyramid array
    for(let i=0;i<7;i++) { // deal rows
        for(let j=0;j<=i;j++) {
            pyramid[k]=deck.pop();
            k++;
        }
    }
    return pyramid;
}
function buildHTML(pyramid,deck,cursor) {// returns myHTML
    let myHTML="";
    const dx=14; // pct of pyramid for 7 cells and gaps
    let k=0;
    for(let i=0;i<7;i++) { // become iy
        for(let j=0;j<=i;j++) { // becomes ix
            myHTML+=buildCell(pyramid[k],i,j);
            k++;
        }
    }
	if(cursor>-1) {
		myHTML+="<div id=s0 class='card cell' style='width:12cqi; position:absolute; top:10cqi; left:0cqi;'><img src=/back.jpg></div>";		
		const card=deck[cursor];
		pyramid[28]=card;
		console.log("flip card",card,"cursor",cursor,"clicked",clicked);
		const suit=getSuit(card);
		const color=(suit==0 || suit==3 ? "b" : "r");
		const yellow=(card==clicked?" background-color:yellow !important;":"");
		myHTML+="<div id=s0 class='card' style='width:12cqi; position:absolute; top:10cqi; left:0cqi;'><img src=/back.jpg></div>";		
		myHTML+="<div id=v28 class='card "+color+"' style='width:12cqi; position:absolute; top:10cqi; left:13cqi;"+yellow+"'>"+createContent(card)+"</div>";		
	}
    return myHTML;
}
function buildCell(card,i,j){
    ix=43-i*7+j*14;
    iy=10+7*i;
    //console.log("buildCell card",card,"i",i,"j",j);
    let cell="<div class='cell' style='position:absolute; top:"+iy+"cqi; left:"+ix+"cqi;'>";
    if(card>-1){
		const suit=getSuit(card);
		const color=(suit==0 || suit==3 ? "b" : "r");
		cell+="<div id=v"+card+" class='card "+color+"'>"+createContent(card)+"</div>";
	}
	cell+="</div>\n";
    return cell;
}
// pure functions mostly replacing the old common.js functions for now
function createContent(i){ // i runs 0 to 51
	const suits = ["♠","♥","♦","♣"];
	const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
	const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const n=i%13; // index within the suit
	const value=vals[i%13];
	const suit=suits[Math.floor(i/13)];
	const face=(n<10 ? suit : faces[i%13-10]);
	const content="<h2>"+value+" "+suit+"</h2><h1>"+face+"</h1>";
	return content;
}

function repaint(){
    board.innerHTML=buildHTML(pyramid,deck,cursor);
	msg.innerHTML=clicked;
}
