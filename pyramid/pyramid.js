const ncards=52;
var nlast=52; //this will decrease as we delete cards from the stack
var ndealt=0;
var nclicked=0;
var score=0;
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

function showStatus(s){  // pass in anything beyond score and nclicked
    s2=score+" Clicked:"+nclicked+" "+s;
    status.innerHTML=s2;
}

function pop(i){ // do various things when a card is clicked
    console.log("pop i="+i+" nclicked="+nclicked);
    // first determine if card is visible
    if(i>20) visibility=true;
    else {
        left=i+offsets[i]; right=left+1;
        leftcard=document.getElementById("v"+left);
        rightcard=document.getElementById("v"+right);
        visibility=(leftcard.innerHTML=="")&&(rightcard.innerHTML=="");
    }
    if(!visibility){
        showStatus("Not clickable");
        return;
    }
    card=document.getElementById("cd"+i);
    s=card.innerHTML.substring(14,18); // This should show the value and suit symbols
    nclicked++;
    v=1+vals.indexOf(s.substring(0,2).trim());
    // toggle background color between white and yellow adjust nclicked
    if(nclicked==1) {
        v1=v;
        click1=i
        console.log("Card says "+s+" v1="+v1);
        showStatus("v1="+v1);
        if(v1==13) {
            nclicked=0;
            nuke(i); // get rid of the card, replace it with a blank cell
            showStatus("success");
        }
    }
    if((nclicked)==2) {
        v2=v;
        click2=i;
        console.log("Card says "+s+" v2="+v2);
        if((v1+v2)==13) {// erase both cards
            nuke(click1);
            nuke(click2);
            nclicked=0;
            showStatus("success");
        } else {
            sum=v1+v2;
            showStatus("v1+v2="+sum);
        }
    }
    const backgroundColor = card.style.backgroundColor;
    if(backgroundColor=="yellow") {
        card.style.backgroundColor="white";
        nclicked--;
    } else if(nclicked!==0) card.style.backgroundColor="yellow";
    showStatus("");

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
function whiten(cardno) {
    document.getElementById("cd"+cardno).style.backgroundColor="white";
}

function next(){
    if(nclicked && click1<28) whiten(click1);
    if(nclicked && click2<28) whiten(click2);
    nclicked=0; click1=-1; click2=-1
    console.log("Next "+ndealt);
    showStatus("Next..");
    const cardno=deck[ndealt];
    s='<div id="cd28" class="card" style="backgroundColor: white;">'
    +cards[cardno]+'</dev>';
    document.getElementById("v28").innerHTML=s;
    ndealt++;
    if(ndealt==nlast) ndealt=28;
}

function nuke(cardno){ // try it the simplest way.
    console.log("nuke cardno="+cardno);
    card=document.getElementById("v"+cardno);
    card.innerHTML="";
    nclicked=0;
    score++;
    showStatus("Success");
    if(cardno<28) card.removeAttribute("onclick");
}

function clearBoard(){
    for(i=0;i<28;i++) {
        cell=document.getElementById("v"+i);
        while(cell && (child=cell.lastChild)) cell.removeChild(child);
    }
    lefts=[];
    rights=[];
    nclicked=0;
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
