// pure function version of freecell, copying much from Classic
// changes from classic - 8 columns instead of 7, limit on stack move, no faceup needed
// Any card or stack can drop to an empty column, not just kings 
const deck=shuffle();
deal(deck); 

function deal(deck){ // this moves slowly on purpose
    for(i=0;i<52;i++){
        const j=i%8; // which cascade?
        const cardId=deck[i];
        const content=createContent(cardId);
        const iy=5*Math.floor(i/8);
        console.log("deal i="+i+" cardId="+cardId+" j="+j);
        dealCard("c"+j,"v"+cardId,iy,content,color(cardId),1)
    }
}

function tryWin(){
	const win=nchildren("a0")+nchildren("a1")+nchildren("a2")+nchildren("a3");
	console.log("Win?",win);
	if(win==52) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
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

// try to make this clear
function tryMove(srcId) { // When cascade card is clicked. Must delete it before it can be appended
	let moved=false; // local variable
	const srcType=srcId.substring(0,1);
	console.log("tryMove srcId=",srcId,"type",srcType);
	moved=tryAce(srcId);
	if(!moved) moved=tryCascade(srcId,8); // returns true if moved
  if(!moved && srcType!=='s') moved=tryFree(srcId); // try moving it to a freecell if any are free
	return moved;
}

function tryFree(srcId){ // only a top card can move to a freecell
  let i=0;
  let moved=false;
  const parentId=getParentId(srcId);
  const top=getTopId(parentId);
  console.log("tryFree srcId=",srcId," Parent",parentId,"top",top);
  const ontop=(srcId==top);
  while(ontop && i<4 && !moved) { // check each possible freecell
    const destId="s"+i;
    console.log("tryFree srcId="+srcId+" destId="+destId);
    if(!nchildren(destId)) moved=addCard(srcId,destId,0);
    i++;
  }
  return moved;
}

function tryAce(srcId){
	let moved=false;
	const oldParent=getParentId(srcId);
	const cardNo=srcId.substring(1);
	const value=cardNo%13;
	const suit=Math.floor(srcId.substring(1)/13);
	const foundation="a"+suit;
	const foundation_level=nchildren(foundation);
	console.log("tryAce suit=",suit,"value=",value,"foundation_level",foundation_level);
	if(value==foundation_level) {
		addCard(srcId,foundation,0);
//		faceUp(oldParent.id);
		moved=true;
		tryWin();
	}
	console.log("tryAce moved=",moved);
	return moved;
}

function getMoveable(){ // how big a stack can freecell move?
	let n=0; // first, how many free cells are open?
	let m=0; // and how many cascades are open?
	for(let i=0;i<4;i++) if(nchildren("s"+i)==0) n++;
	for(let i=0;i<8;i++) if(nchildren("c"+i)==0) m++;
	return (n+1)*(2**m);
}

function addStack(srcId,destId){ // add a stack starting with srcId to dest cascade	
	let moved=false;
	showMessage("");
	const nmax=getMoveable(); // compute maximum size of stack move
	const oldParentId=getParentId(srcId);
	const n=nchildren(destId);
	const stack=getStack(srcId); // get arracy of cards to will move
	if(nmax>=stack.length) {
		for (i=0;i<stack.length;i++) moved=addCard(stack[i],destId,(n+i)*5);
	}else{
		showMessage("ERROR: TOO MANY TO MOVE");
	}
	return moved;
}
// unlike classical, any card can go to an empty slot
function tryCascade(srcId){ // move to another cascade if color mismatch and value one above
	const parentId=getParentId(srcId);
	const cardId=srcId.substring(1);
	const srcValue=cardId%13;
	const srcColor=color(cardId);
	let j=0;
	let moved=false;
	while(j<8 && !moved) { // step through cascades until a move happens
		console.log("TryCascade j=",j,"srcId",srcId,srcValue,srcColor,parentId);
		if(parent.id!==("c"+j)){ // ignore your own cascade
			const n=nchildren("c"+j); // impure function
			if(n==0) moved=addStack(srcId,"c"+j);
			if(!moved && n){
				const topCardId=getTopId("c"+j).substring(1); // cardId at top of 
				const topValue=topCardId%13;
				const topColor=color(topCardId);
				console.log("Cascade srcId=",srcId,"j=",j,"top id=",topCardId,"val=",topValue,"color",topColor);
				if((topColor!==srcColor) && (topValue==(srcValue+1))) moved=addStack(srcId,"c"+j);
			}
		}
		j++;
	}
	return moved;
}
function clearBoard(){ // no r0
  for(j=0;j<8;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
	console.log("clearBoard j",j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<4;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
}

