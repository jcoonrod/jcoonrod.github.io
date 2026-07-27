// Complete rewrite based on the 7/26 Classic scripts
// Note the simple changes below in parameters
const ncards=52; // This game just uses one deck
const ncol=8; //maximum width
const nfree=4; // how many dropable cards are turned over?
const nfoundations=4; // as distinct from freecell where there are 8
var nmove=0; // make this global
var freecells=[-1,-1,-1,-1]; // Initial the cardno of put there
var aces=[-1,-1,-1,-1]; // order for each suit 
var cards = []; // array of card div objects
var ndealt=0; // how many cards have been dealt?
var nmove=0; // how many cards moved in this turn?
var deck = []; // sort order for the cards
// var reserve = []; // contains the undealt cardNos
// var ireserve = 0; // the cursor into the reserve deck from 1 to its length
const suits = ["&spadesuit;","&heartsuit;","&diamondsuit;","&clubsuit;"];
const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const back= '<img src=/back.jpg width=100% height=auto>';
var flips=[];

// Start the game without waiting
createCards();
shuffle();
deal(); // change from classic


function deal(){
	for(i=0;i<ncards;i++){
		j=i%ncol;
		appendCard(i,j,1);
	}
	ndealt=ncards;
}

function clearBoard(){	
//	document.getElementById('r0').innerHTML=back;
  for(j=0;j<ncol;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<nfree;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
  aces=[-1,-1,-1,-1];
}

// A freecell can be dropped to any empty tableau or matching 
function tryDrop(event){ // this is called with argument "this";
	freecellId=event.id; // This should be like s0, s1, s2  
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
	while (!nmove && j<ncol) { // try moving it to a cascade
		cascade=document.getElementById("c"+j); //
		cascadeSize=cascade.childElementCount;
		console.log("Try from "+freecellId+" to cascade j="+j);
		if(cascadeSize==0) { //is the cascade empty? (not restricted to kings)
			console.log("Append a Freecell card to empty cascade "+j);
			appendCard(cardNo,j,1);
			nmove++;
		} else if (cascadeSize) {
			topCard=cascade.lastChild;
			topCardNo=topCard.id.substring(1);
			console.log(".. topCardNo="+topCardNo);
			topCardId=deck[topCardNo];
			const color2=getColor(topCardId);
			const value2=getVal(topCardId);
			console.log("Top card of "+j+" value2="+value2+"color2="+color2); 
			if( (value2==(value1+1))&&(color2!=color1)){
				console.log("Append a card to "+j);
				appendCard(cardNo,j,1);
				nmove++;
			}					
		}
		j++;
	}
	if(nmove) {
		console.log("... nmove="+nmove+" cardNo="+cardNo+" freecells="+freecells);
		document.getElementById(freecellId).innerHTML="";
		freecells[freecellNo]=-1;
//		reserveNo=reserve.indexOf(cardNo);
//		reserve.splice(reserveNo,1); // 
//		console.log("cardNo="+cardNo+" reserveNo="+reserveNo+" new length of reserve="+reserve.length);
	};
	return nmove;
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
	parent1=event.parentNode;
	j1=parent1.id.substring(1);
	console.log("tryMove event.id="+eventId1+" j1="+j1);
	nmove=0; // nothing has moved yet
	console.log("tryMove eventId1 "+eventId1);
	cardNo1=parseInt(eventId1.substring(1)); // learn all about the clicked card
	console.log("tryMove cardNo1 "+cardNo1);
	cardId1=deck[cardNo1];
	var suit1=getSuit(cardId1);
	var color1=getColor(cardId1); // optionally paint the red suits red
	var value1=getVal(cardId1); 
	if(!nmove) {
		nmove=tryAce(value1,suit1);
		if(nmove) parent1.removeChild(parent1.lastChild);
	}
	if(!nmove) nmove=tryStack(j1,cardNo1,value1,color1); // try stack moves from clicked to end
	if(!nmove) {
		nmove=tryFree(cardNo1);
		if(nmove) parent1.removeChild(parent1.lastChild);
	}
}


function appendCard(cardNo,j) { // add a card to the end of cascade j
	const cascade=document.getElementById("c"+j);
	z=cascade.childElementCount+1;
    var card=document.createElement("div");
    card.classList.add("card");
    card.innerHTML=cards[deck[cardNo]];
    card.id="v"+cardNo;
    card.style.position='absolute';
    y=(z-1)*4;
    card.style.top=y.toString()+"vw";
	card.setAttribute("onclick","tryMove(this);");
    cascade.appendChild(card);
}
