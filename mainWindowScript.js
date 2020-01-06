const electron = require('electron');
const {ipcRenderer} = electron;
const ul = document.getElementById('list');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
var paint = false;


    
window.addEventListener('onresize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth - 6;
canvas.height = window.innerHeight - 6;

canvas.addEventListener('mousedown', function(e){
    console.log(window.innerWidth + " " + window.innerHeight);
    paint = true;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', function(e){
    if(paint){
        //getCursorPosition(canvas, e);
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX;// - rect.left
        const y = event.clientY;// - rect.top
        ctx.lineTo(x, y);
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', function(e){
    paint = false;
    //ctx.beginPath();
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
}

// ipcRenderer.on('item:add', function(e, item){
//     const li = document.createElement('li');
//     const itemText = document.createTextNode(item);
//     li.appendChild(itemText);
//     ul.appendChild(li);
// });

// ipcRenderer.on('item:clear', function(){
//     ul.innerHTML = '';
// });

// ul.addEventListener('dblclick', removeItem);

// function removeItem(e){
//     e.target.remove();
// }

function draw(){
    
}

