const deck=shuffle(104); // new pure function creates a shuffled deck;
deal(deck); // deal the first 54 to the cascades and 50 to the reserve

function tryWin(){
	const win=nchildren("a0")+nchildren("a1")+nchildren("a2")+nchildren("a3");
	console.log("Win?",win);
	if(win==52) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}

// pure next10 function
function next10(){
	let n=nchildren("r0"); // How many in reserve?
	if(n){
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

function shuffle(n){
	let deck=[];
	for (let i=0; i<n; i++) deck[i]=i;
	for (let i=0; i<n; i++) { // do lots random interchanges
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
	for(let i=0;i<54;i++){
		const cardId=deck[i];
		const j=i%10;
		const iy=Math.floor(i/10)*5;
		const content=createContent(cardId%52);
		console.log("deal i=",i,"cardId=",cardId,"j=",j);
		dealCard("c"+j,"v"+cardId,iy,content,color(cardId%52),(i>43)); // faceUp
	}
	for(let i=54;i<104;i++){
		cardId=deck[i];
		dealCard("r0","v"+cardId,0,"<img src=/back.jpg>",color(cardId),0);
	}
}

// try to make this clear
function tryMove(srcId) { // When cascade card is clicked. Must delete it before it can be appended
	let moved=false; // local variable
	moved=tryAce(srcId);
	if(!moved) moved=tryCascade(srcId); // returns cascade number if one can move there
	return moved;
}
function tryAce(srcId){ // we have to deal with 104 cards and 8 foundations
	let moved=false;
	const oldParentId=getParentId(srcId); c0-c7
	const cardId=srcId.substring(1)%52; // just 0-52
	const value=cardNo%13;
	const foundationId=Math.floor(srcId.substring(1)/13); 0-7;
	const suit=Math.floor(srcId.substring(1)/13);
	const foundation="a"+foundationId;
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

