// // references: https://codepen.io/calincojo/pen/wBQqYm
// // references: https://jasonlawrencewong.com/checkers/index.html
// // references: https://hackernoon.com/how-to-build-a-multiplayer-browser-game-4a793818c29b
// // references: https://www.npmjs.com/get-npm
"use strict";
// // function createBoard() = 8 rows with 8 div elements, with pieces
// // - find one ore more elements
// // - create a new element
// // - modifying an elemnet
// // - positioning an element

// // function allowDrop()
// // function dragOver(e)
// // function dragStart(e) = Handle the dragstart event
// // function dragEnd(e) = Handle the dragend event
// // function drop(e) = Handle the drop event
// // function dragEnter(e) = Handle the dragenter event
// // function dragLeave(e) = Handle the dragleave event
// // function isValidMove(source, target, drop)
// // function kingMe(piece)
// // function enableNextPlayer(piece) 
// import styles from './styles.css';

var socket = io.connect('http://localhost:3000/');
// socket.on('connect') is an even fired upon a successful connection
socket.on('connect', () => {
    // function callback 
    socket.emit('callServer', 'Hello Server');
});
//socket listner
socket.on('CallClient', (data) => {
    alert(data); // Hello Client
})
// # = id, . = class
socket.on('broad', function(data) {
    $('.row').append(styles + data);
});
//------------------------------------------------
// messaging
var form;

const submitForm = (event) => {
    form = document.getElementById('chatForm'); // form id
    event.preventDefault(); // prevents page reloading
    var messageInput = document.getElementById('m');  // input id

    // send chat message to the server
    socket.emit('chat', messageInput.value);

    messageInput.value = '';
    return false;
};

socket.on('chat message', (message) => {
    var node = document.createElement('li');
    var textnode = document.createTextNode(message);
    node.appendChild(textnode);

    document.getElementById('message').appendChild(node);
});
//------------------------------------------------
const createBoard = () => {
    var board = document.getElementById("board"); // find all elements like this
    for (var y=0; y < 8; y++) {
        var row = document.createElement("div");  // create div element for each
        row.className = "row"; // set className property of div to "row"
        board.appendChild(row); // insert into the body element

        for (var x=0; x < 8; x++) {
            var square = document.createElement("div");
            square.id = x.toFixed() + y.toString();
            if ((x + y) % 2) {
                square.className = "bblack";
            }
            else {
                square.className = "bwhite";
            }

            // If the square should have a piece in it...
            if ((x + y) % 2 != 0 && y != 3 && y != 4) {
                var img = document.createElement("img");
                if (y < 3) {
                    img.id = "w" +square.id;
                    img.src = "images/WhitePiece.png";
                }
                else {
                    img.id = "b" + square.id;
                    img.src = "images/BlackPiece.png";
                }
                img.className = "piece";
                img.setAttribute("draggable", "true");
                square.appendChild(img);
            }
            square.setAttribute("draggable", "false");
            row.appendChild(square);
        }
    }
}

const allowDrop = () => {
    // Wire up the target events on all the black squares
    var squares = document.querySelectorAll('.bblack');
    var i = 0;
    while (i < squares.length) {
        var s = squares[i++];
        // Add the event listeners
        s.addEventListener('dragover', dragOver, false);
        s.addEventListener('drop', drop, false);
        s.addEventListener('dragenter', dragEnter, false);
        s.addEventListener('dragleave', dragLeave, false);
        }

    // Wire up the source events on all of the images
    i = 0;
    var pieces = document.querySelectorAll('img');
    while (i < pieces.length) {
        var p = pieces[i++];
        p.addEventListener('dragstart', dragStart, false);
        p.addEventListener('dragend', dragEnd, false);
    }
}

// Handle the dragover event
const dragOver = (e) => {
    e.preventDefault();

    // Get the img element that is being dragged
    var dragID = e.dataTransfer.getData("text");
    var dragPiece = document.getElementById(dragID);

    // Work around - if we can't get the dataTransfer, don't
    // disable the move yet, the drop event will catch this
    if (dragPiece) {
        if (e.target.tagName === "DIV" &&
            isValidMove(dragPiece, e.target, false)) {
            e.dataTransfer.dropEffect = "move";
        }
        else {
            e.dataTransfer.dropEffect = "none";
        }
    }
}

const dragStart = (e) => {
    if (e.target.draggable) {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text", e.target.id);
        e.target.classList.add("selected");

        // Use a custom drag image
        var dragIcon = document.createElement("img");
        dragIcon.src = "images/mario-run.gif";
        e.dataTransfer.setDragImage(dragIcon, 0, 0);
    }
}

const dragEnd = (e) => {
    e.target.classList.remove("selected");
}

const drop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    // Get the img element that is being dragged
    var droppedID = e.dataTransfer.getData("text");
    var droppedPiece = document.getElementById(droppedID);

    if (droppedPiece &&
    e.target.tagName === "DIV" &&
    isValidMove(droppedPiece, e.target, true)) {
        // Create a new img on the target location
        var newPiece = document.createElement("img");
        newPiece.src = droppedPiece.src;
        newPiece.id = droppedPiece.id.substr(0, 1) + e.target.id;
        newPiece.draggable = droppedPiece.draggable;

        if (droppedPiece.draggable){
            newPiece.classList.add("jumpOnly");
        }
        newPiece.classList.add("piece");

        newPiece.addEventListener("dragstart", dragStart, false);
        newPiece.addEventListener("dragend", dragEnd, false);
        e.target.appendChild(newPiece);

        // Remove the previous image
        droppedPiece.parentNode.removeChild(droppedPiece);
        
        // Remove the drop effect from the target element
        e.target.classList.remove('drop');

        // See if the piece needs to be promoted
        kingMe(newPiece);
    }
}

const dragEnter = (e) => {
    // Get the img element that is being dragged
    var dragID = e.dataTransfer.getData("text");
    var dragPiece = document.getElementById(dragID);

    if (dragPiece &&
        e.target.tagName === "DIV" &&
        isValidMove(dragPiece, e.target, false)) {
        e.target.classList.add('drop');
    }
}

const dragLeave = (e) => {
    e.target.classList.remove("drop");  
}

const isValidMove = (source, target, drop) => {
    // Get the piece prefix and location
    var startPos = source.id.substr(1, 2);
    var prefix = source.id.substr(0, 1);

    // Get the drop location, strip off the prefix, if any
    var endPos = target.id;
    if (endPos.length > 2) {
        endPos = endPos.substr(1, 2);
    }

    // You can't drop on the existing location
    if (startPos === endPos) {
        return false;
    }

    // You can't drop on occupied square
    if (target.childElementCount != 0) {
        return false;
    }

    var jumpOnly = false;
    if (source.classList.contains("jumpOnly")) {
        jumpOnly = true;
    }

    // Compute the x and y coordinates
    var xStart = parseInt(startPos.substr(0, 1));
    var yStart = parseInt(startPos.substr(1, 1));
    var xEnd = parseInt(endPos.substr(0, 1));
    var yEnd = parseInt(endPos.substr(1, 1));

    switch (prefix) {
        // For white pieces...
        case "w":
            if (yEnd <= yStart)
                return false; // Can't move backwards
            break;

        // For black pieces...
        case "b":
            if (yEnd >= yStart)
                return false; // Can't move backwards
            break;
    }

    // These rule apply to all pieces
    if (yStart === yEnd || xStart === xEnd)
        return false; // Move must be diagonal

    // Can't move more than two spaces
    if (Math.abs(yEnd - yStart) > 2 || Math.abs(xEnd - xStart) > 2)
        return false; 
    
    // Only jumps are allowed 
    if (Math.abs(xEnd - xStart) === 1 && jumpOnly)
        return false; 

    var jumped = false;

    // If moving two spaces, find the square that is jumped
    if (Math.abs(xEnd - xStart) === 2) {
        var pos = ((xStart + xEnd) / 2).toString() +
                  ((yStart + yEnd) / 2).toString();
        var div = document.getElementById(pos);
        if (div.childElementCount === 0)
            return false;  // Can't jump an empty square
        var img = div.children[0];
        if (img.id.substr(0, 1).toLowerCase() === prefix.toLowerCase())
            return false; // Can't jump a piece of the same color

        // If this function is called from the drop event
        // Remove the jumped piece
        if (drop) {
            div.removeChild(img);
            jumped = true;
        }
    }

    // Set the draggable attribute so the next player can take a turn
    if (drop) {
        enableNextPlayer(source);

        // If we jumped a piece, we're allowed to go again
        if (jumped) {
            source.draggable = true;
            source.classList.add("jumpOnly"); // But only for another jump
        }
    }
    return true;
}

const kingMe = (piece) => {
    
    // If we're already a king, just return
    if (piece.id.substr(0, 1) === "W" || piece.id.substr(0, 1) === "B")
        return;

    var newPiece;

    // If this is a white piece on the 7th row
    if (piece.id.substr(0, 1) === "w" && piece.id.substr(2, 1) === "7") {
        newPiece = document.createElement("img");
        newPiece.src = "images/WhiteKing.png";
        newPiece.id = "W" + piece.id.substr(1, 2);
    }
    
    // If this is a black piece on the 0th row
    if (piece.id.substr(0, 1) === "b" && piece.id.substr(2, 1) === "0") {
        var newPiece = document.createElement("img");
        newPiece.src = "images/BlackKing.png";
        newPiece.id = "B" + piece.id.substr(1, 2);
    }

    // If a new piece was created, set its properties and events
    if (newPiece) {
        newPiece.draggable = true;
        newPiece.classList.add("piece");

        newPiece.addEventListener('dragstart', dragStart, false);
        newPiece.addEventListener('dragend', dragEnd, false);

        var parent = piece.parentNode;
        parent.removeChild(piece);
        parent.appendChild(newPiece);
    }
}

const enableNextPlayer = (piece) => {

    // Get all of the pieces
    var pieces = document.querySelectorAll('img');

    var i = 0;
    while (i < pieces.length) {
        var p = pieces[i++];

        // If this is the same color that just moved, disable dragging
        if (p.id.substr(0, 1).toUpperCase() ===
            piece.id.substr(0, 1).toUpperCase()) {
            p.draggable = false;
        }
        // Otherwise, enable dragging
        else {
            p.draggable = true;
        }
        p.classList.remove("jumpOnly");
    }
}
