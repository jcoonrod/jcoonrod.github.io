// NEXT STEPS
// address visibility
const ncards=52;
var nlast=52; //this will decrease as we delete cards from the stack
var ndealt=0;
var nclicked=0;
var click1; // which card was clicked first?
var click2; // which card was clicked second?
var lefts=[]; // squares which might coveer other squares
var rights=[];
const offsets=[1,2,2,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6];
const status=document.getElementById("status");
var tapped=0; // value+1 of first tapped? When it reaches 13 theygo.
createCards();
shuffle();
deal();
function pop(i){ // do various things when a card is clicked
    console.log("pop i="+i+" nclicked="+nclicked);
    // toggle background color between white and yellow adjust nclicked
    card=document.getElementById("cd"+i);
    s=card.innerHTML.substring(14,18); // This should show the value and suit symbols
    nclicked++;
    v=1+vals.indexOf(s.substring(0,2).trim());
    if(nclicked==1) {
        v1=v;
        click1=i
        console.log("Card says "+s+" v1="+v1);
        status.innerHTML="1 v1="+v1;
        if(v1==13) {
            nclicked=0;
            nuke(i); // get rid of the card, replace it with a blank cell
            status.innerHTML="success";
        }
    }
    const backgroundColor = card.style.backgroundColor;
    if(backgroundColor=="yellow") {
        card.style.backgroundColor="white";
        nclicked--;
    } 
    else card.style.backgroundColor="yellow";
    if((nclicked)==2) {
        v2=v;
        click2=i;
        console.log("Card says "+s+" v2="+v2);
        if((v1+v2)==13) {// erase both cards
            nuke(click1);
            nuke(click2);
            nclicked=0;
            status.innerHTML="success";
        } else {
            sum=v1+v2;
            status.innerHTML="2 v1+v2="+sum;
        }


    }

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
// splice was a bad idea as removing <27 messes up the reserve
function nuke(cardno){ // try it the simplest way.
    console.log("nuke cardno="+cardno);
    document.getElementById("v"+cardno).innerHTML="";
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
