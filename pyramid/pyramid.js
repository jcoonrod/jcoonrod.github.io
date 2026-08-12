// NEXT STEPS
// Paint one or two cards yellow when clicked.
// Check value of the cards simply by looking into innerHTML?
const ncards=52;
var nlast=52; //this will decrease as we delete cards from the stack
var ndealt=0;
var nclicked=0;
var click1; // which card was clicked first?
var click2; // which card was clicked second?
var lefts=[]; // squares which might coveer other squares
var rights=[];
const offsets=[1,2,2,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6];
const yellowrgb=[255,255,0];
var tapped=0; // value+1 of first tapped? When it reaches 13 theygo.
createCards();
shuffle();
deal();
function pop(i){ // do various things when a card is clicked
    console.log("pop i="+i+" nclicked="+nclicked);
    // toggle background color between white and yellow adjust nclicked
    card=document.getElementById("cd"+i);
    const backgroundColor = card.style.backgroundColor;
    console.log("backgroundColor="+backgroundColor+" ending in "+backgroundColor.slice(-2));
    if(backgroundColor=="yellow") card.style.backgroundColor="white";
        else card.style.backgroundColor="yellow";
}
function deal(){
    ndealt=0;
    for(i=0;i<7;i++){
//    console.log("Dealing layer i="+i);
        for (j=0;j<i+1;j++){
            appendCard(ndealt);
            ndealt++;
        }
    }
// Initialize who covers whom
    for(i=0;i<21;i++) {
        lefts[i]=i+offsets[i];
        rights[i]=lefts[i]+1;
    }
    for(i=21;i<28;i++){ // mark the bottom row as visible
        lefts[i]=-1;
        rights[i]=-1;
    }
}

function next(){
    console.log("Next "+ndealt);
    const cardno=deck[ndealt];
    s='<div id="cd28" class="card" style="backgroundColor: white;">'
    +cards[cardno]+'</dev>';
    document.getElementById("v28").innerHTML=s;
    ndealt++;
    if(ndealt==nlast) ndealt=28;
}

function nuke(cardno){
    cards.splice(cardno-1,1); // one card removed
    i=deck.indexOf(cardno); // which deck item to remove
    deck.splice(i-1,1);
    nlast=deck.length; // this should be 1 less 
    console.log("Nuke "+cardno+" i="+i+" nlast="+nlast);
}

function clearBoard(){
    for(i=0;i<28;i++) {
        cell=document.getElementById("v"+i);
        while(cell && (child=cell.lastChild)) cell.removeChild(child);
    }
    lefts=[];
    rights=[];
    tagged=0;
}   

function appendCard(i) { // add a card to cell vi
//    console.log("AppendCard "+i);
	cell=document.getElementById("v"+i);
    card=document.createElement("div");
    card.id="cd"+i;
    card.classList.add("card");
    card.style.width="12vw";
    card.style.backgroundColor="white";
    card.style.display='inline-block';
    card.style.top='0';
    card.innerHTML=cards[deck[i]];
    cell.appendChild(card);
}
