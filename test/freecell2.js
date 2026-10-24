// vdom freecell, copying much from Classic

const deck=shuffle();
let cascades=deal(deck);
const board=document.getElementById("board");
repaint();
function repaint(){
	board.innerHTML=buildHTML(cascades);
};

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
		console.log("build j=",j);
		const n=cascades[j].length; // get the top card if any
		myHTML+="<div class=cell id=c"+j+"></div>";
	}
	myHTML+=`</div><div class=row><table><tr>
		<td>Four FreeCells <span id=message></span></td>
		<td>Foundations: ♠ ♥ ♦ ♣</td></tr></table></div>
		<div class=row>`;
	for(let j=0;j<8;j++){
		console.log("build j=",j);
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

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}

function tryMove(cascades,card,j) {
	let moved=false; // local variable
	moved=tryAce(cascades,card,j);
	const color=getColor(card); 
	const other=(color=='b' ? 'r' : 'b');
	const val=getVal(card);
	if(!moved) moved=tryCascade(cascades,val,j,color); // returns cascade number if one can move there
	if(!moved) moved=tryCascade(cascades,val,j,other);
	if(!moved) moved=tryFree(card);
	return moved;
}

function tryCascade(cascades,val,j,color){ // returns moved
	let i=1; 
	let moved=false;
	while(!moved && i<8){
		const j2=j+i;
		if(j2>7) j2=j2=8;
		const n=cascades[j2].length;
		const val2=cascades[j2][n-1];
		i++;
	}
}

// this should be easier as we are appending a splice to another array
function tryCascade(cascades,card,j1){ // move to another cascade if color mismatch and value one above
	console.log("tryCascade",card,j1);
	const value1=getVal(card);
	const color1=getColor(card);
	const i1=cascades[j1].indexOf(card); // where i source cascade is it?
	let moved=false;
	for(let j2=0;j2<7;j2++) { // step through cascades until a move happens
		n2=cascades[j2].length;
		console.log("try cascade=",cascades[j1],"card=",card,"i1=",i1,"j1 j2=",j1,j2,"n2=",n2);
		if(n2==0 && value1==12) moved=moveAll(cascades,i1,j1,j2);
		if(n2 && !moved){
			const card2=cascades[j2][n2-1]; // get the topcard on destination
			const value2=getVal(card2);
			const color2=getColor(card2);
			console.log("color2=",color2,"value2=",value2);
			if((color2!==color1) && (value2==(value1+1))) moved=moveAll(cascades,i1,j1,j2);
		}
	}
	return moved;
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
	const value=getVal(card);
	const suit=getSuit(card);
	const j2=11+suit;
	const n2=cascades[j2].length;
	foundation_level=(n2 ? getVal(cascades[j2][n2-1]) :-1); 
//	console.log("tryAce suit=",suit,"value=",value);
	if(value==(foundation_level+1)) {
		cascades[j2].push(cascades[j].pop());
		moved=true;
		tryWin(cascades);
	}
//	console.log("tryAce moved=",moved);
	return moved;
}

function tryWin(cascades){
	win=cascades[12].length+cascades[13].length+cascades[14].length+cascades[15].length;
	console.log("Win?",win);
	if(win==52) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
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
		console.log("tryMove",card,parent.id.substring(1));
		moved=tryMove(cascades,card,parseInt(parent.id.substring(1)));
	}else if(ctype=='s'){ // is it on a freecell?
		tryDrop(cascades);
		moved=true;
	if(moved)repaint();
}});


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

function clearBoard(){ // pure function
	removeChildren("board");
}

