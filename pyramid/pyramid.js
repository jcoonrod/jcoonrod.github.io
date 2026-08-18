const ncards=52;
var nlast=52; //this will decrease as we delete cards from the stack
var ndealt=0;
var nclicked=0;
var cardno=-1; // make this global for ease of debugging
var score=0;
var click1; // which card was clicked first?
var click2; // which card was clicked second?
var nuked=Array(52).fill(false); // this track which cards have been nuked, originally set to false
const offsets=[1,2,2,3,3,3,4,4,4,4,5,5,5,5,5,6,6,6,6,6,6];
const xi=[44,38,32,26,20,14,8]; // left of first card;
const status=document.getElementById("status");
var tapped=0; // value+1 of first tapped? When it reaches 13 theygo.
createCards();
shuffle();
deal();

function showStatus(s){  // pass in anything beyond score and nclicked
    s2=score+" Clicked:"+nclicked+" "+s;
    status.innerHTML=s2;
}

function pop(cardno){ // do various things when a card is clicked
    console.log("pop cardno="+cardno+" nclicked="+nclicked);
    // first determine if card is visible
    if(cardno>20) visibility=true;
    else {
        left=cardno+offsets[cardno]; right=left+1;
        leftcard=document.getElementById("cd"+left);
        rightcard=document.getElementById("cd"+right);
        visibility=!leftcard && !rightcard;
    }
    if(!visibility){
        showStatus("Not clickable");
        return;
    }
    const card=document.getElementById("cd"+cardno);
    const s=card.innerHTML.substring(14,18); // This should show the value and suit symbols
    console.log("Visibility of cardno="+cardno+" s="+s);
    nclicked++;
    const v=1+vals.indexOf(s.substring(0,2).trim());
    console.log("Pop cardno="+cardno+" v="+v);
    // toggle background color between white and yellow adjust nclicked
    if(nclicked==1) {
        v1=v;
        click1=cardno
        console.log("Card says "+s+" v1="+v1);
        showStatus("v1="+v1);
        if(v1==13) { // Kings can jump up on their own
            nclicked=0;
            nuke(cardno); // get rid of the card
            showStatus("success");
        }
    }
    if((nclicked)==2) {
        v2=v;
        click2=cardno;
        console.log("Card2 says "+s+" v2="+v2);
        if((v1+v2)==13) {// erase both cards
            nuke(click1);
            nuke(click2);
            nclicked=0;
            showStatus("success");
        } else {
            const sum=v1+v2;
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
    for(let i=0;i<7;i++){ // i is row
        const y=10+i*5;
        const x0=xi[i];
//    console.log("Dealing layer i="+i);
        for (let j=0;j<i+1;j++){
            makeCard(ndealt,x0+j*12,y);
            ndealt++;
        }
    }
}
function whiten(cardno) {
    document.getElementById("cd"+cardno).style.backgroundColor="white";
    nclicked--;
    if(cardno==click1) click1=-1;
    if(cardno==click2) click2=-1;
}

function next(){ // put the next flipped card into the flip cell
    if(nclicked) whiten(click1);
    if(nclicked) whiten(click2);
    removeCard(28); // delete the old card
    nclicked=0; click1=-1; click2=-1;
    console.log("Next "+ndealt);
    showStatus("Next..");
    // check if the next card was already deleted, if so skip them
    while(nuked[ndealt] && ndealt<52) ndealt++;
    if(ndealt>=52) {ndealt=28;while(nuked[ndealt] && ndealt<52) ndealt++;}
    makeCard(ndealt,12,10);
    ndealt++;
    if(ndealt==53)ndealt=28;
}

function removeCard(cardno){
    card=document.getElementById("cd"+cardno);
    if(card) document.body.removeChild(card);
}

function nuke(cardno){ // try it the simplest way.
    // if cardno==28 we much convert its contents to tag the "real" card number
    console.log("nuke cardno="+cardno);
    const card=document.getElementById("cd"+cardno);
    let realcardno=28;
    if(cardno==28){ // surely there is a better way to do this!
        const s=card.innerHTML.substring(14,18);
        const v=vals.indexOf(s.substring(0,2).trim());
        const b=s.indexOf(' ');
        const suit=suits.indexOf(s.substring(b+1,b+2));
        const realcard=13*suit+v;
        realcardno=deck.indexOf(realcard);
        console.log("Card s="+s+" b="+b+" suit="+suit+" converts to "+realcardno );
    }
    nuked[realcardno]=true; // tag as already nuked
    document.body.removeChild(card);
    nclicked=0;
    score++;
    showStatus("Success");
}

function clearBoard(){
    for(i=0;i<29;i++) removeCard(i);
    nuked.fill(false);
    nclicked=0;
    click1=0;
    click2=0;
    score=0;
}   

function makeCard(cardno, x,y) { // add a card document at large
    console.log("MakeCard cardno="+cardno+" x="+x+" y="+y);
    card=document.createElement("div");
    card.id="cd"+Math.min(28,cardno);
    card.classList.add("card");
    card.style.position="absolute";
    card.style.left=x+"vw";
    card.style.top=y+"vw";
    card.setAttribute("onclick","pop("+Math.min(28,cardno)+");");
    card.style.backgroundColor="white";
    card.innerHTML=cards[deck[cardno]];
    document.body.appendChild(card);
}
