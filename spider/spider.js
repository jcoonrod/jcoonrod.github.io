// Functions and actions in Spider
// OK - everything is messed up - 8/26 - let's do one move at a time.
const demo=document.getElementById("demo");
const expiry="Fri, 01 Jan 2038 00:00:01 GMT";
const sofar=document.getElementById("sofar");
const ncards=104;
const ncol=10;
if(localStorage.times==null) localStorage.times=0;
if(localStorage.wins==null) localStorage.wins=0;
if(localStorage.nsuit==null) localStorage.nsuit=2; //default number of suits
var moves = [];
var toMove = []; // array of cards to move
var nfoundation=0; // how many foundation piles have gone up?
var nempty = 0; // computed # empty cascades
var first=0; // index within the nodes for the first that could be moved
var last=0; // " the top card
document.getElementById("s0").innerHTML=back;
createCardsSpider(localStorage.nsuit);
showSuits();
showScores();


function createCardsSpider(nsuit){
	m=nsuit*13; // creates 13, 26 or 52 cards
	for (i=0;i<m;i++) { // create 52 dif cards as strings in this array - innerHTML for divs
			var suit=Math.floor(i/13);
			var f='b'; if(suit==1 || suit==2) f='r'; // optionally paint the red suits red
			var val = i % 13;
			var ctr = (val<10) ? suits[suit] : faces[val-10];
			cards[i]='<h2 class="'+f+'">'+vals[val]+' '+suits[suit]+'</h2><h1 class='+f+'>'+ctr+'</h1></div>';
	}
	for(i=0;i<ncards;i++) { // handle 52 and 104 items in deck
		deck[i]=i%m;
		flips[i]=0;
	}
}

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
	createCardsSpider(localStorage.nsuit);
}
function showSuits() {
	suitlist=suits[0];
	if(localStorage.nsuit>1) suitlist+=suits[1];
	if(localStorage.nsuit==4) suitlist+=suits[2]+suits[3];
	document.getElementById("suitlist").innerHTML=suitlist;
}		
// specialized functions for Spider
function deal(){ // does different things if the game has not already started
 	clearBoard();
	var i=0;
	var m = setInterval(frame,30);
	function frame() { // use interval to deal the cards slowly
	if(i==44) {
		clearInterval(m);
		ndealt=44;
	    next10();
    }else{
      	j=i%10;
      	appendCard(i,j,0); // here i is the position in the deck, 0 means face down
      	i++;
    	}
  	}
}
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

function tryFoundation(j,value) { // move a whole stack of 13 cards to a foundation
	console.log("tryFoundation j="+j+" value="+value);
	cascade=document.getElementById('c'+j);
	value2=getVal(cascade.lastChild.id);
	if(value==12 && value2==0) {
  		document.getElementById('f'+nfoundation).innerHTML=cards[deck[cardNo]];
  		nfoundation++;
  		for(i=0;i<13;i++) cascade.removeChild(cascade.lastChild);
		if(cascade.childElementCount) flipup(cascade.lastChild.id);
	}
}	

function tryMove(event) { // When cascade card is clicked. Must delete it before it can be appended
	eventId1=event.id; // which card was clicked?
	parent1=event.parentNode;
	j1=parent1.id.substring(1);
	nmove=0; // nothing has moved yet
// temporary - just move the top card now, not the clicked stack
//	cardNo1=parseInt(eventId1.substring(1)); // learn all about the clicked card
	cardNo1=lastChildId(j1).substring(1);
	cardId1=deck[cardNo1];
	const suit1=getSuit(cardId1);
	const color1=getColor(cardId1); // optionally paint the red suits red
	const value1=getVal(cardId1); 
	console.log("trymove cardId1="+cardId1+" value1="+value1);
	nmove=tryFoundation(j1,value1);
	if(!nmove) nmove=trySame(eventId1,j1,suit1,value1);
	if(!nmove) nmove=tryNotSame(eventId1,j1,suit1,value1);
}
function trySame(eventId,j1,suit1,value1) { // Try moving stack to the same suit
	console.log("trySame eventId="+eventId+" j1="+j1+" suit1="+suit1+" value1="+value1);
	nmove=0;
	k=1;
	while(k<ncol && !nmove) {
		m=(j1+k)%10; // next cascade to the right
  		k++;
		CardNo2=lastChildId(m).substr(1);
		c2=deck[CardNo2];
		value2=getVal(c2);
		suit2=getSuit(c2)
		console.log("...m="+m+" CardNo2="+CardNo2+" c2="+c2+" suit2="+suit2+"value2="+value2 );
		if(value2==(value1+1) && suit1==suit2) nmove=moveOne(j,m);
	}
	return nmove;
}
// move the topcard from column j to column m
function moveOne(j,m) {
	child=lastChildId(j);
	cardNo1=deck[child.substring(1)];
	parent=document.getElementById("c"+j);
	console.log("moveOne j="+j+" m="+m+" cardNo1="+cardNo1)
	parent.removeChild(parent.lastChild);
	appendCard(cardNo1,j,1);
	nmove=1;
}



function topCardValue(m) { // return -1 on empty, or 0-12 value of top card
  cascade2=document.getElementById('c'+m);
  v2=-1;
  if(cascade2) card=cascade2.lastElementChild;
  if(card) v2=deck[ parseInt(card.id.substr(1))]%13;
  return v2;
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
// 7/26 tryNotSame (can only move the top card in the clicked cascade)
function tryNotSame(j1){
	nmove=0;
	childId=lastChildId(j1);
	cardId1=deck[lastChildId.substring(1)];
	value1=getVal(cardId1);
	suit1=getSuit(cardId1);
	k=1;
	while(!nmove && k<ncol){
		m=(j1+k)%10; // next cascade to the right
  		k++;
		CardNo2=lastChildId(m).substr(1);
		c2=deck[CardNo2];
		value2=getVal(c2);
		suit2=getSuit(c2)
		console.log("NotSame k="+k+" c1="+c1+" c2="+c2+" suit2="+suit2);
		if(value2==(value1+1) && suit1!=suit2) nmove=moveStack(eventId,j,m);
	}
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
	if(cascade1.childElementCount)flipup(cascade1.lastChild.id);
	return 1;
}
// CHANGE FOR S2 MAKE CARD CLASS CARD	
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


function trywin(){
	var win=0;
	if(nfoundation==8) {
		localStorage.wins++;
		showScores();
		let clickEvent = new Event('click');
		demo.dispatchEvent(clickEvent);
	}
}