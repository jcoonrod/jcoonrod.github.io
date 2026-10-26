// vdom freecell, copying much from Classic
// a moveable stack must be the same suit
const board=document.getElementById("board");
board.addEventListener('click', function(event) { // impure click handler
	const div = event.target.closest('.card'); 
	if (!div) return;
	const parent=div.parentElement;
	console.log(`Player clicked ${div.id} parent ${parent.id}`);
	// now do the logic
	const ctype=div.id.substring(0,1);
	const card=parseInt(div.id.substring(1)); // this should be an integer
	let moved=false;
	if(ctype=='v'){ // the playing card ids
		console.log("tryMove v",card,parent.id.substring(1));
		moved=tryMove(cascades,card,parseInt(parent.id.substring(1)));
	}
	if(moved){repaint();processFoundationJumps();}
});

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return (card==-1 ? -1 : card % 13);}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}
function getTopCard(cascade){ // just call it with 1-d array
	if(cascade.length==0) return -1;
	return cascade[cascade.length-1];
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function processFoundationJumps() {
	console.log("processFoundationJumps");
    await sleep(300);
	const moved=tryjump(cascades); 
    if(moved) {
		repaint();
        await processFoundationJumps(); 
    }
}

// initial game play
const deck=shuffle();
console.log(deck);
var cascades=deal(deck);
repaint();
processFoundationJumps();

function tryjump(cascades){
	moved=false;
	let j=0;
	while(!moved && j<12) {
		card=getTopCard(cascades[j]);
		console.log("tryJump",j,"card",card);
		if(card!==-1){
			topVal=getVal(card);
			topSuit=getSuit(card);
			topFoundation=getTopCard(cascades[12+topSuit]);
			console.log("val",topVal,"suit",topSuit,"topFoundation",topFoundation);
			if(topVal==getVal(topFoundation)+1) {
				moved=true;
				console.log("moved to suit",topSuit);
				cascades[12+topSuit].push(cascades[j].pop());
				repaint();
			}
		}
		j++;
	}
	return moved;
}

function repaint(){
	console.log("repaint");
	board.innerHTML=buildHTML(cascades);
};

function tryFree(cascades,card,j){ // is there a free freecell to move to?
	let moved=false;
	let j2=8;
	console.log("tryFree",card,j)
	while(j2<12 && !moved){
		if(cascades[j2].length==0){
			cascades[j2][0]=cascades[j].pop();
			moved=true;
		}
		j2++;
	}
	return moved;
}

function deal(deck){
	let cascades=[[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[]]; // 8 in foundation + 4 freecells + 4 aces
	for(i=0;i<52;i++){
		const j=i%8; // which cascade?
		cascades[j].push(deck[i]);
	}
	return cascades;
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

// convert the virtual DOM data to html
function buildHTML(cascades){ // differs from classic 
	// First row... cascades 8 to 15 no iy
	let myHTML='<div class=row>';
	for(let j=8;j<16;j++) { // show next 4 and foundations if they are there
	//	console.log("build j=",j);
		myHTML+="<div class=cell id=c"+j+">";
		const n=cascades[j].length; // get the top card if any
		if(n){
			card=cascades[j][n-1];
			console.log("top of",j,card);
			myHTML+=buildCard(card,j,0,true);
		}
		myHTML+="</div>";
	}
	myHTML+=`</div><div class=row><table><tr>
		<td>Four FreeCells <span id=message></span></td>
		<td>Foundations: ♠ ♥ ♦ ♣</td></tr></table></div>
		<div class=row>`;
	for(let j=0;j<8;j++){
	//	console.log("build j=",j);
		const cascade=cascades[j];
		myHTML+="<div  id=c"+j+" class=c>"; // create the column
		for(let i=0;i<cascade.length;i++) {
			const card=cascade[i];
			myHTML+=buildCard(card,j,i*5,true); // create each card in the cascade
		}
		myHTML+="</div>"; // end the cascade		
	}
	myHTML+="</div>"; // end the row
	return myHTML;
}

function tryMove(cascades,card,j) { // can the clicked item move?
	// first, is it a top card or a stack of the same suit?
	let moved=false; // local variable
	const topCard=getTopCard(cascades[j]); // return -1 if cascade is empty
	console.log("tryMove",card,j,topCard);
	if(card==topCard) {
		moved=tryAce(cascades,card,j); // only top card is eligible
		if(!moved) moved=tryCascade(cascades,card,j); // returns cascade number if one can move there
		console.log("triedCascade",moved);
		if(!moved) moved=tryFree(cascades,card,j);
	}
	else moved=tryStack(cascades,card,j);
	return moved;
}

function getMaxStack(cascades) {
	// (N + 1) times 2^M where N # free cells and M is # free columns
	let n=0; // number of free cells
	let m=0; // number of open columns
	for(let i=0;i<8;i++) if(cascades[i].length==0) m++;
	for(i=8;i<12;i++) if(cascades[i].length==0) n++;
	const maxStack=(n+1)*(2**m);
	console.log("maxStack",maxStack, "n,m",n,m,);
	return maxStack;
}

function tryStack(cascades,card,j){
	let moved=false;
	if(testStack(cascades,card,j)){
		const maxStack=getMaxStack(cascades);
		const j2=scanColumns(cascades,card,j); // is there a place to move the stack? 
		if(j2!==j) { // fail in scan returns j2==j
			const ii=cascades[j].indexOf(card);
			const n=cascades[j].length-ii;
			if(n<=maxStack){
				const chunk=cascades[j].splice(ii);
				cascades[j2].push(...chunk);
				moved=true;
			}
		}
	}
	return moved;
}

function scanColumns(cascades,card,j){
	const val=getVal(card); 
	const color=getColor(card);
	let i=1; let moveable=false;
	let j2=j;
	while (i<8 && !moveable){
		j2=(j+i)%8;
		const n=cascades[j2].length;
		moveable=(n==0); // can move anything to empty cascade
		if(!moveable) {
			const val2=getVal(cascades[j2][n-1]);
			const color2=getColor(cascades[j2][n-1]);
			console.log("scan",j2,n,val2,color2);
			moveable=(val2==(val+1) && color2!==color);
		}
		i++;
	}
	console.log("scanned",j2,moveable);
	return (moveable ? j2 : j);
}

function testStack(cascades,card,j){ //
	//does the stack follow the color/alternate and value rules?
	const i=cascades[j].indexOf(card);
	const n=cascades[j].length;
	let legit=true; let k=i; 
	while(legit && k<(n-1)){
		let l=k+1;
		legit=(getVal(cascades[j][k])==getVal(cascades[j][l]+1) 
			&& getColor(cascades[j][k])!==getColor(cascades[j][l]) );
		k++;
	}
	return legit;
}
function tryCascade(cascades,card,j){ // returns moved
	const j2=scanColumns(cascades,card,j);
	console.log("tryCascade",j,j2);
	if(j2!==j) {
		cascades[j2].push(cascades[j].pop());
		return true;
	}
	return false;
}

function moveAll(cascades,i1,j1,j2){ // move all the j1 children to j2 
	const chunk=cascades[j1].splice(i1);
	console.log("moveAll",i1,j1,j2,"chunk=",chunk);
	cascades[j2].push(...chunk);
	const n1=cascades[j1].length;
	return true
}

function tryAce(cascades,card,j){
	let moved=false;
	const cascade=cascades[j];
	const n=cascade.length;
	const topcard=cascade[n-1];
	if(card!==topcard) return; // hop out if this isn't a topcard
	const value=getVal(card);
	const suit=getSuit(card);
	const j2=12+suit;
	const n2=cascades[j2].length;
	foundation_level=(n2 ? getVal(cascades[j2][n2-1]) :-1); 
	console.log("tryAce suit=",suit,"value=",value,'foundation_level',foundation_level);
	if(value==(foundation_level+1)) {
		cascades[j2].push(cascades[j].pop());
		moved=true;
		tryWin(cascades);
	}
	console.log("tryAce moved=",moved);
	return moved;
}

function tryWin(cascades){
	win=cascades[12].length+cascades[13].length+cascades[14].length+cascades[15].length;
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
	console.log('shuffle',deck.length);
	return deck;
}

function clearBoard(){ // pure function
	removeChildren("board");
}
