// New project to go with pure functions only and remove the common script for now
// for now, we will have to pass state variable in as parameters to minimize global variables
// 1. Auto start on load
// 2. On "new" button force a reload
// 3. Change card div numbering to match the card index, making it easy to reveal color and value
// 4. Create all the cards a nodes at the beginning with a pure createCards1() that calls cre
// 5. The flipped up cards are children of a span with id flipped
// 6. A new pure shuffled deck is assigned to

const deck=shuffle(); // new pure function creates a shuffled deck;
deal(deck); // deal the first 28 to the cascades and 24 to the reserve
createReserve(deck); // deal the next 24 cards into reserve 

// impure functions pushed to the edge to handle dom
function appendCard(parent,child,y){ // move card to a new parent with absolute offset string y
	console.log("append ",child);
	child.style.position="absolute";
	child.style.width="100%";
	child.style.top=y;
	document.getElementById(parent).appendChild(child);
}
// pure functions mostly replacing the old commons
function createContent(cardId){
	const suits = ["♠","♥","♦","♣"];
	const faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
	const vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	const n=i%13;
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


// move the first 28 deck items
function deal(deck){
	let ndealt=0;
	for (j=0;j<7;j++){ // j here indicated which cascade
		y=(5*j)+"vw";
		appendCard("c"+j,"v"+deck[ndealt],y);
		ndealt++;
		for (i=j+1;i<7;i++){ // the rest of the row takes default face down
			appendCard("c"+j,"v"+deck[ndealt]);
			ndealt++;
		}
	}
}

function clearBoard(){	document.getElementById('r0').innerHTML=back;
  for(j=0;j<ncol;j++) { // clear cascades
    const cascade=document.getElementById("c"+j);
    while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
  }
  for(j=0;j<nfree;j++) document.getElementById("s"+j).innerHTML="";
  for(j=0;j<4;j++) document.getElementById("a"+j).innerHTML="";
  aces=[-1,-1,-1,-1];
  document.getElementById("r0").innerHTML="";
}


function tryMove(event) { // When cascade card is clicked. Must delete it before it can be appended

}

