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
	for(let j=0; j<10; j++) cascades[j]=[]; // Make it a 2d array
	for(let i=0; i<54; i++) {j=i%10; cascades[j].push(deck[i]);}
	return cascades;
}

function initializeFaceups(cascades){
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

repaint(); // start the game

function repaint(){
	board.innerHTML=buildHTML(cascades,faceups);
};

// for timing reasons, these cannot be const arrow functions
function getSuit(card) {return Math.floor(card/13);}
function getVal(card){return card % 13;}
function getColor(card) {return (card<13 || card>38 ? "b" : "r");}

// var toMove = []; // array of cards to move
// var moves = [];
// document.getElementById("s0").innerHTML=back;
// createCardsSpider(localStorage.nsuit);
// showSuits();

// FUNCTIONS from top down	// make numbers bigger for phones
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
	// First row... cascades 7 to 14
//	let myHTML="<div class=row>"; // this builds everything below the buttons
//	const n7=cascades[7].length; // show the stockpile?
//	if(n7) {myHTML+="<div id=c7 class=card><img src=/back.jpg></div>";}
//	else {myHTML+="<div id=c7 class=card><h2>&nbsp;</h2><h1>♻</h1></div>";}
//	for(let j=8;j<15;j++) { // show next 3 and foundations if they are there
//		const n=cascades[j].length; // get the top card if any
//		if(n){
//			const topcard=cascades[j][n-1];
//			myHTML+="<div class=cell id=c"+j+">"+buildCard(topcard,j,0,true)+"</div>";
//			}
//		else{myHTML+="<div class=cell id=c"+j+"></div>";}
//	}
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



//function createCardsSpider(nsuit){
//	m=nsuit*13; // creates 13, 26 or 52 cards
//	for (i=0;i<m;i++) { // create 52 dif cards as strings in this array - innerHTML for divs
//			var suit=Math.floor(i/13);
//			var f='b'; if(suit==1 || suit==2) f='r'; // optionally paint the red suits red
//			var val = i % 13;
//			var ctr = (val<10) ? suits[suit] : faces[val-10];
//			cards[i]='<h2 class="'+f+'">'+vals[val]+' '+suits[suit]+'</h2><h1 class='+f+'>'+ctr+'</h1></div>';
//	}
//	for(i=0;i<ncards;i++) { // handle 52 and 104 items in deck
//		deck[i]=i%m;
//		flips[i]=0;
//	}
//}
//
//function deal(){ // does different things if the game has not already started
// 	clearBoard();
//	var i=0;
//	var m = setInterval(frame,30);
//	function frame() { // use interval to deal the cards slowly
//	if(i==44) {
//		clearInterval(m);
//		ndealt=44;
//	    next10();
//    }else{
//      	j=i%10;
//      	appendCard(i,j,0); // here i is the position in the deck, 0 means face down
//      	i++;
//    	}
//  	}
//}
function next10() { // put the next 10 face up
  if(ndealt<104) { // only do this if there are cards left
    var i=ndealt;
    var m = setInterval(frame,30);
    function frame() {
      if(i==(ndealt+10)) {
        clearInterval(m);
        ndealt=i;
        if(ndealt==104) document.getElementById("s0").innerHTML="";
      }else{
        j=i%10;
        appendCard(i,j,1);
        i++;
      }
      }
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
	
  function faceUp(j) { // make sure top card is face up on this cascade
    id=topCardId(j);
    if(id) {
      i=parseInt(id.substr(1));
      flips[i]=1;
      document.getElementById(id).innerHTML=cards[deck[i]];
    }
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

	function undo(){ // at the moment, this just works for cascade to cascade
		if(moves.length) {
			cardid=-1;
			move=moves.pop();
			cj=move[0]; j=move[1]; ck=move[2]; k=move[3]; n=move[4];
			if(cj=='c' && ck=='c') {
				toMove.length=0; // clear this array - a bit like remove stack
				nodes=document.getElementById('c'+k).childNodes;
				last=nodes.length-1; m=last-n+1;
				removeStack(k,m);
				appendStack(j,m);
			}
			if(cardid>-1 && cj=='c') {
				appendCard(cardid,j);
			}
		}
	}
	
	function moveUp(j,cardNo) { // move a whole stack of 13 cards to a foundation
	  cascade=document.getElementById('c'+j);
	  document.getElementById('f'+nfoundation).innerHTML=cards[deck[cardNo]];
	  nfoundation++;
	  for(i=0;i<13;i++) cascade.removeChild(cascade.lastChild);
	  faceUp(j);
	}
	

function tryMove(event) { // version .2 moves a stack by reading the z values
    cardNo=event.id.substring(1);
        console.log('cardNo='+cardNo);
      if(flips[cardNo]) { // first, learn about the clicked card
      	c1=deck[cardNo];
		v1=c1%13; // value of clicked card
		id='v'+cardNo; // node id
		card1=document.getElementById(id);
		z1=card1.style.zindex; // index within the nodes
		cascade1=card1.parentNode;
		j=parseInt(cascade1.id.substr(1));
		nodes=cascade1.childNodes;
		z2=nodes.length; // get the # of child nodes
		console.log('z1='+z1+' z2='+z2+' id='+id+' v1='+v1);

		// next - if this is more than one card, are they in the correct order?
		nmove=0;
		z=z1; v=v1; c=c1;
		while(z<z2 && !nmove) { // make sure items in stack can move together
			c2=deck[parseInt(nodes[z].id.substr(1))];
			console.log('Check z='+z+' c='+c+' c2='+c2);
			if(c!==(c2+1)) nmove=1;
			c=c2;
			z++;
		}
		if(!nmove && (v1==12) && ((z2-z1)==12)) { // detect a winning stack
			console.log('Winning stack '+j+' cardNo='+cardNo);
			moveUp(j,cardNo);
			nmove=13;
		}
		if(!nmove) {
			toMove.length=0;
			for(z=z1;z<=z2;z++) toMove.push( parseInt(nodes[z-1].id.substr(1)) );
		}
				if(!nmove && v1!==12) trySame(toMove,c1,j); // first try moving to same suit
				if(!nmove && nsuit>1 && v1!==12 ) tryStack(toMove,v1,j); // then consider not-same-suit columns
				if(!nmove) nmove=tryEmpty(toMove,j); // then consider empty columns
		}
		trywin();
	}
function trywin(){
	if(nfoundation==8)confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}
function topCardValue(m) { // return -1 on empty, or 0-12 value of top card
  cascade2=document.getElementById('c'+m);
  v2=-1;
  if(cascade2) card=cascade2.lastElementChild;
  if(card) v2=deck[ parseInt(card.id.substr(1))]%13;
  return v2;
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
  