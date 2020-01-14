const electron = require('electron');
const {ipcRenderer} = electron;
const canvas = document.getElementById('canvas'); 
const ctx = canvas.getContext('2d');



ipcRenderer.on('window:resize', function(){
    ipcRenderer.send('canvas:resize', canvas);
});

document.getElementById('file').addEventListener('click', function(){
    document.getElementById('file').innerHTML = '123';
});

document.getElementById('maximize').addEventListener('click', function(){
    ipcRenderer.send('maximize');
});

document.getElementById('minimize').addEventListener('click', function(){
    ipcRenderer.send('minimize');
});

document.getElementById('close').addEventListener('click', function(){
    ipcRenderer.send('close');
});



canvas.addEventListener('mousedown', function(){
    ctx.beginPath();
    canvas.addEventListener('mousemove', paint, false);
});

ctx.lineCap = 'round';
ctx.strokeStyle = '#00CC99';




canvas.addEventListener('mouseup', function(e){   
    ctx.lineTo(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    ctx.stroke();
    canvas.removeEventListener('mousemove', paint, false); 
});

function paint(e){
    ctx.lineTo(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
    ctx.stroke();
}





function draw(){

}

