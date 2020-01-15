const electron = require('electron');
const { ipcRenderer } = electron;
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let panMode = false;


ipcRenderer.on('window:resize', function (e, width, height) {
    canvas.width = width;
    canvas.height = height;
});

document.getElementById('file').addEventListener('click', function () {
    document.getElementById('file').innerHTML = '123';
});

document.getElementById('maximize').addEventListener('click', function () {
    ipcRenderer.send('maximize');
});

document.getElementById('minimize').addEventListener('click', function () {
    ipcRenderer.send('minimize');
});

document.getElementById('close').addEventListener('click', function () {
    ipcRenderer.send('close');
});


let xo, yo, x1, y1;
canvas.addEventListener('mousedown', function (e) {
    if(e.button == 0){
        if(!panMode){
            ctx.beginPath();
            canvas.addEventListener('mousemove', paint, false);
        }else{
            xo = e.clientX;
            yo = e.cllientY;
            canvas.addEventListener('mousemove', pan, false);
        }
    }
});

ctx.lineCap = 'round';
ctx.strokeStyle = '#00CC99';

canvas.addEventListener('mouseup', function (e) {
    if(e.button == 0){
        if(!panMode){
            ctx.lineTo(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
            ctx.stroke();
        }
        canvas.removeEventListener('mousemove', paint, false);
        canvas.removeEventListener('mousemove', pan, false);
    }
});

function pan(e) {
    window.scrollTo(e.pageX, e.pageY);
}

function paint(e) {
    ctx.lineTo(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    ctx.stroke();
}

window.addEventListener('keydown', function(e) {
if(e.keyCode == 32 && e.target == document.body) {
    e.preventDefault();
    panMode = true;
}
});

window.addEventListener('keyup', function(e) {
    if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
        pan = false;
    }
    });


elmnt = document.getElementById("toolbar");

var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
document.getElementById(elmnt.id + "-draggable").onmousedown = dragMouseDown;


function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
}

function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
}

function closeDragElement() {
    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;
}

