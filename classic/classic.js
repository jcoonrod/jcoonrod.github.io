// Serious refactor so that when clicking either a freecell or cascade cell the functions work
// the same - eg, we deal with the element id card element id just the cardNo.
// In cascade, we only add the onclick on faceup cards.
// Once we deal the original cards, we move the rest to a reserve deck.
// When a reserve card goes to the tableau, it is sliced out of the reserve

const ncards=52; // This game just uses one deck
const ncol=7; //maximum width
const nfree=3; // how many dropable cards are turned over?
const nfoundations=4; // as distinct from freecell where there are 8
var nmove=0; // make this global

var freecells=[-1,-1,-1]; // Initial the cardno of the three we turn over
var aces=[-1,-1,-1,-1]; // order for each suit 
var cards = []; // array of card div svg objects
var ndealt=0; // how many cards have been dealt?
var deck = []; // sort order for the cards
var reserve = []; // get created after the deal
var ireserve = 0; // the cursor into the reserve deck
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
		if (ireserve<reserve.length) {
			document.getElementById("s"+i).innerHTML=cards[deck[reserve[ireserve]]];
			freecells[i]=reserve[ireserve];
			ireserve++;
			if(ireserve==reserve.length) ireserve=0; // loop around
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
	}
	for (i=24;i<52;i++) reserve[i-24]=i; // we now have to do a double index to find the actual card
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
function tryDrop(event){ // this is called with argument "this";
	eventId=event.id; // This should be like s0, s1, s2  
	nmove=0; // nothing has moved yet
	freecellId=eventId.substring(1); // like 0,1,2
	console.log("tryDrop eventId="+eventId+" freecellId="+freecellId);	
	cardNo=freecells[freecellId];
	cardId=deck[cardNo];
	var suit1=getSuit(cardId);
	var color1=getColor(cardId); // optionally paint the red suits red
	var value1=getVal(cardId); 
	console.log("tryDrop eventId="+eventId+" cardNo="+cardNo+" cardId="+cardId+" value1="+value1+ "suit1="+suit1);
	nmove=tryAce(value1,suit1);
	if (!nmove) nmove=tryStack(cardNo,value1,color1); // if not, try end of a cascade 
	if(nmove) {
		console.log("tryDrop nmove="+nmove+" cardNo="+cardNo+" freecells="+freecells);
		document.getElementById(eventId).innerHTML="";
		freecells[freecellId]=-1;
		reserve.splice(reserve.indexOf[cardNo],1); // 
		console.log("new length of reserve=".reserve.length);
	};
}
function tryAce(value,suit){
	nmove=0;
	console.log('tryAce value='+value+" suit="+suit);
	if(aces[suit]==(value-1)){ // if it stacks, move it there
		document.getElementById("a"+suit).innerHTML=cards[cardId];
		aces[suit]++;
		nmove=1;
	}
	return nmove;
}


function tryMove(event) { // When cascade card is clicked. 
	eventId=event.id; // which card was clicked?
	j=event.parentNode.id.substring(1);
	nmove=0; // nothing has moved yet
	console.log("tryMove eventId "+eventId);
	cardNo=parseInt(eventId.substring(1,3));
	console.log("tryMove cardNo "+cardNo);
	cardId=deck[cardNo];
	var suit1=getSuit(cardId);
	var color1=getColor(cardId); // optionally paint the red suits red
	var value1=getVal(cardId); 
	nmove=tryAce(value1,suit1);
	if (!nmove) nmove=tryStack(cardNo,value1,color1); // if not, try end of a cascade 
	if(nmove) {
		parent=event.parentNode;
		parent.removeChild(event);
		nextChild=parent.lastChild;
		if(nextChild)flipup(nextChild);
	}
}



function tryStack(cardNo,value,color){ // check
	nmove=0;
	j=0; // scan all the columns
	while(j<ncol && !nmove) {
		topCardNo=document.getElementById("c"+j).lastChild.id;
		console.log("try stack j="+j+" topCardNo="+topCardNo);
		topCardId = deck[topCardNo.substring(1)]; // runs 0 to ncards
		value2=getVal(topCardId);
		color2=getColor(topCardId);
		console.log("tryStack j="+j+" topCardId="+topCardId+" value2="+value2+" color2="+color2);
		if(value2==(value+1) && color!=color2) {
			appendCard(cardNo,j,1);
			nmove++;
		}else{j++;}
	}
	return nmove;	
}

function flipup(child){ // id shold be v0 to v51
	console.log("flipup id="+child.id);
	cardNo=child.id.substring(1);
	child.innerHTML=cards[deck[cardNo]];
	child.setAttribute("onclick","tryMove(self)");
}

// Redisplay foundations
  function showFoundations(){
    for(i=0;i<nfoundations;i++) {
      if(aces[i]>-1) {
        var card=cards[i*13+aces[i]];
		console.log("showFoundations card="+card+" i="+i);
        document.getElementById("a"+i).innerHTML=card;
      }
    }
  }

// try to make this work for both the freeCell and cascade
function removeFromCascade(j){ // removed last child
	id='v'+cardNo; // node id
	cascade=document.getElementById(id).get;
}

function appendCard(i,j,up) { // add a card position i in the deck to the end of cascade j
	const cascade=document.getElementById("c"+j);
	z=cascade.childElementCount+1;
    var card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[i]];flips[i]=1;}else{card.innerHTML=back;flips[i]=0;}
    card.id="v"+i;
    card.classList.add("card");
    card.style.zindex=z.toString();
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
