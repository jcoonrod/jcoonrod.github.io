const board=document.getElementById("board");
const msg=document.getElementById("status");

var cursor=0; // this keeps track of which card we've just turned over
var clicked=-1; // if >0 then paint this card yellow
board.addEventListener('click', function(event) { // impure click handler
	if (typeof clicked === 'undefined') {
    window.clicked = -1; // Explicitly attaches to global scope
  	}
	let moved=false;
	const div = event.target.closest('.card'); 
	if (!div) return;
	const ctype=div.id.substring(0,1);
	if(div.id=='s0'){ // this is the stock pile
		console.log("click on s0");
		cursor=next();
		moved=(cursor>-1); 
	}
	const card=parseInt(div.id.substring(1)); // this should be an integer
	if(ctype=='v'){ // the playing card ids
		console.log("Click on",card,"clicked");
		moved=tryNuke(pyramid,card);
	}
	if(moved)repaint();
});

function tryNuke(pyramid,card){ // make sure the pyramid item is marked as -1 including 28
	let moved=false;
	v1=getVal(card);
	console.log("tryNuke card",card,"v1",v1);
	if(v1==12) {nuke(pyramid,card); moved=true;}
	if(moved) return moved;
	if(card==clicked) {clicked=-1; moved=true;}
	if(moved) return moved;
	if(!moved && clicked>-1){
		const v2=getVal(clicked);
		console.log("try pair v1",v1,"v2",v2);
		if((v1+v2)==11) {nuke(pyramid,card); nuke(pyramid,clicked); moved=true;}
		clicked=-1; // clear it if no match	
	}else{if(clicked==-1 && !moved){clicked=card; moved=true;}}
	return moved;
}

function next(){//handle the flipping over of cards
	const n=deck.length;
	cursor++;
	if(n>0 && cursor>n) {cursor=0;}
	if(n==0) cursor=-1;
	if(cursor>-1) pyramid[28]=deck[cursor];
	console.log("next",pyramid[28]);
	clicked=-1;
	return cursor;
}

function nuke(pyramid,card){
	const i=pyramid.indexOf(card);
	console.log("Nuke",card,"i",i);
	pyramid[i]=-1;
	if(card==cursor) deck.splice[cursor,cursor]; // remove it from stack
}

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}

// main game play - no automation here
var deck=shuffle(); 
var pyramid=deal(); // pyramid is a collection of absolutely positioned cells 
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
function deal() { // return an array with cards assigned
    let pyramid=[];
    let k=0; // index into pyramid array
    for(let i=0;i<7;i++) { // deal rows
        for(let j=0;j<=i;j++) {
            pyramid[k]=deck.pop();
            k++;
        }
    }
	pyramid[28]=deck[0];
    return pyramid;
}

function buildHTML() { // returns myHTML
    let myHTML="";
    let k=0;
    for(let i=0;i<7;i++) { // become iy
        for(let j=0;j<=i;j++) { // becomes ix
            myHTML+=buildCell(pyramid[k],i,j);
            k++;
        }
    }
	if(deck.length>0) myHTML+=buildBack()+buildCell(pyramid[28],0,7); //treat j=7 as a special case
//	console.log("html",myHTML);
    return myHTML;
}
function buildBack(){
	const s="style='position:absolute;top:10cqi;left:0cqi;width:12cqi;'";
	return "<div id=s0 class=card "+s+"><img src=/back.jpg></div>";
}

function buildCell(card,i,j){
	const bg=(card==clicked ? " style=' background-color:yellow !important;'" : "");
	let cell="";
	if(j<7){ix=43-i*7+j*14; iy=10+7*i;}
	else{ix=13;iy=10;}; // special case of the flipped card
    //console.log("buildCell card",card,"i",i,"j",j);
    if(card>-1){
	    cell="<div class='cell' style='position:absolute; top:"+iy+"cqi; left:"+ix+"cqi;'>";
		const suit=getSuit(card);
		const color=(suit==0 || suit==3 ? "b" : "r");
		cell+="<div id=v"+card+" class='card "+color+"'"+bg+">"+createContent(card)+"</div>";
		cell+="</div>\n";
	}
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
    board.innerHTML=buildHTML();
	msg.innerHTML=clicked;
}
