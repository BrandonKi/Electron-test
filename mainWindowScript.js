const electron = require('electron');
const { ipcRenderer } = electron;

var content = document.getElementById('content');
var lineNums = document.getElementById('lineNums');
var text = document.getElementById('text-container');
var lastLine;
var currentLineNum;
var currentLines;
var filepath;
var dropdownIsVisible = false;
const fs = require('fs');

const data = require(process.cwd() + '\\.user-settings\\data.json');
console.log(data);
// const spawn = require('child_process').spawn;
// const bat = spawn('cmd.exe', ['/c', 'C:\\Users\\Kirin\\OneDrive\\Desktop\\Electron-test\\test.bat', '1111', '3333333']);  IT WORKS!!!!!

// bat.stdout.on('data', (data) => {
//     var str = String.fromCharCode.apply(null, data);          output from batch also option 1 for a callback
//     console.info(str);
// });

// bat.on('exit', (code) => {
//      console.log(`Child exited with code ${code}`);      output from batch also option 2 for a callback     
// });

content.addEventListener('scroll', (e) => {
    content.scrollLeft = 0;
    var topPos = content.scrollTop;
    lineNums.scrollTop = topPos;
});

document.addEventListener('keydown', (e) => {
    if (e.code === "Enter" || (e.code === "KeyZ" && e.ctrlKey)) {
        if (document.activeElement == text) {
            let span = document.createElement('SPAN');
            span.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin: 0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            span.innerHTML = lastLine++;
            lineNums.appendChild(span);
            lineNums.appendChild(document.createElement('BR'));
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === "Backspace" || (e.code === "KeyZ" && e.ctrlKey)) {
        var arr = text.children[0].innerHTML.split('\n');
        if (arr[arr.length - 1] == "") {
            arr.pop();
        }
        tempstr = text.children[0].innerHTML;
        var temp = Array.from(lineNums.children);
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
    filepath = (filepath == undefined || filepath == "" ? data.lastfilepath : filepath);
    const data = {
        lastfilepath: filepath,
        cwd: process.cwd()
    }
    const jsonString = JSON.stringify(data)
    fs.writeFile(process.cwd() + '\\.user-settings\\data.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
});


document.getElementById('file').addEventListener('click', function () {
    var temp = document.getElementById('file-dropdown');
    hideAllDropdowns('file');
    if (temp.style.display == "block") {
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
        //do nothing because that sounds like a good idea
    });
    hideAllDropdowns();
});

document.getElementById('open-last-file').addEventListener('click', function (event) {
    openFile(data.lastfilepath);
    hideAllDropdowns();
});

function openFile(path) {
    filepath = path;
    document.getElementById('lineNums').innerHTML = '';
    document.getElementById('text-container').innerHTML = '';
    fs.readFile(path[0].substring(path[0].lastIndexOf('\\') + 1), (err, data) => {
        if (err) throw err;
        let lines = data.toString().split('\n');
        let span = document.createElement('SPAN');
        span.style = 'display:block;position:relative;left:50px;background-color:#333B42;color: white;';
        span.id = 'textSpan';
        span.innerHTML = data.toString();
        span.innerHTML += '\n';
        span.contentEditable = 'plaintext-only';
        let numOfLines = lines.length + 1;  
        lines = lines.toString().replace(/,/g, '');
        text.appendChild(span);
        for (lastLine = 1; lastLine < numOfLines; lastLine++) {
            let numSpan = document.createElement('SPAN');
            numSpan.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin: 0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            numSpan.innerHTML = lastLine;
            lineNums.appendChild(numSpan);
            lineNums.appendChild(document.createElement('BR'));
        }
    });
}

document.getElementById('edit').addEventListener('click', function () {
    var temp = document.getElementById('edit-dropdown');
    hideAllDropdowns('edit');
    if (temp.style.display == "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

document.getElementById('view').addEventListener('click', function () {
    var temp = document.getElementById('view-dropdown');
    hideAllDropdowns('view');
    if (temp.style.display == "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
});

document.getElementById('help').addEventListener('click', function () {
    var temp = document.getElementById('help-dropdown');
    hideAllDropdowns('help');
    if (temp.style.display == "block") {
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


document.getElementById('content').addEventListener('mousedown', function () {
    hideAllDropdowns();
    dropdownIsVisible = false;
});



function hideAllDropdowns(str) {
    if (str == 'file') {
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str == 'edit') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str == 'view') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('help-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str == 'help') {
        document.getElementById('file-dropdown').style.display = "none";
        document.getElementById('edit-dropdown').style.display = "none";
        document.getElementById('view-dropdown').style.display = "none";
        document.getElementById('run-dropdown').style.display = "none";
    }
    else if (str == 'run'){
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