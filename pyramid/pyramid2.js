const board=document.getElementById("board");
const msg=document.getElementById("status");
// main game play - no automation here
var cursor=99; // this will keep track of which card we've just turned over
var clicked=-1; // if >0 then paint this card yellow
var flipped=-1;
const deck=shuffle();
console.log("Initial stock",stock);
var pyramid=deal(); // pyramid is a collection of absolutely positioned cells 
var stock=deck;
repaint();


board.addEventListener('click', function(event) { // impure click handler
	if (typeof clicked === 'undefined') {
    window.clicked = -1; // Explicitly attaches to global scope
  	}
	let moved=false;
	const div = event.target.closest('.card'); 
	if (!div) return;
	const ctype=div.id.substring(0,1);
	if(div.id=='s0'){ // this is the stock pile
		next();
		moved=true; 
		console.log("s0 moved",moved,"cursor",cursor)
	}
	const card=parseInt(div.id.substring(1)); // this should be an integer
	if(!moved && ctype=='v' && visible(card)){ // the playing card ids
		console.log("Click on",card,"clicked");
		moved=tryNuke(card);
	}
	if(moved)repaint();
});

function visible(card){
	const mymap=[1,3,4,6,7,8,10,11,12,13,15,16,17,18,19,21,22,23,24,25,26]; // Any position>20 is always visible
	const position=pyramid.indexOf(card); // where is the card?
	console.log("visible card",card,"position",position,);
	if(position==-1) return false;
	if(position>20) return true;
	const myleft=mymap[position];
	const vis=(pyramid[myleft]==-1 && pyramid[myleft+1]==-1);
	console.log("myleft",myleft);
	return vis;
}

function tryNuke(card){ // make sure the pyramid item is marked as -1 including 28
	let moved=false;
	v1=getVal(card);
	console.log("tryNuke card",card,"v1",v1);
	if(v1==12) {nuke(card); moved=true;}
	if(moved) return moved;
	if(card==clicked) {clicked=-1; moved=true;}
	if(moved) return moved;
	if(!moved && clicked>-1){
		const v2=getVal(clicked);
		console.log("try pair v1",v1,"v2",v2);
		if((v1+v2)==11) {nuke(card); nuke(clicked); moved=true;}
		clicked=-1; // clear it if no match	
	}else{if(clicked==-1 && !moved){clicked=card; moved=true;}}
	return moved;
}

function next(){//handle the flipping over of cards
	const n=stock.length;
	cursor++;
	if(n>0 && cursor>n) {cursor=0;}
	console.log("next cursor",cursor,"n",n);
	if(n==0) cursor=-1;
	if(cursor>-1) {flipped=stock[cursor]; pyramid[28]=flipped;}
	console.log("next",pyramid[28]);
	clicked=-1;
}

function nuke(card){
	const i=pyramid.indexOf(card); 
	console.log("Nuke",card,"i",i,"cursor",i);
	pyramid[i]=-1;
	nukeStock(card);
}

function nukeStock(card){
	i=stock.indexOf(card);
	if(i>-1 && card==flipped)stock.splice(i,1);
}

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}


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
	pyramid[28]=-1;
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
	if(stock.length>0) myHTML+=buildBack()+buildCell(pyramid[28],0,7); //treat j=7 as a special case
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
	msg.innerHTML="c:"+cursor+" n:"+stock.length;
}
