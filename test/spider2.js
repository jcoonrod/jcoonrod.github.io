// Convert spider to virtual dom version like classic
// Going back and fixing the old spider js
// The deck of 104 cards may only contain 13, 26 or 52 different cards
// so we need a second array to be able to map card to 
if(!localStorage.nsuit) localStorage.nsuit=2;
showSuits(); // bring and and fix localStorage as needed
const deck=shuffle(); // new pure function creates a shuffled 104 cards set by suits;
var cascades=deal(deck); // put the first 54 cards in 10 cascades and 50 in cascade[10];
var faceups=initializeFaceups(cascades); // determine faceup status of each card
const board=document.getElementById("board");

function shuffle(){ 
	let deck=[];
	for (let i=0; i<104; i++) deck[i]=i;
	for (let i=0; i<104; i++) { // do lots random interchanges
		const j=Math.floor(Math.random() * 104);
		[deck[i],deck[j]]=[deck[j],deck[i]];
    }
	return deck;
}

function deal(deck){
	let cascades=[];
	for(let j=0; j<19; j++) cascades[j]=[]; // Make it a 2d array
	for(let i=0; i<54; i++) {j=i%10; cascades[j].push(deck[i]);}
	for(let i=54; i<104; i++) cascades[10].push(deck[i]);
	return cascades;
}

function initializeFaceups(cascades){ // turn the top cards up
	let faces=[];
	for(i=0;i<104;i++) faces[i]=false;
	for(j=0;j<10;j++) {
		const cascade=cascades[j];
		faces[cascade[cascade.length-1]]=true;
	}
	return faces; 
}

// pure functions mostly replacing the old common.js functions for now
function createContent(i,nsuits){ // i runs 0 to 103 in this case nsuits 1, 2 or 4
	const imax=13*localStorage.nsuit;
	const iactual=i%imax;
	const suits = ["♠","♥","♦","♣"];
	const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
	const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const n=i%13; // index within the suit
	const value=vals[i%13];
	const suit=suits[Math.floor(iactual/13)];
	const color=(suit=="♠" || suit=="♣" ? "b" : "r");
	const face=(n<10 ? suit : faces[i%13-10]);
	const content="<h2>"+value+" "+suit+"</h2><h1>"+face+"</h1>";
	return content;
}


board.addEventListener('click', function(event) { // impure click handler
	const div = event.target.closest('.card'); 
	// If the user clicked the board background instead of a card, exit early
	if (!div) return;
	const parent=div.parentElement;
	console.log(`Player clicked ${div.id} parent ${parent.id}`);
	// now do the logic
	const ctype=div.id.substring(0,1);
	const card=parseInt(div.id.substring(1)); // this should be an integer
	let moved=false;
	if(ctype=='v'){ // the playing card ids
	console.log("tryMove",card,parent.id.substring(1));
	moved=tryMove(cascades,card,parseInt(parent.id.substring(1)));	
	if(moved)repaint();
	};
});

repaint(); // start the game

function repaint(){
	board.innerHTML=buildHTML(cascades,faceups);
};

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}
function getTopCard(cascade){ // just call it with 1-d array
	if(cascade.length==0) return -1;
	return cascade[cascade.length-1];
}

function showScores(){
	let w=localStorage.wins;
	let t=localStorage.times;
	sofar.innerHTML=localStorage.wins+'/'+localStorage.times;
}

function changeSuits(){
	if(localStorage.nsuit==2) {localStorage.nsuit=4;}
	else if(localStorage.nsuit==4) {localStorage.nsuit=1;}
	else{localStorage.nsuit=2;}
	showSuits();
}
function showSuits() { // an impure function
	const suits=['♠','♥','♦','♣'];
	suitlist=suits[0];
	if(localStorage.nsuit>1) suitlist+=suits[1];
	if(localStorage.nsuit==4) suitlist+=suits[2]+suits[3];
	document.getElementById("suitlist").innerHTML=suitlist;
	return suitlist
}		
function buildCard(card,j,iy,faceup){ // change absolute width
	const s=(j<10 ? "position: absolute; width:100%; top:"+iy+"vw;" : "");
	if(faceup){
		const color=getColor(card);
		return "<div class='card "+color+"' id=v"+card+" style='"+s+
		"'>"+createContent(card)+"</div>";
	}else{
		return "<div class=card id=v"+card+" style='"+s+"'><img src=/back.jpg></div>";
	}
}

// convert the virtual DOM data to html -- must change the column class
function buildHTML(cascades,faceups){ 
	let myHTML="<div class=row>\n";
	const blank="<"
	for(j=10;j<19;j++){
		myHTML+="<div id=c"+j+" class='card blueborder'>"
		const face=(j>10);
		console.log("build j=",j,cascades[j]);
		const n=cascades[j].length;
		if(n) {
			card=cascades[j][n-1];
			myHTML+=buildCard(card,j,0,face);
		}
		myHTML+="</div>\n";
	}
	myHTML="</div><div class=row><table><tr><td>Stock pile +8 foundations</td>"
	+"</td></tr></table></div><div class=row>";
	for(let j=0;j<10;j++){
		const cascade=cascades[j];
		myHTML+="<div  id=c"+j+" class=c10>"; // create the column
		for(let i=0;i<cascade.length;i++) {
			const card=cascade[i];
			const face=faceups[card];
			myHTML+=buildCard(card,j,i*5,faceups[card]); // create each card in the cascade
		}
		myHTML+="</div>"; // end the cascade		
	}
	myHTML+="</div>"; // end the row
	return myHTML;
}


function next10() { // put the next 10 face up
	for(let i=0;i<10;i++) {
		j=(i+4)%10;// which column
		card=cascades[10].pop();
		faceup[card]=true;
		cascades[j].push(card);
	}
}

function clearBoard(){
    nfoundation=0; // how many foundation piles have gone up?
	moves.length=0; // clear these working arrays
	toMove.length=0;
	document.getElementById('s0').innerHTML=back;
    for(j=0;j<10;j++) { // clear cascades
        const cascade=document.getElementById("c"+j);
        while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
    }
    for(j=0;j<8;j++) document.getElementById("f"+j).innerHTML="";
}
	
function moveUp(cascades,j1) { // move a whole stack of 13 cards to a foundation
	let j2=11;
	while(j2<19 && cascades[j2].length) j2++;
	n1=cascades[j1].length-13; // must be 13 or more
	chunk=cascades[j1].splice(n1);
	if(n1) faceups[cascades[j1][n1-1]]=true;
}
	
function tryMove(cascades,card,j) {
	let moved=false; // local variable
	moved=tryAce(cascades,card,j); // can we move a stack up?
	if(!moved) moved=tryCascade(cascades,card,j); // returns cascade number if one can move there
	return moved;
}

function tryAce(cascades,card,j){ // try moving up 13 cards 
	let moved=false;
	const suit=getSuit[card];
	let i=cascades[j].length-13; // start of stack
	while(!moved && i && getSuit[cascades[j][i]]==suit && getVal[cascades[j][i]==(12-i)]) i++;
	if(i==13)moveUp(cascades,j);
}

function trywin(){
	let n=0; // how many have moved up?
	for(let j=11;j<19;j++) if(cascades[j].length) n++;
	if(n==8)confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}

function trySame(toMove,c1,j) { // Try moving stack to the same suit
  nmove=0;
  k=1;  // first run through possible stack-to-stack moves
	while(k<10 && !nmove) {
		m=(j+k)%10; // next cascade to the right
  		k++;
		c2=deck[topCardId(m).substr(1)];
		console.log("Same k="+k+" c1="+c1+" c2="+c2);
		if(c2==(c1+1)) nmove=moveStack(toMove,j,m);
    }
    return nmove;
}
	// 11/24 - include moves to empty in the same scan
function tryStack(toMove,v1,j) {
	nmove=0;
	k=1;  // first run through possible stack-to-stack moves
    while(k<10 && !nmove) {
      m=(j+k)%10; // next cascade to the right
      k++;
			if(topCardValue(m)==-1) {nmove=moveStack(toMove,j,m);}
			else {
				v2=topCardValue(m);
				console.log("Stack k="+k+" v1="+v1+" v2="+v2);
    	  if(v2==(v1+1)) nmove=moveStack(toMove,j,m);
			}
    }
    return nmove;
}
function tryEmpty(toMove,j) {
    k=1; // second, run through possible empty stack moves
    while(k<10 && !nmove) { // first run through possible stack-to-stack moves
        m=(j+k)%10; // next cascade to the right
        k++;
        if(topCardValue(m)==-1) nmove=moveStack(toMove,j,m);
    }
}

function moveStack(toMove,j,m){
	console.log("moveStack j="+j+" m="+m);
	cascade1=document.getElementById('c'+j);
	for(i=0;i<toMove.length;i++) cascade1.removeChild(cascade1.lastChild);
	for(i=0;i<toMove.length;i++) appendCard(toMove[i],m,1);
    faceUp( parseInt(cascade1.id.substr(1)) ); // flip the top card in cascade j if not already flipped
    return 1;
  }
function appendCard(i,j,up) { // add a card position i in the deck to the end of cascade j
	  //when i>43, deal face up
	    const cascade=document.getElementById("c"+j);
		z=cascade.childElementCount+1;
    var card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[i]];flips[i]=1;}else{card.innerHTML="<img width=100% src=/back.jpg>";flips[i]=0;}
    card.id="v"+i;
    card.classList.add("card");
    card.style.zindex=z.toString();
    card.style.position='absolute';
    card.setAttribute("onclick","tryMove(this);");
    card.style.width='100%';
    y=(z-1)*5;
    card.style.top=y.toString()+"vw";
    cascade.appendChild(card);
	}


  // Run through to see if any top cards can jump to the ace pile
  function topCardId(j){
    cascade=document.getElementById("c"+j);
    topCard = cascade.lastChild;
    return (topCard) ? topCard.id : ''; // what card is it? v0...
  }
  