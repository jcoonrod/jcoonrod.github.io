// Classic in virtual DOM
// We want the vdom to be easily converted to a single HTML string
// that displays cleanly, namely that we can iterate easily 
// I'm thinking cascades is just a 2d array of cascades of card numbers.
const deck=shuffle(); // new pure function creates a shuffled deck;
var cascades=deal(deck); // put the stock in casecades[7];
var faceups=initializeFaceups(cascades); // determine faceup status of each card
document.getElementById("tableau").innerHTML=buildHTML(cascades,faceups);

function initializeFaceups(cascades){
	let faces=[];
	for(i=0;i<52;i++) faces[i]=false;
	for(j=0;j<7;j++) {
		const cascade=cascades[j];
		faces[cascade[j]]=true;
	}
	return faces; 
}

function buildCard(card,iy,faceup){
	const s="position: absolute; width: 100%; top:"+iy+"vw;";
	if(faceup){
		const color=(card<13 || card>39 ? 'b' : 'r' );
		return "<div class='card "+color+"' id=v"+card+" style='"+s+"'>"+createContent(card)+"</div>";
	}else{
		return "<div class='card "+color+"' id=v"+card+" style='"+s+"'><img src=/back.jpg></div>";
	}
}

function buildHTML(cascades,faceups){
	let myHTML=""; // this builds the 7 cascades as a div of divs
	for(let j=0;j<7;j++){
		const cascade=cascades[j];
		myHTML+="<div  id=c"+j+" class=c>"; // create the column
		for(let i=0;i<=j;i++) {
			const card=cascade[i];
			console.log("card",card);
			const face=faceups[card];
			console.log("buildHTML",i,j);
			myHTML+=buildCard(cascade[i],i*5,faceups[cascade[i]]); // create each card in the cascade
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

function tryWin(){
	const win=nchildren("a0")+nchildren("a1")+nchildren("a2")+nchildren("a3");
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

function color(i){
	return (i<13 || i>38 ? "b" : "r");
}

// create the first 28 deck items in cascades and the second 24 in reserve


// try to make this clear
function tryMove(srcId) { // When cascade card is clicked. Must delete it before it can be appended
	let moved=false; // local variable
	moved=tryAce(srcId);
	if(!moved) moved=tryCascade(srcId); // returns cascade number if one can move there
	return moved;
}
function tryAce(srcId){
	let moved=false;
	const oldParentId=getParentId(srcId);
	const cardNo=srcId.substring(1);
	const value=cardNo%13;
	const suit=Math.floor(srcId.substring(1)/13);
	const foundation="a"+suit;
	const foundation_level=nchildren(foundation);
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
function moveAll(srcId,destId){ // move all the children to reserve
	const n=nchildren(srcId);
	console.log("moveAll",srcId,n);
	for(let i=0;i<n;i++){
		cardId=getTopId(srcId); // find the top child
		console.log("move",cardId,destId);
	 	addCard(cardId,destId,0);
		faceDn(cardId); // must remove onclick
	}
}
function addStack(srcId,destId){ // add a stack starting with srcId to dest cascade	let moved=false;
	const oldParentId=getParentId(srcId);
	const n=nchildren(destId);
	const stack=getStack(srcId); // get arracy of cards to will move
	for (i=0;i<stack.length;i++) moved=addCard(stack[i],destId,(n+i)*5);
	faceUp(oldParentId); //
	return moved;
}

function tryCascade(srcId){ // move to another cascade if color mismatch and value one above
	const parentId=getParentId(srcId);
	const cardId=srcId.substring(1);
	const srcValue=cardId%13;
	const srcColor=color(cardId);
	let j=0;
	let moved=false;
	while(j<7 && !moved) { // step through cascades until a move happens
		console.log("TryCascade j=",j,"srcId",srcId,srcValue,srcColor,parent.id);
		if(parentId!==("c"+j)){
			const n=nchildren("c"+j); // impure function
			if(n==0 && srcValue==12) moved=addStack(srcId,"c"+j);
			if(!moved && n){
				const topCardId=getTopId("c"+j).substring(1); // cardId at top of 
				const topValue=topCardId%13;
				const topColor=color(topCardId);
				console.log("Cascade srcId=",srcId,"j=",j,"top id=",topCardId,"val=",topValue,"color",topColor);
				if((topColor!==srcColor) && (topValue==(srcValue+1))) addStack(srcId,"c"+j);
			}
		}
		j++;
	}
	return moved;
}
function clearBoard(){ // pure function version
  for(j=0;j<7;j++) removeChildren("c"+j);
  for(j=0;j<3;j++) removeChildren("s"+j);
  for(j=0;j<4;j++) removeChildren("a"+j);
  removeChildren("r0");
}

