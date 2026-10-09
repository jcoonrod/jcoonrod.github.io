// Classic in virtual DOM
// We want the vdom to be easily converted to a single HTML string
// The vdom consists of an array of arrays: 15 cascades and 52 faceup booleans
// 0-6 in in tableau, 7-10 in stock and 11-14 in foundations
const deck=shuffle(); // new pure function creates a shuffled deck;
var cascades=deal(deck); // put the stock in cascades[7], aces start in cascades;
var faceups=initializeFaceups(cascades); // determine faceup status of each card
const board=document.getElementById("board");

board.addEventListener('click', function(event) { // impure click handler
	const div = event.target.closest('.card'); 
	// If the user clicked the board background instead of a card, exit early
	if (!div) return;
	const parent=div.parentElement;
//console.log(`Player clicked ${div.id} parent ${parent.id}`);
	// now do the logic
	const ctype=div.id.substring(0,1);
	const card=parseInt(div.id.substring(1)); // this should be an integer
	let moved=false;
	if(ctype=='v'){ // the playing card ids
//		console.log("tryMove",card,parent.id.substring(1));
		moved=tryMove(cascades,card,parseInt(parent.id.substring(1)));
	}else if(div.id='c7'){
		next3(cascades,faceups);
		moved=true;
	}
	if(moved)repaint();
});

repaint();

function repaint(){
	board.innerHTML=buildHTML(cascades,faceups);
};

function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}

// try to make this clear
function tryMove(cascades,card,j) {
	let moved=false; // local variable
	moved=tryAce(cascades,faceups,card,j);
	if(!moved) moved=tryCascade(cascades,card,j); // returns cascade number if one can move there
	return moved;
}
function tryAce(cascades,faceups,card,j){
	let moved=false;
	const value=getVal(card);
	const suit=getSuit(card);
	const j2=11+suit;
	const n2=cascades[j2].length;
	foundation_level=(n2 ? getVal(cascades[j2][n2-1]) :-1); 
//	console.log("tryAce suit=",suit,"value=",value);
	if(value==(foundation_level+1)) {
		cascades[j2].push(cascades[j].pop());
		faceUp(cascades,faceups,j);
		moved=true;
		tryWin(cascades);
	}
//	console.log("tryAce moved=",moved);
	return moved;
}

function faceUp(cascades,faceups,j){// flip up top card if any
	const n=cascades[j].length;
	if(n) faceups[cascades[j][n-1]]=true;
}

// this should be easier as we are appending a slice to another array
function tryCascade(cascades,card,j1){ // move to another cascade if color mismatch and value one above
//	console.log("tryCascade",card,j1);
	const value1=getVal(card);
	const color1=getColor(card);
	const i1=cascades[j1].indexOf(card); // where i source cascade is it?
	let moved=false;
	for(let j2=0;j2<7;j2++) { // step through cascades until a move happens
		n2=cascades[j2].length;
//		console.log("try cascade=",cascades[j1],"card=",card,"i1=",i1,"j1 j2=",j1,j2,"n2=",n2);
		if(n2==0 && value1==12) moved=moveAll(cascades,i1,j1,j2);
		if(n2 && !moved){
			const card2=cascades[j2][n2-1]; // get the topcard on destination
			const value2=getVal(card2);
			const color2=getColor(card2);
//			console.log("color2=",color2,"value2=",value2);
			if((color2!==color1) && (value2==(value1+1))) moved=moveAll(cascades,i1,j1,j2);
		}
	}
	return moved;
}

function moveAll(cascades,i1,j1,j2){ // move all the children to reserve
	const chunk=cascades[j1].splice(i1);
//	console.log("moveAll",i1,j1,j2,"chunk=",chunk);
	cascades[j2].push(...chunk);
	const n1=cascades[j1].length;
//	console.log("flip",j1,"n1=",n1);
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
	const s=(j<8 ? "position: absolute; top:"+iy+"vw;" : "");
	if(faceup){
		const color=getColor(card);
		return "<div class='card "+color+"' id=v"+card+" style='"+s+
		"'>"+createContent(card)+"</div>";
	}else{
		return "<div class=card id=v"+card+" style='"+s+"'><img src=/back.jpg></div>";
	}
}

function buildHTML(cascades,faceups){ 
	// First row... cascades 7 to 14
	let myHTML="<div class=row>"; // this builds everything below the buttons
	const n7=cascades[7].length; // show the stockpile?
	if(n7) {myHTML+="<div id=c7 class=card><img src=/back.jpg></div>";}
	else {myHTML+="<div id=c7 class=card><h2> </h2><h1>♻</h1></div>";}
	for(let j=8;j<15;j++) { // show next 3 and foundations if they are there
		const n=cascades[j].length; // get the top card if any
		if(n){
			const topcard=cascades[j][n-1];
			myHTML+="<div class=cell id=c"+j+">"+buildCard(topcard,j,0,true)+"</div>";
			}
		else{myHTML+="<div class=cell id=c"+j+"></div>";}
	}
	myHTML+="</div><div class=row><table><tr><td>Stock pile +3 flipped</td>"
	+"<td>Foundations: ♠ ♥ ♦ ♣</td></tr></table></div><div class=row>";
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
		myHTML+="</div>"; // end the cascade		
	}
	myHTML+="</div>"; // end the row
	return myHTML;
}


function deal(deck){
	let cascades=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]];
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
//	console.log("Win?",win);
	if(win==52) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}

// pure next3 function
function next3(cascades,faceups){
//	console.log("Next 3")
	let n=cascades[7].length; // How many in reserve?
	if(n==0){
		moveAll(cascades,0,8,7);
		moveAll(cascades,0,9,7);
		moveAll(cascades,0,10,7);
	}
	n=cascades[7].length;
	if(n==0) tryWin(cascades);
	else {
		const imax=Math.min(n,3); // How many can we flip up?
		i=0;
		while(i<imax){
			const card=cascades[7].pop();
//			console.log("next i=",i,card);
			faceups[card]=true;
			cascades[8+i].push(card);
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


