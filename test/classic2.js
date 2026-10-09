// Classic in virtual DOM
// We want the vdom to be easily converted to a single HTML string
// The vdom consists of an array of arrays: 15 cascades and 52 faceup booleans
// 0-6 in in tableau, 7-10 in stock and 11-14 in foundations
const deck=shuffle(); // new pure function creates a shuffled deck;
var cascades=deal(deck); // put the stock in cascades[7], aces start in cascades;
var faceups=initializeFaceups(cascades); // determine faceup status of each card
repaint();
function repaint(){
	tableau=document.getElementById("tableau");
	tableau.replaceChildren();
	tableau.innerHTML=buildHTML(cascades,faceups);
};

function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}
// try to make this clear
function tryMove(cascades,card,j) {
	let moved=false; // local variable
//	moved=tryAce(cascades,card,j);
	if(!moved) moved=tryCascade(cascades,card,j); // returns cascade number if one can move there
	if(moved) repaint(); // impure call
	return moved;
}
function tryAce(cascades,card,j){
	let moved=false;
	const value=getVal(card);
	const suit=getSuit(card);
	const j2=7+
	console.log("tryAce suit=",suit,"value=",value,"foundation_level",foundation_level);
	if(value==foundation_level) {
		addCard(srcId,foundation,0);
		faceUp(oldParentId);
		moved=true;
		tryWin();
	}
	console.log("tryAce moved=",moved);
	return moved;
}
// this should be easier as we are appending a slice to another array
function tryCascade(cascades,card,j1){ // move to another cascade if color mismatch and value one above
	const value1=getVal(card);
	const color1=getColor(card);
	const i1=cascades[j1].indexOf(card); // where i source cascade is it?
	let moved=false;
	for(let j2=0;j2<7;j2++) { // step through cascades until a move happens
		n2=cascades[j2].length;
//		console.log("try cascade=",cascades[j1],"card=",card,"i1=",i1,"j1 j2=",j1,j2,"n2=",n2);
		if(n2==0 && value1==12) moved=moveAll(cascades,i1,j1,j2);
		if(n2 && !moved){
			card2=cascades[j2][n2-1]; // get the topcard on destination
			const value2=getVal(card2);
			const color2=getColor(card2);
			console.log("color2=",color2,"value2=",value2);
			if((color2!==color1) && (value2==(value1+1))) moved=moveAll(cascades,i1,j1,j2);
		}
	}
	return moved;
}

function moveAll(cascades,i1,j1,j2){ // move all the children to reserve
	const chunk=cascades[j1].splice(i1);
	console.log("moveAll",i1,j1,j2,"chunk=",chunk);
	cascades[j2].push(...chunk);
	const n1=cascades[j1].length;
	console.log("flip",j1,"n1=",n1);
	if(n1) faceups[cascades[j1][n1-1]]=true; // flip last card faceup
	return true
}

function initializeFaceups(cascades){
	let faces=[];
	for(i=0;i<52;i++) faces[i]=false;
	for(j=0;j<7;j++) {
		const cascade=cascades[j];
		faces[cascade[j]]=true;
	}
	return faces; 
}

function buildCard(card,j,iy,faceup){ //
	const s="position: absolute; width: 100%; top:"+iy+"vw;";
	if(faceup){
		const color=getColor(card);
		return "<div class='card "+color+"' id=v"+card+" style='"+s+
		"' onclick='tryMove(cascades,"+card+","+j+");'>"+createContent(card)+"</div>";
	}else{
		return "<div class=card id=v"+card+" style='"+s+"'><img src=/back.jpg></div>";
	}
}

function buildHTML(cascades,faceups){ 
	let myHTML=""; // this builds the 7 cascades as a div of divs
	for(let j=0;j<7;j++){
		const cascade=cascades[j];
		myHTML+="<div  id=c"+j+" class=c>"; // create the column
		for(let i=0;i<cascade.length;i++) {
			const card=cascade[i];
//			console.log("card",card);
			const face=faceups[card];
//			console.log("buildHTML",i,j);
			myHTML+=buildCard(card,j,i*5,faceups[card]); // create each card in the cascade
		}
		myHTML+="</div>";
	}
	return myHTML;
}


function deal(deck){
	let cascades=[[],[],[],[],[],[],[],[],[],[],[]];
	let ndealt=0;
	for(let j=0;j<7;j++){
		cascades[j].push(deck[ndealt]);
		ndealt++;
		for(let i=j+1;i<7;i++){
			cascades[i].push(deck[ndealt]);
			ndealt++;
		}
	}
	while(ndealt<52){
		cascades[7].push(deck[ndealt]);
		ndealt++;
	}
	return cascades;
}

function tryWin(cascades){
	win=cascades[11].length+cascades[12].length+cascades[13].length+cascades[14];
	console.log("Win?",win);
	if(win==52) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}

// pure next3 function
function next3(){
	let n=nchildren("r0"); // How many in reserve?
	if(n==0){
		moveAll("s0","r0");
		moveAll("s1","r0");
		moveAll("s2","r0");
	}
	n=nchildren("r0");
	if(n==0) tryWin();
	else {
		const imax=Math.min(n,3); // How many can we flip up?
		i=0;
		while(i<imax){
			addCard(getTopId("r0"),"s"+i,0);
			faceUp("s"+i);
			i++;
		}
	}
}


// pure functions mostly replacing the old common.js functions for now
function createContent(i){ // i runs 0 to 51
	const suits = ["♠","♥","♦","♣"];
	const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
	const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const n=i%13; // index within the suit
	const value=vals[i%13];
	const suit=suits[Math.floor(i/13)];
	const color=(suit=="♠" || suit=="♣" ? "b" : "r");
	const face=(n<10 ? suit : faces[i%13-10]);
	const content="<h2>"+value+" "+suit+"</h2><h1>"+face+"</h1>";
	return content;
}

function shuffle(){
	let deck=[];
	for (let i=0; i<52; i++) deck[i]=i;
	for (let i=0; i<52; i++) { // do lots random interchanges
		const j=Math.floor(Math.random() * 52);
		[deck[i],deck[j]]=[deck[j],deck[i]];
    }
	return deck;
}


