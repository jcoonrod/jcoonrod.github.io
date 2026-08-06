const ncards=52;
createCards();
deal();

function deal(){
    ndealt=0;
    for(i=0;i<7;i++){
    console.log("Dealing layer i="+i);
        for (j=0;j<i+1;j++){
            appendCard(ndealt);
            ndealt++;
        }
    }
}
function pop(i){
    console.log("pop i="+i);
    blank=document.createElement("div");
    blank.id="b"+i;
    blank.classList.add("blank");
    blank.style.width="12vw";
    blank.style.display='inline-block';
    blank.style.top='0';
    document.getElementById("v"+i).replaceWith(blank);
}

function clearBoard(){
//    for(i=0;i<27;i++) document.getElementById("v"+i).removeChild(document.getElementById("cd"+i));
}

function appendCard(i) { // add a card to cell vi
    console.log("AppendCard "+i);
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
