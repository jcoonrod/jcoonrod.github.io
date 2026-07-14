// Serious refactor so that when clicking either a freecell or cascade cell the functions work
// the same - eg, we deal with the element id card element id just the cardNo.
// In cascade, we only add the onclick on faceup cards.
// Once we deal the original cards, we move the rest to a reserve deck.
// When a reserve card goes to the tableau, it is sliced out of the reserve
// Discovery - I don't need z!
// scoping problem - name everything by source or dest
// seems difficult to put nodes as parameters - have to use ids instead.

const ncards=52; // This game just uses one deck
const ncol=7; //maximum width
const nfree=3; // how many dropable cards are turned over?
const nfoundations=4; // as distinct from freecell where there are 8
var nmove=0; // make this global
var freecells=[-1,-1,-1]; // Initial the cardno of the three we turn over
var aces=[-1,-1,-1,-1]; // order for each suit 
var cards = []; // array of card div svg objects
var ndealt=0; // how many cards have been dealt?
var nmove=0; // how many cards moved in this turn?
var deck = []; // sort order for the cards
var reserve = []; // contains the undealt cardNos
var ireserve = 0; // the cursor into the reserve deck from 1 to its length
const suits = ["&spadesuit;","&heartsuit;","&diamondsuit;","&clubsuit;"];
const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const back= '<img src=/back.jpg width=100% height=auto>';
var flips=[];

// Start the game without waiting
createCards();
shuffle();
deal();

// convert cardId
const getSuit = cardId => Math.floor(cardId/13);
const getVal = cardId => cardId % 13;
const getColor = cardId => (getSuit(cardId)==0 || getSuit(cardId)==3) ? 'b' : 'r';

// When you click on the reserve, it flips up to 3 cards
function next3(){ // this now only gets called if there are cards to deal
	for(i=0;i<3;i++) {
		if (ireserve<deck.length) { // this will now be shrinking
			document.getElementById("s"+i).innerHTML=cards[deck[reserve[ireserve]]];
			freecells[i]=reserve[ireserve]; //cardNo
			ireserve++;
			if(ireserve==deck.length) ireserve=0; // loop around
		}else{
			document.getElementById("s"+i).innerHTML="";
		}
	}
	console.log("next 3 ireserve="+ireserve+" freecells="+freecells);
}

function createCards(){
	for (n=0;n<ncards;n++) { // create 52 dif cards as strings in this array - innerHTML for divs
			var suit=Math.floor(n/13);
			var f='b'; if(suit==1 || suit==2) f='r'; // optionally paint the red suits red
			var val = n % 13;
			var ctr = (val<10) ? suits[suit] : faces[val-10];
			cards[n]='<h2 class="'+f+'">'+vals[val]+' '+suits[suit]+'</h2><h1 class='+f+'>'+ctr+'</h1></div>';
			deck[n]=n;
			flips[n]=0;
	}
}
// flip over card in cascade and put onclick in it
function faceUp(cardNo){
	card=document.getElementById("v"+cardNo);
	card.innerHTML=cards[deck[cardNo]];
	card.setAttribute("onclick","tryMove('v"+cardNo+"');");
}

// a function to Fisher-Yate shuffle two decks together (104 cards);
function shuffle(){
	console.log("Shuffle "+ncards);
	for(i=0; i<ncards; i++) { // do lots random interchanges
		j=Math.floor(Math.random() * 52);
		[deck[i],deck[j]]=[deck[j],deck[i]];
		//	console.log("i,j="+i+','+j);
    }
}
// for now, we won's us frame - deal 7,6,5,4,3,2,1
function deal(){
	clearBoard(); // resets everything
	ndealt=0;
	for (j=0;j<7;j++){ // j here indicated which cascade
		appendCard(ndealt,j,1); // first card face up
		flips[ndealt]=1;
		ndealt++;
		for (i=j+1;i<7;i++){ // the rest of the row takes default face down
			appendCard(ndealt,i,0);
			ndealt++;
		}
		console.log("Append ndealt="+ndealt+" j="+j);
	}
	ireserve=0; // Where to start on turning up cards
	for(i=28;i<ncards;i++) reserve[i-28]=i; // i is the cardNo
}

function clearBoard(){	document.getElementById('r0').innerHTML=back;
  for(j=0;j<ncol;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<nfree;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
}

// when a "freecell" is clicked, see if it will map to a column
// i though i could share the scan with tryMove but that didn't work
// maybe we could share the "test j" parts?
// ok, we will set up reserve deck to count initially 0 to 28 containing cardNo from deck
// othersie we cannot slice it out.
function tryDrop(freecell){ // this is called with argument "this";
	freecellId=freecell.id; // This should be like s0, s1, s2  
	nmove=0; // nothing has moved yet
	freecellNo=freecellId.substring(1); // like 0,1,2
	console.log("tryDrop freecellId="+freecellId+" freecellNo="+freecellNo);	
	cardNo=freecells[freecellNo];
	cardId=deck[cardNo];
	suit1=getSuit(cardId);
	color1=getColor(cardId); // optionally paint the red suits red
	value1=getVal(cardId); 
	console.log("tryDrop freecellId="+freecellId+" cardId="+cardId+" value1="+value1+ "suit1="+suit1);
	nmove=tryAce(value1,suit1);
	j=0;
	while (!nmove && j<7) { // try moving it to a cascade
		cascade=document.getElementById("c"+j); //
		cascadeSize=cascade1.childElementCount;
		console.log("Try from "+freecellId+" to cascade j="+j);
		if(cascadeSize==0 && value1==12) { //is the cascade empty and our card a king?
			console.log("Append a King from "+FreecellId+"to empty cascade "+j);
			appendCard(j,cardNo,1);
			nmove++;
		} else if (cascadeSize) {
			topCard=cascade.lastChild;
			topCardId=deck[topCard.id.substring(1)];
			const color2=getColor(topCardId);
			const value2=getVal(topCardId);
			console.log("Top card of "+j+" value2="+value2+"color2="+color2); 
			if( (value2==(value1+1))&&(color2!=color1)){
				console.log("Append a King to "+j);
				appendCard(j,cardNo,1);
				nmove++;
			}					
		}
		j++;
	}
	if(nmove) {
		console.log("tryDrop nmove="+nmove+" cardNo="+cardNo+" freecells="+freecells);
		document.getElementById(eventId).innerHTML="";
		freecells[freecellId]=-1;
		deck.splice(deck.indexOf[cardNo],1); // 
		console.log("new length of deck="+deck.length);
	};
}
function tryAce(value,suit){
	nmove=0;
	console.log('tryAce aces='+aces+' value='+value+" suit="+suit);
	if(aces[suit]==(value-1)){ // if it stacks, move it there
		cardId=suit*13+value;
		document.getElementById("a"+suit).innerHTML=cards[cardId];
		aces[suit]++;
		nmove=1;
	}
	return nmove;
}

// this is where a tableau card goes when clicked
// it must determine if is the last card in the stack or not

function tryMove(event) { // When cascade card is clicked. Must delete it before it can be appended
	eventId1=event.id; // which card was clicked?
	console.log("tryMove event="+event);
	nmove=0; // nothing has moved yet
	console.log("tryMove eventId1 "+eventId1);
	cardNo1=parseInt(eventId1.substring(1)); // learn all about the clicked card
	console.log("tryMove cardNo1 "+cardNo1);
	cardId1=deck[cardNo1];
	var suit1=getSuit(cardId1);
	var color1=getColor(cardId1); // optionally paint the red suits red
	var value1=getVal(cardId1); 
	cascade1=event.parentNode; // we can only consider an ace if it is not the last child
	j1=cascade1.id.substring(1);
	topCard1=cascade1.lastChild; // get the last card in the column
	if(topCard1==event) nmove=tryAce(value1,suit1); // only clicked last cards can move to an ace}
	if(nmove) {
		cascade1.removeChild(topCard1);
		if(cascade1.lastChild) flipup(cascade1.lastChild);
	}
	if (!nmove) nmove=tryStack(j1,cardNo1,value1,color1); // try stack moves from clicked to end
}

function tryStack(j1,cardNo1,value1,color1){ // try moving stack to stack 
	nmove=0;
	j=0; // scan all the columns
	while(j<ncol && !nmove) {
		topCard=document.getElementById("c"+j).lastChild;
		if(topCard==null && value1==12) { // ahah, place a king and any children
			console.log("King stack moved to "+j);
			moveStack(j1,cardNo1,j);
			nmove++;
		}else if (topCard!=null) { //ie, a top card exists
			topCardNo=topCard.id;
			console.log("try stack j="+j+" topCardNo="+topCardNo);
			topCardId = deck[topCardNo.substring(1)]; // runs 0 to ncards
			value2=getVal(topCardId);
			color2=getColor(topCardId);
			console.log("tryStack j="+j+" topCardId="+topCardId+" value2="+value2+" color2="+color2);
			if(value2==(value1+1) && color1!=color2) {
				moveStack(j1,cardNo1,j);
				nmove++;
			}else{j++;}
		}
	}
	return nmove;	
}

function moveStack(j1,cardNo1,j2){
	const cascade1=document.getElementById("c"+j1);
	console.log("cascade1 "+cascade1);
	const kids=document.getElementById("c"+j1).children;
	console.log("kids "+kids);
	const cascade2=document.getElementById("c"+j2);
	console.log("cascade2 "+cascade2);
	// now find at while index is the one clicked
	nkids=kids.length;
	console.log("nkids "+nkids);
	for(i=0;i<nkids;i++) if(kids[i].id.substring(1)==cardNo1) ikid=i; // find index of clicked element
	console.log('ikid '+ikid);
	for (i=ikid;i<nkids;i++) {
		copyKid=kids[i];
		cardNo2=copyKid.id.substring(1);
		console.log("Kid "+i+" "+kids[i]);
		cascade1.removeChild(kids[i]);
		console.log("append cardNo2 "+cardNo2+" j="+j);
		appendCard(cardNo2,j,1);

	}
	last1=cascade1.lastChild;
	if(last1)flipup(last1);
}

function flipup(child){ // id shold be v0 to v51
	console.log("flipup id="+child.id);
	cardNo=child.id.substring(1);
	child.innerHTML=cards[deck[cardNo]];
	child.setAttribute("onclick","tryMove(self)");
}

function appendCard(cardNo,j,up) { // add a card position i in the deck to the end of cascade j
	cascade=document.getElementById("c"+j);
	z=cascade.childElementCount;
    card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[cardNo]];
		flips[cardNo]=1;}
	else{card.innerHTML=back;flips[cardNo]=0;}
    card.id="v"+cardNo;
    card.classList.add("card");
    card.style.position='absolute';
    card.style.width='100%';
	y=(screen.width < 600 ? (z-1)*4 :  (z-1)*3);
    card.style.top=y.toString()+"vw";
	if(up) card.setAttribute("onclick","tryMove(this);");
    cascade.appendChild(card);
}
function topCardId(j){
	console.log("topCardId from j="+j);
    cascade=document.getElementById("c"+j);
    id = cascade.lastChild.id;
	console.log("topCardId="+id);
    return (id); // what card is it? v0...	
}
