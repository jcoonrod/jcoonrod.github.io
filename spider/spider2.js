// Convert spider to virtual dom version like classic
// Going back and fixing the old spider js
// The deck of 104 cards may only contain 13, 26 or 52 different cards
// so we need a second array to be able to map card to 
if(!localStorage.nsuit) localStorage.nsuit=2;
const nsuit=localStorage.nsuit;
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
function createContent(card,nsuit){ // card runs 0 to 103 in this case nsuits 1, 2 or 4
	const suits = ["♠","♥","♦","♣"];
	const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
	const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const ival=getVal(card);
	const sval=vals[ival]; // symbolic value
	const isuit=getSuit(card,nsuit);
	const suit=suits[isuit];
	const color=(suit=="♠" || suit=="♣" ? "b" : "r");
	const face=(ival<10 ? suit : faces[ival-10]);
	const content="<h2>"+sval+" "+suit+"</h2><h1>"+face+"</h1>";
	return content;
}

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
		moved=next10(cascades,faceups,card); // tests parent first
		if(!moved) moved=tryMove(cascades,card,parseInt(parent.id.substring(1)));	
		if(moved)repaint();
	};
});

repaint(); // start the game

function repaint(){
	board.innerHTML=buildHTML(cascades,faceups,nsuit);
};

// for timing reasons, these cannot be const arrow functions
// seriously modified for spider
function getSuit(card,nsuit) {
	if(nsuit==1) return 0; // only spades
	const n=Math.floor(card/13);
	if(nsuit==2) {const map=[0,1,1,0,0,1,1,0]; return map[n];}
	const map=[0,1,2,3,0,1,2,3];
	return map[n];}
function getVal(card){return card % 13;}
function getColor(card,nsuit) {
	const suit=getSuit(card,nsuit);
	return (suit==0 || suit==3 ? "b" : "r");}
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
function buildCard(card,j,iy,faceup,nsuit){ // change absolute width
	const s=(j<10 ? "position: absolute; width:100%; top:"+iy+"vw;" : "");
	if(faceup){
		const color=getColor(card,nsuit);
		return "<div class='card "+color+"' id=v"+card+" style='"+s+
		"'>"+createContent(card,nsuit)+"</div>";
	}else{
		return "<div class=card id=v"+card+" style='"+s+"'><img src=/back.jpg></div>";
	}
}

// convert the virtual DOM data to html -- must change the column class
function buildHTML(cascades,faceups,nsuit){ 
	let myHTML="<div class=row>\n";
	for(j=10;j<19;j++){
		myHTML+="<div id=c"+j+" class='card blueborder'>";
		const face=(j>10);
		//console.log("build j=",j,cascades[j]);
		const n=cascades[j].length;
		if(n) {
			card=cascades[j][n-1];
			myHTML+=buildCard(card,j,0,face,nsuit);
		}
		myHTML+="</div>\n";
	}
	myHTML+="</div><div class=row><table><tr><td>Stock pile +8 foundations</td>"
	+"</td></tr></table></div><div class=row>";
	for(let j=0;j<10;j++){
		const cascade=cascades[j];
		myHTML+="<div id=c"+j+" class=c>"; // create the column
		for(let i=0;i<cascade.length;i++) {
			const card=cascade[i];
			const face=faceups[card];
			myHTML+=buildCard(card,j,i*4,faceups[card],nsuit); // create each card in the cascade
		}
		myHTML+="</div>"; // end the cascade		
	}
	myHTML+="</div>"; // end the row
	return myHTML;
}

function next10(cascades,faceups,card) { // put the next 10 face up
	const i=cascades[10].indexOf(card);
	if(i<9) return false;
	for(let i=0;i<10;i++) {
		j=(i+4)%10;// which column
		card=cascades[10].pop();
		faceups[card]=true;
		cascades[j].push(card);
	}
	return true;
}
	
function moveUp(cascades,j1) { // move a whole stack of 13 cards to a foundation
	let j2=11;
	while(j2<19 && cascades[j2].length>0){
		//console.log("moveUp j2",j2); 
		j2++;}
	if(j2==19) return false; // already full? should be impossible
	const n1=cascades[j1].length-13; // must be 13 or more
	const chunk=cascades[j1].splice(n1);
	//console.log("chunk",chunk);
	if(n1>0) faceups[cascades[j1][n1-1]]=true;
	cascades[j2].push(...chunk);
}
	
function tryMove(cascades,card,j) {
	let moved=false; // local variable
	moved=tryAce(cascades,card,j,nsuit); // can we move a stack up?
	if(!moved) moved=tryCascade(cascades,card,j,true); // returns cascade number if one can move there
	if(!moved) moved=tryCascade(cascades,card,j,false); // returns cascade number if one can move there
	return moved;
}
// this should be easier as we are appending a splice to another array
function tryCascade(cascades,card,j1,same){ // move to another cascade if color same or different and value one above
	const value1=getVal(card);
	const suit1=getSuit(card,nsuit);
	const i1=cascades[j1].indexOf(card); // where i source cascade is it?
	let moved=false;
	for(let i2=1;i2<10;i2++) { // step through cascades rightward until a move happens
		const j2=(j1+i2)%10; // handle the rollaround rightward
		const n2=cascades[j2].length;
		if(n2==0 && value1==12) moved=moveAll(cascades,i1,j1,j2);
		if(n2 && !moved){
			const card2=cascades[j2][n2-1]; // get the topcard on destination
			const value2=getVal(card2);
			const suit2=getSuit(card2,nsuit);
			const ok=(same ? suit1==suit2 : suit1!==suit2)
			if(ok && (value2==(value1+1))) moved=moveAll(cascades,i1,j1,j2);
		}
	}
	return moved;
}

function moveAll(cascades,i1,j1,j2){ // move all the children to reserve
	const chunk=cascades[j1].splice(i1);
	cascades[j2].push(...chunk);
	const n1=cascades[j1].length;
	if(n1) faceups[cascades[j1][n1-1]]=true; // flip last card faceup
	return true
}


function tryAce(cascades,card,j,nsuit){ // try moving up 13 cards 
	let moved=false;
	const suit=getSuit(card,nsuit);
	const start=cascades[j].length-13; // start of stack position
	if(start<0) return false; // short cascades won't work
	let i=0; // i marches through the cascade to see if it is moveable
	//console.log("tryace card",card,"j",j,"suit",suit,"start",start);
	while(!moved && i<13) {
		const card2=cascades[j][start+i];
		const suit2=getSuit(card2,nsuit);
		const val2=getVal(card2);
		//console.log("tryAce i",i,"card2",card2,"val2",val2,"suit2",suit2);
		if(val2!==(12-i) || suit2!==suit) return false
		i++;
	}
	if(i==13)moved=moveUp(cascades,j);
	return true;
}

function trywin(){
	let n=0; // how many have moved up?
	for(let j=11;j<19;j++) if(cascades[j].length) n++;
	if(n==8)confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}
