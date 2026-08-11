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
const res=document.getElementById("res");
var freecells=[-1,-1,-1]; // Initial the cardno of the three we turn over
var aces=[-1,-1,-1,-1]; // order for each suit 
var reserve = []; // contains the undealt cardNos
var ireserve = 0; // the cursor into the reserve deck from 1 to its length
createCards(); // Do this differently depending on number of suits.

// When you click on the reserve, it flips up to 3 cards
function next3(){ // this now only gets called if there are cards to deal
	n=Math.min(3,reserve.length);
	if(ireserve>=(reserve.length-1)) ireserve=0;
	// first, clear out what is there
	for(i=0;i<3;i++) {
		document.getElementById("s"+i).innerHTML="";
		freecells[i]=-1;
	}
	for(i=0;i<n;i++) {
		document.getElementById("s"+i).innerHTML=cards[deck[reserve[ireserve]]];
		freecells[i]=reserve[ireserve]; //cardNo
		ireserve++;
		if(ireserve>=(reserve.length-1)) ireserve=0; // loop around
	}
	console.log("next "+n+" ireserve="+ireserve+" freecells="+freecells);
}

// flip over card in cascade and put onclick in it
function faceUp(cardNo){
	card=document.getElementById("v"+cardNo);
	card.innerHTML=cards[deck[cardNo]];
	card.setAttribute("onclick","tryMove(this);");
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
	for(i=28;i<ncards;i++) reserve[i-28]=i; // i is the cardNo (index) within deck
	res.innerHTML=reserve.length;
}

function clearBoard(){	document.getElementById('r0').innerHTML=back;
  for(j=0;j<ncol;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<nfree;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
  aces=[-1,-1,-1,-1];
}

// when a "freecell" is clicked, see if it will map to a column
function tryDrop(event){ // this is called with argument "this";
	freecellId=event.id; // This should be like s0, s1, s2  
	nmove=0; // nothing has moved yet
	freecellNo=freecellId.substring(1); // like 0,1,2
	console.log("tryDrop freecellId="+freecellId+" freecellNo="+freecellNo+" reserve length="+reserve.length);	
	cardNo=freecells[freecellNo];
	cardId=deck[cardNo];
	suit1=getSuit(cardId);
	color1=getColor(cardId); // optionally paint the red suits red
	value1=getVal(cardId); 
	j=0;
	while (!nmove && j<7) { // try moving it to a cascade
		cascade=document.getElementById("c"+j); //
		cascadeSize=cascade.childElementCount;
		console.log("Try from "+freecellId+" to cascade j="+j);
		if(cascadeSize==0 && value1==12) { //is the cascade empty and our card a king?
			console.log("Append a King to empty cascade "+j);
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
		if(!nmove) {
			console.log("tryDrop freecellId="+freecellId+" cardId="+cardId+" value1="+value1+ "suit1="+suit1);
			nmove=tryAce(value1,suit1);
		} 
	if(nmove) {
		console.log("... nmove="+nmove+" cardNo="+cardNo+" freecells="+freecells);
		document.getElementById(freecellId).innerHTML="";
		freecells[freecellNo]=-1;
		reserveNo=reserve.indexOf(cardNo);
		reserve.splice(reserveNo,1); // 
		console.log("cardNo="+cardNo+" reserveNo="+reserveNo+" new length of reserve="+reserve.length);
		n=reserve.length;
		res.innerHTML=n;
		if(n==0) document.getElementById("r0").innerHTML="";
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
	if(aces[0]==12 && aces[1]==12 && aces[2]==12 && aces[3]==12) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
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
	nmove=tryAce(value1,suit1);
	if(nmove) {parent1.removeChild(parent1.lastChild);
		if(parent1.childElementCount) flipup(parent1.lastChild.id);
	}
	if(!nmove) {
		nmove=tryStack(j1,cardNo1,value1,color1); // try stack moves from clicked to end
		if(nmove && parent1.childElementCount) flipup(parent1.lastChild.id);
	}
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
	y=(z-1)*5;
    card.style.top=y.toString()+"vw";
	if(up) card.setAttribute("onclick","tryMove(this);");
    cascade.appendChild(card);
}
