// NEXT: change addCard to addStack
// New project to go with pure functions only and remove the common script for now
// for now, we will have to pass state variable in as parameters to minimize global variables
// 1. Auto start on load
// 2. On "new" button force a reload
// 3. Change card div numbering to match the card index, making it easy to reveal color and value
// 4. Create each card as they dealt 
// 5. The flipped up cards are children of a span with id flipped
// 6. A new pure shuffled deck is assigned to deck
// 7. all impure functions now in /impure.js

const deck=shuffle(); // new pure function creates a shuffled deck;
deal(deck); // deal the first 28 to the cascades and 24 to the reserve

// pure next3 function
function next3(){
	let n=nchildren("r0"); // How many in reserve?
	if(n==0){
		moveAll("s0","r0");
		moveAll("s1","r0");
		moveAll("s2","r0");
	}
	n=nchildren("r0");
	if(n==0) { //if this happens, we are done
		resetCard("r0","<h2>Reserve Empty.</h2>");
	}else {
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

function deal(deck){
	let ndealt=0;
	for (j=0;j<7;j++){ // j here indicated which cascade
		iy=5*j;
		let cardId=deck[ndealt];
		const content=createContent(cardId);		
		dealCard("c"+j,"v"+cardId,iy,content,color(cardId),1); // faceUp
		ndealt++;
		for (i=j+1;i<7;i++){ // the rest of the row takes default face down
			cardId=deck[ndealt];
			dealCard("c"+i,"v"+cardId,iy,"<img src=/back.jpg>",color(cardId),0); // not clickable
			ndealt++;
		}
	}
	while(ndealt<52){
		cardId=deck[ndealt];
		dealCard("r0","v"+cardId,0,"<img src=/back.jpg>",color(cardId),0);
		ndealt++;
	}
}

// try to make this clear
function tryMove(srcId) { // When cascade card is clicked. Must delete it before it can be appended
	let moved=false; // must be local
	moved=tryAce(srcId);
	if(!moved) moved=tryCascade(srcId); // returns cascade number if one can move there
	return moved;
}
function tryAce(srcId){
	let moved=false;
	const oldParent=getParent(srcId);
	const cardNo=srcId.substring(1);
	const value=cardNo%13;
	const suit=Math.floor(srcId.substring(1)/13);
	const foundation="a"+suit;
	const foundation_level=nchildren(foundation);
	console.log("tryAce suit=",suit,"value=",value,"foundation_level",foundation_level);
	if(value==foundation_level) {
		addCard(srcId,foundation,0);
		faceUp(oldParent.id);
		moved=true;
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

function tryCascade(srcId){ // move to another cascade if color mismatch and value one above
	const parent=getParent(srcId);
	const cardId=srcId.substring(1);
	const srcValue=cardId%13;
	const srcColor=color(cardId);
	console.log("TryCascade ",srcId,srcValue,srcColor,parent.id);
	j=0;
	let moved=false;
	while(j<7 && !moved) { // step through cascades until a move happens
		n=nchildren("c"+j); // new impure function
		if(n==0 && srcValue==12) {
			moved=addCard(srcId,"c"+j,0); // add to empty cascade
			faceUp(parentId); 
		}
		if(!moved && n){
			const topCardId=getTopId("c"+j).substring(1); // cardId at top of 
			const topValue=topCardId%13;
			const topColor=color(topCardId);
			console.log("Cascade ",j,topCardId,topValue,topColor);
			if((topColor!==srcColor) && (topValue==(srcValue+1))) {
				moved=addCard(srcId,"c"+j,n*5);
				faceUp(parent.id);
			}
		}
		j++;
	}
	return moved;
}
function clearBoard(){	document.getElementById('r0').innerHTML=back;
  for(j=0;j<ncol;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<3;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
  document.getElementById("r0").innerHTML="";
}

