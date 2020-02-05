const electron = require('electron');
const { ipcRenderer } = electron;

const content = document.getElementById('content');
const lineNums = document.getElementById('lineNums');
const text = document.getElementById('text-container');
let lastLine;
let currentLineNum;
let currentLines;
let filepath;
let dropdownIsVisible = false;
const fs = require('fs');
const titleText = document.getElementById('title-text');

let data;
const app_path = electron.remote.app.getPath('userData');
try{
    data = require(app_path + '\\data.json');
}catch(err){
    data = undefined;
}
// const spawn = require('child_process').spawn;
// const bat = spawn('cmd.exe', ['/c', 'C:\\Users\\Kirin\\OneDrive\\Desktop\\Electron-test\\test.bat', '1111', '3333333']);  IT WORKS!!!!!

// bat.stdout.on('data', (data) => {
//     let str = String.fromCharCode.apply(null, data);          output from batch also option 1 for a callback
//     console.info(str);
// });

// bat.on('exit', (code) => {
//      console.log(`Child exited with code ${code}`);      output from batch also option 2 for a callback     
// });

if(data == undefined || data.cwd == undefined){
    initWithDirectory(null);
}
else{
    initWithDirectory(data.cwd);
}

function initWithDirectory(dir){
    if(dir == undefined){
        document.getElementById('lineNums').innerHTML = '';
        document.getElementById('text-container').innerHTML = '';
        const lines = [0 , 0, 0];
        const span = document.createElement('SPAN');
        span.style = 'display:block;position:relative;left:50px;background-color:#333B42;color:white;word-break:keep-all;white-space:nowrap';
        span.id = 'textSpan';
        span.innerHTML = "\n\n";
        span.innerHTML += '\n';
        span.contentEditable = 'plaintext-only';
        const numOfLines = lines.length + 1;  
        lines = lines.toString().replace(/,/g, ''); // replace all commas with nothing
        text.appendChild(span);
        for (lastLine = 1; lastLine < numOfLines; lastLine++) {
            const numSpan = document.createElement('SPAN');
            numSpan.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            numSpan.innerHTML = lastLine;
            lineNums.appendChild(numSpan);
            lineNums.appendChild(document.createElement('BR'));
        }
    }
    else{
        titleText.innerHTML = dir.substring(dir.lastIndexOf('\\')+1);
    }
}

content.addEventListener('scroll', (e) => {
    content.scrollLeft = 0;
    const topPos = content.scrollTop;
    lineNums.scrollTop = topPos;
});

document.addEventListener('keydown', (e) => {
    if (e.code === "Enter" || (e.code === "KeyZ" && e.ctrlKey)) {
        if (document.activeElement == document.getElementById('textSpan')) {
            const span = document.createElement('SPAN');
            span.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            span.innerHTML = lastLine++;
            lineNums.appendChild(span);
            lineNums.appendChild(document.createElement('BR'));
        }
    }
    if(e.code === "KeyS" && e.ctrlKey)
        saveCurrentFile();
});

document.addEventListener('keyup', (e) => {
    if (e.code === "Backspace" || (e.code === "KeyZ" && e.ctrlKey)) {
        const arr = text.children[0].innerHTML.split('\n');
        if (arr[arr.length - 1] === "") {
            arr.pop();
        }
        tempstr = text.children[0].innerHTML;
        const temp = Array.from(lineNums.children);
        while (arr.length < temp.length / 2) {
            temp[temp.length - 1].remove();
            temp[temp.length - 2].remove();
            temp.pop();
            temp.pop();
        }
        lastLine = arr.length + 1;
    }
});

ipcRenderer.on('save-last-closed-file', function (e) {
    filepath = (filepath === undefined || filepath === "" ? data.lastfilepath : filepath);
    const data = {
        lastfilepath: filepath,
        cwd: process.cwd()
    }
    const jsonString = JSON.stringify(data)
    fs.writeFile(app_path + '\\data.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
});


document.getElementById('file').addEventListener('click', function () {
    const temp = document.getElementById('file-dropdown');
    hideAllDropdowns('file');
    if (temp.style.display === "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

const { dialog } = require('electron').remote;

document.getElementById('open-file').addEventListener('click', function (event) {
    dialog.showOpenDialog((fileNames) => {
    }).then(result => {
        openFile(result.filePaths);
    }).catch(function(err){
        console.log(err);
    });
    hideAllDropdowns();
});

document.getElementById('open-last-file').addEventListener('click', function (event) {
    openFile(data.lastfilepath);
    hideAllDropdowns();
});

function openFile(path) {
    console.log(path);
    filepath = path;
    document.getElementById('lineNums').innerHTML = '';
    document.getElementById('text-container').innerHTML = '';
    fs.readFile(path[0], (err, file_data) => {
        if (err) throw err;
        let lines = file_data.toString().split('\n');
        const span = document.createElement('SPAN');
        span.style = 'display:block;position:relative;left:50px;background-color:#333B42;color:white;word-break:keep-all;white-space:nowrap';
        span.id = 'textSpan';
        span.innerHTML = file_data.toString();
        span.innerHTML += '\n';
        span.contentEditable = 'plaintext-only';
        const numOfLines = lines.length + 1;  
        lines = lines.toString().replace(/,/g, '');
        text.appendChild(span);
        for (lastLine = 1; lastLine < numOfLines; lastLine++) {
            const numSpan = document.createElement('SPAN');
            numSpan.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            numSpan.innerHTML = lastLine;
            lineNums.appendChild(numSpan);
            lineNums.appendChild(document.createElement('BR'));
        }
    });
}

document.getElementById('save-file').addEventListener('click', function(){
    saveCurrentFile();
});

function saveCurrentFile(){
    const temp = document.getElementById('textSpan').innerHTML;
    fs.writeFile(filepath[0], temp.substring(0, temp.lastIndexOf('\n')), function(err) {
        if(err)
            console.log(err);
    });
}



document.getElementById('edit').addEventListener('click', function () {
    const temp = document.getElementById('edit-dropdown');
    hideAllDropdowns('edit');
    if (temp.style.display === "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

document.getElementById('view').addEventListener('click', function () {
    const temp = document.getElementById('view-dropdown');
    hideAllDropdowns('view');
    if (temp.style.display === "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

document.getElementById('help').addEventListener('click', function () {
    const temp = document.getElementById('help-dropdown');
    hideAllDropdowns('help');
    if (temp.style.display === "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

document.getElementById('file').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns('file');
        document.getElementById('file-dropdown').style.display = 'block';
    }
});

document.getElementById('edit').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns('edit');
        document.getElementById('edit-dropdown').style.display = 'block';
    }
});

document.getElementById('view').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns('view');
        document.getElementById('view-dropdown').style.display = 'block';
    }
});

document.getElementById('help').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns('help');
        document.getElementById('help-dropdown').style.display = 'block';
    }
});

document.getElementById('run').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns('run');
        document.getElementById('run-dropdown').style.display = 'block';
    }
});


document.getElementById('content').addEventListener('mousedown', function (e) {
    document.getElementById('cursor-follower').style.top = "" + (e.clientY - 60) + "px";
    hideAllDropdowns();
    dropdownIsVisible = false;
});



function hideAllDropdowns(str) {
    if (str === 'file') {
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str === 'edit') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str === 'view') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str === 'help') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str === 'run'){
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
    }
    else {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
}

document.getElementById('maximize').addEventListener('click', function () {
    ipcRenderer.send('maximize');
});

document.getElementById('minimize').addEventListener('click', function () {
    ipcRenderer.send('minimize');
});

document.getElementById('close').addEventListener('click', function () {
    ipcRenderer.send('close');
});

function cbc(color, id) {
    document.getElementById(id).style.backgroundColor = color;
}