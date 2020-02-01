const electron = require('electron');
const { ipcRenderer } = electron;

var content = document.getElementById('content');
var lineNums = document.getElementById('lineNums');
var text = document.getElementById('text-container');
var lastLine;
var currentLineNum;
var fileData;
var currentLines;
const fs = require('fs') 

fs.readFile('Input.txt', (err, data) => { 
    if (err) throw err; 
    fileData = data;
    let lines =  fileData.toString().split('\n'); 
    openFile(lines);
}); 

function openFile(lines){

    let span = document.createElement('SPAN');
    span.style = 'display:block;position:relative;left:30px;background-color:#333B42;';
    span.id = 'textSpan';
    span.innerHTML = fileData.toString();
    text.appendChild(span);

    for(lastLine = 1; lastLine < lines.length+1; lastLine++){
        let numSpan = document.createElement('SPAN');
        numSpan.style = 'position:absolute;width:30px;height:22px;border:10px;user-select:none;padding:0;margin: 0;z-index:-3;';
        numSpan.innerHTML = lastLine;
        lineNums.appendChild(numSpan);
        lineNums.appendChild(document.createElement('BR'));

    }
}

content.addEventListener('scroll', (e) => {
    content.scrollLeft = 0;
    var topPos = content.scrollTop;
    lineNums.scrollTop = topPos;
});

document.addEventListener('keydown', (e) => {
    if (e.code === "Enter"){
        if(document.activeElement == text){
            let span = document.createElement('SPAN');
            span.style = 'position:absolute;width:30px;height:22px;border:10px;user-select:none;padding:0;margin: 0;z-index:-3;';
            span.innerHTML = lastLine++;
            lineNums.appendChild(span);
            lineNums.appendChild(document.createElement('BR'));
        }        
    }
    else if (e.code === "Backspace"){
        var arr = text.children[0].innerHTML.split('\n');
        while(arr[arr.length-1] == "" && arr[arr.length-2] == ""){
            arr.pop();
        }
        var temp = Array.from(lineNums.children);
        while(arr.length < temp.length/2){
            temp[temp.length-1].remove();
            temp[temp.length-2].remove();
            temp.pop();
            temp.pop();
            console.log(arr.length + ' ' + temp.length/2);   
        }
    }
});

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

function cbc(color, id){
    document.getElementById(id).style.backgroundColor = color;
} 