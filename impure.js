// impure functions pushed to the edge to handle dom
function appendCard(parentId,childId,y,content,color,clickable){ // create a new card with absolute offset string y
	let child=document.createElement("div");
	child.id=childId;
	child.classList="card "+color;
	child.style.position="absolute";
	child.style.width="100%";
	child.style.top=y;
	child.innerHTML=content;
	if(clickable) child.setAttribute("onclick","tryMove(this.id);");
	document.getElementById(parentId).appendChild(child);
}
function nchildren(destId) { // how many children in cascade j?
	return document.getElementById(destId).childElementCount;
}
function getTopId(destId) {
	return document.getElementById(destId).lastElementChild.id;
}
function addCard(srcId,destId,y){
	child=document.getElementById(srcId);
	child.style.top=y+"vw";
	document.getElementById(destId).append(child);
	console.log("addCard",srcId,destId);
	return true;
}
function faceUp(cascadeId){
    parent=document.getElementById(cascadeId);
    child=parent.lastElementChild;
    if(child){
        cardId=child.id.substring(1);
        child.setAttribute("onclick","tryMove(this.id);");
        child.innerHTML=createContent(cardId);
    }
}
