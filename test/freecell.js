// pure function version of freecell, copying much from Classic
const deck=shuffle(); // new pure function creates a shuffled deck;
deal(deck); 

function color(i){
	return (i<13 || i>38 ? "b" : "r");
}

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

function deal(){ // this moves slowly on purpose
    for(i=0;i<52;i++){
        const j=Math.floor(i/8);
        const cardId=deck[i];
        const content=createContent(cardId);
        const iy=j*5;
        console.log("deal i="+i+" cardId="+cardId+" j="+j);
        dealCard("c"+j,"v"+cardId,iy,content,color(cardId),1)
    }
}

function clearBoard(){		moves.length=0; // clear these working arrays		nodes.length=0;
    for(j=0;j<8;j++) { // clear cascades
        const cascade=document.getElementById("c"+j);
        while (cascade.firstChild) cascade.removeChild(cascade.firstChild);
    }
}	

function tryEmpty(j) { // attempt to move cascade to an open column
  nmove=0; i=1;
  while(!nmove && i<8) {
    k=(j+i) % 8;
    if(cascadeEmpty(k)) {
      nmove++;
      removeStack(j,first); // unlink these cards into the tomove array
      appendStack(k,first);
    }
    i++;
  }
  return nmove;
}

function removeStack(j,m) {
  tomove.length=0; // clear it off
  cascade=document.getElementById("c"+j);
  for(n=m;n<=last;n++) {
    l=nodes[n].id;
    tomove.push(l.substring(1)); // cardNo
  }
  for(n=m;n<=last;n++) cascade.removeChild(cascade.lastElementChild);
}
function appendStack(k,m) {
  for(n=m;n<=last;n++) appendCard(tomove[n-m],k);
}

function tryMove(j) { // attempt to move a cascade to another
  tomove = []; // array to hold cards that will move
  computeFree();
  if(nmax<(last-first+1)) first=last-nmax+1; // limit range
  nmove=0; m=first; // we'll march down the cascade until something moves
  cascade=document.getElementById("c"+j);
  while(!nmove && m<=last) { // loop from the first of the stackables to whatever will move
    srcId=nodes[m].id; val=getVal(srcId); color=getColor(srcId);
    i=1; // cascades beyond k
    while(i<8 && !nmove) {
      k=(j+i) % 8;
      destId=topCardId(k); val2=getVal(destId); color2=getColor(destId);
      if((color!==color2 && val+1==val2)) {
        nmove++;					moves.push(['c',j,'c',k,last-m+1]); // this defines a move from one cascade to another
        removeStack(j,m);
        appendStack(k,m);
      }
      i++;
    }
    m++;
  }
  return nmove;
}

function undo(){ // at the moment, this just works for cascade to cascade
	if(moves.length) {
		cardid=-1;
		move=moves.pop();
		cj=move[0]; j=move[1]; ck=move[2]; k=move[3]; n=move[4];
		if(cj=='c' && ck=='c') {
			tomove.length=0; // clear this array - a bit like remove stack
			nodes=document.getElementById('c'+k).childNodes;
			last=nodes.length-1; m=last-n+1;
			removeStack(k,m);
			appendStack(j,m);
		} else if(ck=='f') {
			cardid=freecells[k];
			document.getElementById("s"+k).innerHTML="";
			freecells[k]=-1;
		} else if(ck=='a') {
			cardid=aces[k]+13*k;
			aces[k]--;
			if(aces[k]==-1) {card="";} else {card=cards[cardid-1];}
			document.getElementById("a"+k).innerHTML=card;				
		}
		if(cardid>-1 && cj=='c') {
			appendCard(cardid,j);
		}
	}
}
function computeFree() { // What is the biggest move we can make
  nopen=0;
  for(k=0;k<4;k++) if(freecells[k]==-1) nopen++;
  nempty=0;
  for(j=0;j<8;j++) if(cascadeEmpty(j)) nempty++;
  nmax=1+(nopen+nempty);
}
function stackable(j) { // return the global values of first and last
    nodes=document.getElementById("c"+j).childNodes;
    last=nodes.length-1; // index of top node in node list
    if(last<1) {
        first=last;
    }else{
        first=last-1; // index on how many can be stacked
        match=1; // test to see whether it can be stacked
        while(first>-1 && match) {
            id1=nodes[first].id; id2=nodes[first+1].id;
            val1=getVal(id1); val2=getVal(id2);
            color1=getColor(id1); color2=getColor(id2); // returns 'r' or 'b'
            match=(val1==(val2+1) && color1!==color2); // true or false
            first--;
 //         console.log("F "+first+" L "+last+" M "+match)
        }
        first=(first==-1 && match) ? 0 : first+2;
    }
}

function cascadeEmpty(j) {
  return (document.getElementById("c"+j).childElementCount==0)
}
	
function appendCard(cardNo,j) { // add a card to the end of cascade j
	const cascade=document.getElementById("c"+j);
	z=cascade.childElementCount+1;
    var card=document.createElement("div");
    card.innerHTML=cards[cardNo];
    card.id="v"+cardNo;
    card.style.position='absolute';
    card.style.width='100%';
    y=(z-1)*5;
    card.style.top=y.toString()+"vw";
    cascade.appendChild(card);
}

function dropFree(k){ // Drop the card from freecell k to a cascade
	var cardNo=freecells[k];
	if(cardNo>-1) {
		suit=Math.floor(cardNo/13); val=cardNo % 13; color=(suit==0 || suit==3) ? 'b' : 'r';
		// run through the top cards to see if it can drop down to them
		j=0;nmove=0;
		while(j<8 && nmove==0){
			destId=topCardId(j); destVal=getVal(destId); destSuit=getSuit(destId);
			destColor=(destSuit==0 || destSuit==3) ? 'b' : 'r';
			if((val==destVal-1) && (color !== destColor)) {
				moves.push(['f',k,'c',j,1]); // this defines a move from freecell to cascade
				appendCard(cardNo,j);
				freecells[k]=-1;
				document.getElementById("s"+k).innerHTML="";
				nmove=1;
			}
			j++;
		}
		j=0; // if nothing moved to a full cascade, try empty cascades!
		while(j<8 && nmove==0) {
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
    if(aces[0]==12 && aces[1]==12 && aces[2]==12 && aces[3]==12) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
}

  // Run through to see if any top cards can jump to the ace pile
  function topCardId(j){
    cascade=document.getElementById("c"+j);
    topCard = cascade.lastChild;
    return (topCard) ? topCard.id : ''; // what card is it? v0...
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
	      for(j=0;j<8;j++) { // try pop from the cascades
	        topID=topCardId(j);
  	      if(topID) { // is there a top card in this cascade?
    	      suit=getSuit(topID);
      	    val=getVal(topID);
            console.log("topID="+topID+" suit="+suit+" val="+val);
          	if(aces[suit]==(val-1)) {
            	nmove++;
				moves.push(['c',j,'a',suit,1]); // this defines a move from freecell to cascade
            	aces[suit]++;
              cascade=document.getElementById("c"+j);
  	          cascade.removeChild(cascade.lastChild);
          	}
  		}
    if(aces[0]==12 && aces[1]==12 && aces[2]==12 && aces[3]==12) confetti(
		{particleCount: 100,spread: 70, origin: { y: 0.6 }});
    }
      
        for(j=0;j<4;j++) { // try pop from freecells
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
function showFoundations(){
  for(i=0;i<4;i++) {
    if(aces[i]>-1) {
      var card=cards[i*13+aces[i]];
      document.getElementById("a"+i).innerHTML=card;
    }
  }
}

function tryFreeCells(j){
    free=-1;
    for(k=0;k<4;k++) if(freecells[k]==-1) free=k;
    if(free>-1) {
        t=topCardId(j);
	    moves.push(['c',j,'f',free,1]); // this defines a move from cascade to freecell
        freecells[free]=parseInt(t.substring(1)); // place the cardno in there for easy move later
        popCard(j,t,"s"+free);
        return 1;
    }else{
        return 0;
    }
}

// Move a card from one place to another
function popCard(j,srcId,destId){
  cascade=document.getElementById("c"+j);
  src=document.getElementById(srcId);
  dest=document.getElementById(destId);
  if(dest) dest.innerHTML=src.innerHTML;
  cascade.removeChild(cascade.lastChild);
  return 1;
}
