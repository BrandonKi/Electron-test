const electron = require('electron');
const { ipcRenderer } = electron;


const terminal = document.getElementById('terminal');
const terminal_resize = document.getElementById('terminal-resizer');
const content = document.getElementById('content');
const lineNums = document.getElementById('lineNums');
const text = document.getElementById('text-container');
let tab1_code;
let lastLine;
let currentLineNum;
let currentLines;
let filepath;
let filename;
let dropdownIsVisible = false;
const fs = require('fs');
const titleText = document.getElementById('title-text');
let currentFileIsSaved = false;

let data;
const app_path = electron.remote.app.getPath('userData');

try{
    data = require(app_path + '\\data.json');
}catch(err){
    data = undefined;
}

if(data == undefined || data.unsavedfilecontent == "" || data.lastfilepath == undefined){
    initWithDirectory(null, 0);
}
else if (data.unsavedfilecontent != undefined && data.unsavedfilecontent != ''){
    initWithDirectory(data.lastfilepath, 1);
}
else{
    initWithDirectory(data.cwd, 2);
}

function initWithDirectory(dir, arg){
    filepath = dir;
    switch(arg){
        case 0:
            initTextContent('\n');
            break;
        case 1:
            filename = dir.substring(dir.lastIndexOf('\\')+1);
            initTextContent(data.unsavedfilecontent);
            break;
        case 2:
            filename = dir.substring(dir.lastIndexOf('\\')+1);
            titleText.innerHTML = dir.substring(dir.lastIndexOf('\\')+1);
            break;
    }
}

content.addEventListener('scroll', (e) => {
    const topPos = content.scrollTop;
    lineNums.scrollTop = topPos;
});

document.addEventListener('keydown', (e) => {
    if ((e.code === "Enter" && !e.ctrlKey)) {
        if (document.activeElement == tab1_code) {
            const span = document.createElement('SPAN');
            span.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            span.innerHTML = lastLine++;
            lineNums.appendChild(span);
            lineNums.appendChild(document.createElement('BR'));
            document.getElementById('cursor-follower').style.top = '' + (parseInt(document.getElementById('cursor-follower').style.top.substring(0,document.getElementById('cursor-follower').style.top.length-2)) + 18) + 'px';
        }
    }
    else if ((e.code === "KeyZ" && e.ctrlKey)){
        for(let i = 0; i < 1; i++){
            const arr = text.children[0].innerHTML.split('\n');
            while(lastLine < arr.length){
                const span = document.createElement('SPAN');
                span.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
                span.innerHTML = lastLine++;
                lineNums.appendChild(span);
                lineNums.appendChild(document.createElement('BR'));
            }
            document.getElementById('cursor-follower').style.top = '' + (parseInt(document.getElementById('cursor-follower').style.top.substring(0,document.getElementById('cursor-follower').style.top.length-2)) + 18) + 'px';

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
    }
    else if(e.code === "KeyS" && e.ctrlKey)
        saveCurrentFile();
    else if(e.code === "Tab"){
        e.preventDefault();
        // insert 4 spaces at cursor position
    }

});

document.addEventListener('keyup', function(e){
    
    if (e.code === "Backspace" || e.code === "Delete") {
        const arr = text.children[0].innerHTML.split('\n');
        if (arr[arr.length - 1] === "") {
            arr.pop();
        }
        const temp = Array.from(lineNums.children);
        while (arr.length < temp.length / 2) {
            temp[temp.length - 1].remove();
            temp[temp.length - 2].remove();
            temp.pop();
            temp.pop();
            document.getElementById('cursor-follower').style.top = '' + (parseInt(document.getElementById('cursor-follower').style.top.substring(0,document.getElementById('cursor-follower').style.top.length-2)) - 18) + 'px';
        }
        lastLine = arr.length + 1;
        document.getElementById('cursor-follower').style.top = (getSelectionCoords().y - content.offsetTop) + 'px';
    }
    else if(e.code === "ArrowUp" || e.code === "ArrowRight" || e.code === "ArrowDown" || e.code === "ArrowLeft")
        document.getElementById('cursor-follower').style.top = (getSelectionCoords().y - content.offsetTop) + 'px';
    else if(!(e.code === "KeyZ" && e.ctrlKey) && !(e.code === "KeyS" && e.ctrlKey) && e.code.indexOf('Shift') == -1){
        console.log(e.code);
        let temp_coords = getSelectionCoords();
        highlightSyntax(tab1_code, temp_coords.y/18);
        setCursor(temp_coords);
    }
});


ipcRenderer.on('window-closed', function (e) {
    filepath = (filepath === undefined || filepath === "" ? data.lastfilepath : filepath);
    const data = {
        lastfilepath: filepath,
        unsavedfilecontent: currentFileIsSaved ? '' : removeSyntaxHighlighting(tab1_code.innerHTML),
        cwd: process.cwd()
    }
    const jsonString = JSON.stringify(data);
    fs.writeFile(app_path + '\\data.json', jsonString, err => {
        if (err) {
            console.log('Error writing file', err)
        } else {
            console.log('Successfully wrote file')
        }
    })
});


document.getElementById('file').onclick = function () {
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
}

const { dialog } = require('electron').remote;

document.getElementById('open-file').onclick = function () {
    dialog.showOpenDialog().then(result => {
        openFile(result.filePaths[0]);
    }).catch(function(err){
        console.log(err);
    });
    hideAllDropdowns();
}

document.getElementById('open-last-file').onclick = function () {

    openFile(data.lastfilepath);
    hideAllDropdowns();
}

function openFile(path) {
    filepath = path;
    filename = filepath.substring(filepath.lastIndexOf('\\')+1);
    titleText.innerHTML = filename;
    fs.readFile(filepath, (err, file_data) => {
        if (err) 
            throw err;
        initTextContent(file_data.toString());
    });
    
}

function initTextContent(file_data){
    document.getElementById('lineNums').innerHTML = '';
    document.getElementById('text-container').innerHTML = '';
    let lines = file_data.split('\n');
    tab1_code = document.createElement('CODE');
    tab1_code.style.height = (window.innerHeight - content.offsetTop - 20) + 'px';
    tab1_code.style.top = 0;
    tab1_code.style.padding = 0;
    tab1_code.style.fontSize = "16px";
    for(let i = 1; i <= lines.length; i++)
        tab1_code.innerHTML += '<span id="line_' + i + '">' + lines[i-1] + '</span>\n';
    tab1_code.contentEditable = 'plaintext-only';
    const numOfLines = lines.length + 1;
    lines = lines.toString().replace(/,/g, '');
    text.appendChild(tab1_code);
    for (lastLine = 1; lastLine < numOfLines; lastLine++) {
        const numSpan = document.createElement('SPAN');
        numSpan.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;color:#AAAAAA;font-size:12px;text-align:right;';
        numSpan.innerHTML = lastLine;
        lineNums.appendChild(numSpan);
        lineNums.appendChild(document.createElement('BR'));
    }
    tab1_code.addEventListener('keydown', function(e){
        if(currentFileIsSaved)
            fs.readFile(filepath, (err, file_data) => {
                if (err) throw err;
                if(tab1_code.innerHTML !== file_data.toString())
                    currentFileIsSaved = false;
            });
    });
    highlightSyntax(tab1_code);
}

document.getElementById('save-file').onclick = function(){
    saveCurrentFile();
}

function saveCurrentFile(){
    if(filepath == undefined)
        saveAs();
    else{
        save();
    }
}

function saveAs(){
    dialog.showSaveDialog().then(result => {
        if(result != undefined){
            filepath = result.filePath;
            save();
        }
    }).catch(function(err){
        console.log(err);
    });
    dropdownIsVisible = false;
}

function save(){

    const temp = removeSyntaxHighlighting(tab1_code.innerHTML);
        console.log(tab1_code.innerHTML);
        console.log(temp);
        fs.writeFile(filepath, temp, function(err) {
            if(err)
                console.log(err);
            else
                currentFileIsSaved = true;
        });
        dropdownIsVisible = false;
}

document.getElementById('edit').onclick = function () {
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
}

document.getElementById('view').onclick = function () {
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
}

document.getElementById('help').onclick = function () {
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
}

document.getElementById('run').onclick = function(){
    const temp = document.getElementById('run-dropdown');
    hideAllDropdowns('run');
    if (temp.style.display === "block") {
        temp.style.display = "none";
        dropdownIsVisible = false;
    }
    else {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
}

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

document.getElementById('run-RunWithJava').onclick = function(){
    runWithJava();
    hideAllDropdowns();
    dropdownIsVisible = false;
};


function runWithJava(){
    const terminal_output = document.getElementById('terminal-text');
    const spawn = require('child_process').spawn;
    const bat = spawn('cmd.exe', ['/c', 'test.bat', filepath.substring(0, filepath.lastIndexOf('\\')), filename, filename.substring(0, filename.indexOf('.'))]);  //IT WORKS!!!!!

    bat.stdout.on('data', (data) => {
        let str = String.fromCharCode.apply(null, data);          //output from batch also option 1 for a callback
        terminal_output.innerHTML = terminal_output.innerHTML + str;
        terminal.scrollTop = terminal_output.scrollHeight;
    });

    bat.stderr.on('data', (data) => {
        // As said before, convert the Uint8Array to a readable string.
        var str = String.fromCharCode.apply(null, data);
        terminal_output.innerHTML = terminal_output.innerHTML + str;
        terminal.scrollTop = terminal_output.scrollHeight;
        console.error(str);
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);     // output from batch also option 2 for a callback     
        terminal_output.innerHTML = terminal_output.innerHTML;
        terminal.scrollTop = terminal_output.scrollHeight;
    });
}


text.addEventListener('mouseup', function () {
    let temp = document.getElementById('cursor-follower');
    temp.style.display = "block";
    let pos = getSelectionCoords();
    temp.style.top = "" + (pos.y - content.offsetTop) + "px";
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

terminal_resize.addEventListener('mousedown', function(e){
    document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', function(e){
            document.removeEventListener('mousemove', resize);
            body.style.cursor = '';
            body.style.userSelect = '';
    });
});

function removeSyntaxHighlighting(content){
    return content.replace(/(<([^>]+)>)/ig, ''); // regex to replace most html tags
}


function resize(e){
    body.style.userSelect = 'none';
    body.style.cursor = 'n-resize';
    if(terminal.style.height.substring(0,terminal.style.height.length-2) <= 400 && e.clientY >= window.innerHeight - 398 && terminal.style.height.substring(0,terminal.style.height.length-2) > 100){
        terminal_resize.style.top = e.clientY + 'px';
        terminal.style.top = e.clientY + 'px';
        terminal.style.height = window.innerHeight - e.clientY + 'px';
        tab1_code.style.height = (window.innerHeight - (window.innerHeight - e.clientY) - content.offsetTop) + 'px';

    }
    else if (terminal.style.height.substring(0,terminal.style.height.length-2) <= 100 && e.clientY >= window.innerHeight - 103){
        terminal_resize.style.top = window.innerHeight - 98 + 'px';
        terminal.style.top = window.innerHeight - 98 +  'px';
        terminal.style.height = 98 + 'px';
    }
    else{
        terminal_resize.style.top = window.innerHeight - 398 + 'px';
        terminal.style.top = window.innerHeight - 398 +  'px';
        terminal.style.height = 398 + 'px';
    }
}

function getSelectionCoords() {
    let win = window;
    var doc = window.document;
    var sel = doc.selection, range, rects, rect;
    var x = 0, y = 0;
    if (sel) {
        if (sel.type != "Control") {
            range = sel.createRange();
            range.collapse(true);
            x = range.boundingLeft;
            y = range.boundingTop;
        }
    } else if (doc.getSelection) {
        sel = doc.getSelection();
        if (sel.rangeCount) {
            range = sel.getRangeAt(0).cloneRange();
            if (range.getClientRects) {
                range.collapse(true);
                rects = range.getClientRects();
                if (rects.length > 0) {
                    rect = rects[0];
                }
                x = rect.left;
                y = rect.top;
            }
            // Fall back to inserting a temporary element
            if (x == 0 && y == 0) {
                var span = doc.createElement("span");
                if (span.getClientRects) {
                    // Ensure span has dimensions and position by
                    // adding a zero-width space character
                    span.appendChild( doc.createTextNode("\u200b") );
                    range.insertNode(span);
                    rect = span.getClientRects()[0];
                    x = rect.left;
                    y = rect.top;
                    var spanParent = span.parentNode;
                    spanParent.removeChild(span);

                    // Glue any broken text nodes back together
                    spanParent.normalize();
                }
            }
        }
    }
    return { x: x, y: y };
}

function setCursor(pos) { 
              
    var el = tab1_code;
    var range = document.createRange();
    var sel = window.getSelection();
    console.log(el.childNodes);
    range.setStart(el.childNodes[pos.y/18], pos.x);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus(); 
} 