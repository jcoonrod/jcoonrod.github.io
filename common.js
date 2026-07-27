// routines used in multiple games

const getSuit = cardId => Math.floor(cardId/13);
const getVal = cardId => cardId % 13;
const getColor = cardId => (getSuit(cardId)==0 || getSuit(cardId)==3) ? 'b' : 'r';

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

// a function to Fisher-Yate shuffle two decks together (104 cards);
function shuffle(){
	console.log("Shuffle "+ncards);
	for(i=0; i<ncards; i++) { // do lots random interchanges
		j=Math.floor(Math.random() * 52);
		[deck[i],deck[j]]=[deck[j],deck[i]];
		//	console.log("i,j="+i+','+j);
    }
}

function tryFree(cardNo){
	nmove=0;
	j=0;
	while(!nmove && j<nfree){
		if(freecells[j]=="-1") {
			nmove++;
			freecells[j]=cardNo;
			document.getElementById("s"+j).innerHTML=cards[deck[cardNo]];
		}
		j++;
	}
	return nmove;
}
// We need to preserve the list of cards that must be moved
// So we create a stackList of cardNo's that should be moved in order.

function tryStack(j1,cardNo1,value1,color1){ // try moving stack to stack 
	console.log("tryStack j1="+j1+" value1="+value1+" color1="+color1);
	// First, find a suitable destination if any
	j=0; // next, scan all the columns for a target
	nmove=0;
	while(j<ncol && !nmove) {
		proceed=false; // don't move ahead unless one condition or the other is met
		cascade1=document.getElementById("c"+j);
		n=cascade1.childElementCount; // check if it is empty
		if(!n && value1==12) nmove=moveStack(j1,cardNo1,j); // move a king stack to empty cascade
		else if(n) { // don't consider an empty cascade
			target=cascade1.lastChild.id.substring(1); // cardNo on bottom of target
			cardId=deck[target];
			value2=getVal(cardId);
			color2=getColor(cardId);
			console.log("... j="+j+" value2="+value2+" color2="+color2);
			if((color1!=color2)&&(value1==value2-1)) nmove=moveStack(j1,cardNo1,j);
		}
		j++;
	}
	return nmove;
}
function moveStack(j1,cardNo1,j2){ // move the stack
	// since we remove kids, the active index stays myKid
	console.log("Move from j1="+j1+" to "+j2);
	kids=document.getElementById("c"+j1).children;
	nkids=kids.length;
	for(i=0;i<kids.length;i++) if(cardNo1==kids[i].id.substring(1)) myKid=i; // top of stack to move
	nmove=nkids-myKid;
	console.log("nkids="+nkids+" myKid="+myKid+" nmove="+nmove);
	for(i=myKid;i<nkids;i++) {
		console.log("move kid"+kids[myKid].id);
		cardNo=kids[myKid].id.substring(1);
		kids[myKid].parentNode.removeChild(kids[myKid]);
		appendCard(cardNo,j2,1);
	}
	return nmove;
//	cascade=document.getElementById("c"+j1);
//	if(cascade.childElementCount) flipup(cascade.lastChild.id);
}
function topCardId(j){
	console.log("topCardId from j="+j);
    cascade=document.getElementById("c"+j);
    id = cascade.lastChild.id;
	console.log("topCardId="+id);
    return (id); // what card is it? v0...	
}
