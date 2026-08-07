const ncards=52;
var nlast=52; //this will decrease as we delete cards from the stack
var ndealt=0;
var lefts=[]; // squares which might coveer other squares
var rights=[];
const offsets=[1,2,2,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6];
var tapped=0; // value+1 of first tapped? When it reaches 13 theygo.
createCards();
shuffle();
deal();

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
        right[i]=-1;
    }
}

function next(){
    console.log("Next "+ndealt);
    const cardno=deck[ndealt];
    s='<div class="card" onclick="testflip('+cardno+')">'+cards[cardno]+'</dev>';
    document.getElementById("flip").innerHTML=s;
    ndealt++;
    if(ndealt==nlast) ndealt=28;
}

function testflip(cardno){
    val=getVal(cardno); // rangers from 0 Ace to 12 king
    if(val==12) {
        document.getElementById("flip").innerHTML="";
        nuke(cardno); //eliminate this card from cards and deck both; 
    }
}
function nuke(cardno){
    cards.splice(cardno-1,1); // one card removed
    i=deck.indexOf(cardno); // which deck item to remove
    deck.splice(i-1,1);
    nlast=deck.length; // this should be 1 less 
    console.log("Nuke "+cardno+" i="+i+" nlast="+nlast);
}
function pop(i){
    console.log("pop i="+i);
    blank=document.createElement("div");
    blank.id="v"+i;
    blank.classList.add("blank");
    blank.style.width="12vw";
    blank.style.display='inline-block';
    blank.style.top='0';
    document.getElementById("v"+i).replaceWith(blank);
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
    card.style.display='inline-block';
    card.style.top='0';
    card.innerHTML=cards[deck[i]];
    cell.appendChild(card);
}
