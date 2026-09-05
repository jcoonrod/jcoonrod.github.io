// impure functions pushed to the edge to handle dom
function dealCard(parentId,childId,y,content,color,clickable){ // create a new card with absolute offset string y
	let child=document.createElement("div");
	child.id=childId;
	child.classList="card "+color;
	child.style.position="absolute";
	child.style.width="100%";
	child.style.top=y+"vw";
	child.innerHTML=content;
	if(clickable) child.setAttribute("onclick","tryMove(this.id);");
	document.getElementById(parentId).appendChild(child);
}
function nchildren(destId) { // how many children in cascade j?
	const n=document.getElementById(destId).childElementCount;
	console.log("nchildren",destId,n);
	return n;
}
function getParent(childId){
	console.log("getParent",childId);
	return document.getElementById(childId).parentElement;
}
function moveAll(srcId,destId){ // move all the children
	const n=nchildren(srcId);
	console.log("moveAll",srcId,n);
	for(let i=0;i<n;i++){
		cardId=getTopId(srcId); // find the top child
		console.log("move",cardId,destId);
	 	addCard(cardId,destId,0);
	}
}
function getTopId(destId) {
	return document.getElementById(destId).lastElementChild.id;
}
function addCard(srcId,destId,y){
	console.log("addCard",srcId,destId,y);
	child=document.getElementById(srcId);
	child.style.top=y+"vw";
	document.getElementById(destId).append(child);
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
function resetCard(cardId,content){
	console.log("resetCard",cardId,content);
	document.getElementById("cardId").innerHTML=content;
}