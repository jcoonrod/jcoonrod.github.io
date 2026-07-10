// Version adapted from both Freecell and Spider for Classic Solitaire
// Requires changes to TryMove, Deal, spider next10 becomes next3...
// Note "CardNo" refers to the position in the deck, not of cards
// We use the notion of Freecells just like in Freecell
// Big difference is that here cards are dealt face down except the last line.

const ncards=52; // This game just uses one deck
var nreserve=24; // after initial deal there are 24 cards in reserve
const ncol=7; //maximum width
const nfree=3; // how many dropable cards are turned over?
const nfoundations=4; // as distinct from freecell where there are 8
// Set up a 1-d array of the unicode values for the cards
// Note - Unicode sets up 16 cards per suit, including two queens
// Unlike the old game, I want to only use the DOM
// Each move of n cards from x1, iy1 to x2, iy2 (an array of 5 items)
	const expiry="Fri, 01 Jan 2038 00:00:01 GMT";
	const sofar=document.getElementById("sofar");
	if(localStorage.times==null) localStorage.times=0;
	if(localStorage.wins==null) localStorage.wins=0;
	if(localStorage.nsuit==null) localStorage.nsuit=2; //default number of suits
	// I called the turned-over-from-reserve freecell as they behave similarly
	var freecells=[-1,-1,-1]; // Initial the cardno of the three we turn over
	var aces=[-1,-1,-1,-1]; // order for each suit 
	var cards = []; // array of card div svg objects
	var ndealt=0; // how many cards have been dealt?
	var moves = [];
	var toMove = []; // array of cards to move
  var deck = []; // sort order for the cards
  nfoundation=0; // how many foundation piles have gone up?
  nempty = 0; // computed # empty cascades
  const suits = ["&spadesuit;","&heartsuit;","&diamondsuit;","&clubsuit;"];
  faces = ["♖","♕","♔"]; // emojis v1.1 for facecards
  vals = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
	back= '<img src=/back.jpg width=100% height=auto>';
  var first=0; // index within the nodes for the first that could be moved
  var last=0; // " the top card
  var flips=[];
	const demo=document.getElementById("demo");
	document.getElementById("r0").innerHTML="<img src=back.jpg>";
	createCards();
//	showScores(); // maybe add this later

// MODIFIED FUNCTIONS FOR CLASSIC
function next3(){
	for(i=0;i<3;i++) {
		if (ndealt<ncards) {
			document.getElementById("s"+i).innerHTML=cards[deck[ndealt]];
			freecells[i]=deck[ndealt];
			ndealt++;
		}else if(nfoundation<ncards){ // repeat remaining undeal cards
			ndealt=24-nfoundation;
		}
	}
	console.log[freecells];
}

/*
// FUNCTIONS from top down	// make numbers bigger for phones
function removeButton(t) {
  (t.target.style.opacity = 0),
    setTimeout(() => {
      (t.target.style.visibility = ""), (t.target.style.opacity = 1);
    }, 5e3);
}
*/
// MODIFIED TO USE DIFS INSTEAD OF SVG
    function createCards(){
    for (n=0;n<ncards;n++) { // create 52 svg cards as strings in this array - innerHTML for divs
			var suit=Math.floor(n/13);
			var f='b'; if(suit==1 || suit==2) f='r'; // optionally paint the red suits red
			var val = n % 13;
			var ctr = (val<10) ? suits[suit] : faces[val-10];
			cards[n]='<h2 class="'+f+'">'+vals[val]+' '+suits[suit]+'</h2><h1 class='+f+'>'+ctr+'</h1></div>';
			deck[n]=n;
			flips[n]=0;
		}
	}
	
	// a function to Fisher-Yate shuffle two decks together (104 cards);
  function shuffle(){
	console.log("Shuffle "+ncards);
    for(i=(ncards-1); i>0; i--) { // do lots random interchanges
      let j=Math.floor(Math.random()*(i+1));
			[deck[i],deck[j]]=[deck[j],deck[i]];
    }
  }
// for now, we won's us frame - deal 7,6,5,4,3,2,1
  function deal(){
	document.getElementById("r0").innterHTML=back; 
	console.log("deal "+ndealt);
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
  }
  function clearBoard(){
    nfoundation=0; // how many foundation piles have gone up?
		moves.length=0; // clear these working arrays
		toMove.length=0;
		document.getElementById('r0').innerHTML=back;
    for(j=0;j<7;j++) { // clear cascades
      const cascade=document.getElementById("c"+j);
      while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
    }
    for(j=0;j<3;j++) document.getElementById("f"+j).innerHTML="";
  }
	
  function faceUp(j) { // make sure top card is face up on this cascade
    id=topCardId(j);
    if(id) {
      i=parseInt(id.substr(1));
      flips[i]=1;
      document.getElementById(id).innerHTML=cards[deck[i]];
    }
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
	

	function tryMove(cardNo) { // simplify for now - just move bottom card singly
	// The rule in classic is that colors must not match
	// For now, make sure we only take last in this column
		

	if(flips[cardNo]) { // first, learn about the clicked card
      	card1=deck[cardNo];
		val1=card1%13; // value of clicked card
		suit=Math.floor(card1/13);
		color1=(suit==0 || suit==3) ? 'b' : 'r'; // color of clicked card
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
		z=z1; v=v1; color=color1;
		while(z<z2 && !nmove) { // make sure items in stack can move together
			c2=deck[parseInt(nodes[z].id.substr(1))];
			console.log('Check z='+z+' c='+c+' c2='+c2);
			if(c!==(c2+1)) nmove=1;
			c=c2;
			z++;
		}
		// If none have moved yet, keep trying
		if(!nmove) {
			toMove.length=0;
			for(z=z1;z<=z2;z++) toMove.push( parseInt(nodes[z-1].id.substr(1)) );
		}
				if(!nmove && v1!==12 ) tryStack(toMove,v1,j); // then consider not-same-suit columns
				if(!nmove) nmove=tryEmpty(toMove,j); // then consider empty columns
		}
//		trywin();
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

  // check if anything can jump to the aces piles automatically
  function tryAce() { // this will repeat as long as it moves something
    var nmove=1; // This gets incremented and returned
    var m=setInterval(frame2,100);
    function frame2() {
      if (nmove==0) {
        clearInterval(m);
        showFoundations();
      } else {
  			nmove=0;
	      for(j=0;j<ncol;j++) { // try pop from the cascades
	        topID=topCardId(j);
  	      if(topID) { // is there a top card in this cascade?
    	      suit=getSuit(topID);
      	    val=getVal(topID);
          	if(aces[suit]==(val-1)) {
            	nmove++;
				moves.push(['c',j,'a',suit,1]); // this defines a move from freecell to cascade
            	aces[suit]++;
            	cascade=document.getElementById("c"+j);
  	        	cascade.removeChild(cascade.lastChild);
          	}
  		}
    }  
        for(j=0;j<nfree;j++) { // try pop from freecells
          cardNo=freecells[j];
          if(cardNo>-1) {
            val=cardNo % 13; suit=Math.floor(cardNo/13);
            if(aces[suit]==(val-1)) {
              nmove++;
							moves.push(['f',j,'a',suit,1]); // this defines a move from freecell to cascade
              aces[suit]=val;
              freecells[j]=-1;
              document.getElementById("s"+j).innerHTML="";
            }
          }
        }
      }
    }  // end frame
  } // end try aces


	function trywin(){
		var win=0;
		if(nfoundation==8) {
			localStorage.wins++;
			showScores();
			let clickEvent = new Event('click');
			demo.dispatchEvent(clickEvent);
		}

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
//				console.log("Stack k="+k+" v1="+v1+" v2="+v2);
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
//		console.log("moveStack j="+j+" m="+m);
	  cascade1=document.getElementById('c'+j);
	  for(i=0;i<toMove.length;i++) cascade1.removeChild(cascade1.lastChild);
	  for(i=0;i<toMove.length;i++) appendCard(toMove[i],m,1);
    faceUp( parseInt(cascade1.id.substr(1)) ); // flip the top card in cascade j if not already flipped
    return 1;
  }
  // Check if the column is now empty.
  function cascadeEmpty(j) {
	console.log("cascadeEmpty j="+j);
	  return (document.getElementById("c"+j).childElementCount==0);
	}

  // CHANGE FOR S2 MAKE CARD CLASS CARD	
	function appendCard(i,j,up) { // add a card position i in the deck to the end of cascade j
	  //when i>43, deal face up
	    const cascade=document.getElementById("c"+j);
		z=cascade.childElementCount+1;
    var card=document.createElement("div");
    if(up) {card.innerHTML=cards[deck[i]];flips[i]=1;}else{card.innerHTML=back;flips[i]=0;}
    card.id="v"+i;
    card.classList.add("card");
    card.style.zindex=z.toString();
    card.style.position='absolute';
    card.setAttribute("onclick","tryMove("+i+");");
    card.style.width='100%';
    y=(screen.width < 600 ? (z-1)*4 :  (z-1)*3);
    card.style.top=y.toString()+"vw";
    cascade.appendChild(card);
	}

	function dropFree(k){ // Drop the card from freecell k to a cascade
		var cardNo=freecells[k];
		console.log("dropFree k="+k+"cardNo="+cardNo);
		if(cardNo>-1) {
			suit=Math.floor(cardNo/13); val=cardNo % 13; color=(suit==0 || suit==3) ? 'b' : 'r';
			console.log("color="+color+" val="+val);
			j=0;nmove=0;
			while(j<ncol && nmove==0){
				destId=topCardId(j); destVal=getVal(destId); destSuit=getSuit(destId);
				destColor=(destSuit==0 || destSuit==3) ? 'b' : 'r';
				if((val==destVal-1) && (color !== destColor)) {
					moves.push(['f',k,'c',j,1]); // this defines a move from freecell to cascade
					appendCard(cardNo,j,1);
					freecells[k]=-1;
					document.getElementById("s"+k).innerHTML="";
					nmove=1;
				}
				j++;
			}
			j=0; // if nothing moved to a full cascade, try empty cascades!
			// try to make this generic by puting ncol as a constant
			while(j<ncol && nmove==0) {
			  if(cascadeEmpty(j)) {
					moves.push(['f',k,'c',j,1]); // this defines a move from freecell to cascade
 					appendCard(cardNo,j);
					freecells[k]=-1;
					document.getElementById("s"+k).innerHTML="";
					nmove=1;
			  }
			  j++;
			}
		}
		tryAce(); // after making a move, see if any cards can jump up to foundation
	}


  // Run through to see if any top cards can jump to the ace pile
  function topCardId(j){
	console.log("topCardId from j="+j);
    cascade=document.getElementById("c"+j);
    id = cascade.lastChild.id;
	console.log("topCardId="+id);
    return (id); // what card is it? v0...	
  }
  // simple functions to convert id to values
  const getSuit = s => Math.floor(parseInt(s.substring(1),10)/13);
  const getVal = s => parseInt(s.substring(1),10) % 13;
  const getColor = s => (getSuit(s)==0 || getSuit(s)==3) ? 'b' : 'r';
