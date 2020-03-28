const electron = require('electron');
const { ipcRenderer } = electron;


const terminal = document.getElementById('terminal');
const terminal_resize = document.getElementById('terminal-resizer');
const content = document.getElementById('content');
const lineNums = document.getElementById('lineNums');
const text = document.getElementById('text-container');
let userCode;
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

text.addEventListener('scroll', (e) => {
    lineNums.scrollTop = text.scrollTop;
});

document.addEventListener('keydown', (e) => {
    if ((e.code === "Enter" && !e.ctrlKey)) {
        if (document.activeElement == userCode) {
            const span = document.createElement('SPAN');
            span.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;z-index:-3;color:#AAAAAA;font-size:12px;text-align:right;';
            span.innerHTML = lastLine++;
            lineNums.appendChild(span);
            lineNums.appendChild(document.createElement('BR'));
            document.getElementById('cursor-follower').style.top = '' + (parseInt(document.getElementById('cursor-follower').style.top.substring(0,document.getElementById('cursor-follower').style.top.length-2)) + 18) + 'px';
        }
    }
    else if(e.code === "KeyS" && e.ctrlKey)
        saveCurrentFile();
    else if(e.code === "Tab"){
        e.preventDefault();
        console.log(userCode.childNodes[0]);
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
    else if(!(e.code === "KeyZ" && e.ctrlKey) && !e.code === "Tab" && !(e.code === "KeyS" && e.ctrlKey) 
                && e.code.indexOf('Shift') == -1 && e.code.indexOf('Control') == -1 && e.code.indexOf('CapsLock')){
    }
    else if (e.ctrlKey && e.code == "KeyH")
        userCode.innerHTML = highlightSyntax(removeSyntaxHighlighting(userCode.innerHTML));

    //let temp_coords = getSelectionCoords();
    //setCursor(temp_coords);
});


ipcRenderer.on('window-closed', function (e) {
    filepath = (filepath === undefined || filepath === "" ? data.lastfilepath : filepath);
    const data = {
        lastfilepath: filepath,
        unsavedfilecontent: currentFileIsSaved ? '' : removeSyntaxHighlighting(userCode.innerHTML),
        cwd: process.cwd()
    }
    const jsonString = JSON.stringify(data, null, 2);
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
    hideAllDropdowns();
    dropdownIsVisible = false;
    if(temp.style.display !== "block") {
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
    userCode = document.createElement('CODE');
    userCode.style.height = (window.innerHeight - content.offsetTop - 20) + 'px';
    userCode.style.fontSize = "16px";
    userCode.style.color = '#DDDDDD';
    userCode.innerHTML = file_data;
    userCode.contentEditable = 'plaintext-only';
    const numOfLines = lines.length + 1;
    text.appendChild(userCode);
    for (lastLine = 1; lastLine < numOfLines; lastLine++) {
        const numSpan = document.createElement('SPAN');
        numSpan.style = 'position:absolute;width:25px;height:22px;user-select:none;padding:2px;margin:0;color:#AAAAAA;font-size:12px;text-align:right;';
        numSpan.innerHTML = lastLine;
        lineNums.appendChild(numSpan);
        lineNums.appendChild(document.createElement('BR'));
    }
    userCode.addEventListener('keydown', function(e){
        if(currentFileIsSaved)
            fs.readFile(filepath, (err, file_data) => {
                if (err) throw err;
                if(userCode.innerHTML !== file_data.toString())
                    currentFileIsSaved = false;
            });
    });
    if(filename != undefined){
        switch (filename.substring(filename.indexOf('.')+1)){
            case 'java':
                initHighlighting('java', userCode);
                break;
            case 'py':
                initHighlighting('python', userCode);
                break;
        }
    }
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

    const temp = unEscapeCharacters(removeSyntaxHighlighting(userCode.innerHTML));
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
    hideAllDropdowns();
    dropdownIsVisible = false;
    if(temp.style.display !== "block") {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
}

document.getElementById('view').onclick = function () {
    const temp = document.getElementById('view-dropdown');
    hideAllDropdowns();
    dropdownIsVisible = false;
    if(temp.style.display !== "block") {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
}

document.getElementById('help').onclick = function () {
    const temp = document.getElementById('help-dropdown');
    hideAllDropdowns();
    dropdownIsVisible = false;
    if(temp.style.display !== "block") {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
}

document.getElementById('run').onclick = function(){
    const temp = document.getElementById('run-dropdown');
    hideAllDropdowns();
    dropdownIsVisible = false;
    if(temp.style.display !== "block") {
        temp.style.display = "block";
        dropdownIsVisible = true;
    }
}

document.getElementById('file').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns();
        document.getElementById('file-dropdown').style.display = 'block';
    }
});

document.getElementById('edit').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns();
        document.getElementById('edit-dropdown').style.display = 'block';
    }
});

document.getElementById('view').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns();
        document.getElementById('view-dropdown').style.display = 'block';
    }
});

document.getElementById('help').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns();
        document.getElementById('help-dropdown').style.display = 'block';
    }
});

document.getElementById('run').addEventListener('mouseover', function () {
    if (dropdownIsVisible) {
        hideAllDropdowns();
        document.getElementById('run-dropdown').style.display = 'block';
    }
});

document.getElementById('run-Run').onclick = function(){
    if(filename.indexOf('.') != -1 && filename.substring(filename.indexOf('.')+1) === 'java')
        run('Java');
    else if(filename.indexOf('.') != -1 && filename.substring(filename.indexOf('.')+1) === 'py')
        run('Python');
    hideAllDropdowns();
    dropdownIsVisible = false;
}

document.getElementById('run-RunWithJava').onclick = function(){
    run('Java');
    hideAllDropdowns();
    dropdownIsVisible = false;
};


function run(language){
    terminal.style.display = 'block';
    const terminal_input = document.getElementById('terminal-input');
    const terminal_output = document.getElementById('terminal-output');
    const spawn = require('child_process').spawn;
    let bat;
    bat = spawn('cmd.exe', ['/c', 'run' + language + '.bat', filepath.substring(0, filepath.lastIndexOf('\\')), filepath.substring(filepath.lastIndexOf('\\')+1), filename]);  //IT WORKS!!!!!
    terminal_input.contentEditable = true;
    terminal_input.focus();
    terminal_input.addEventListener('keydown', function(e){
        if(e.code === 'Enter'){
            e.preventDefault();
            bat.stdin.write(terminal_input.innerHTML + '\n');
            terminal_output.innerHTML += terminal_input.innerHTML + '\n';
            terminal.scrollTop = terminal_output.scrollHeight;
            terminal_input.innerHTML = '';
        }
        else if(e.code === 'KeyC' && e.ctrlKey){
            bat.kill('SIGINT');
        }
    }); 

    bat.stdout.on('data', (data) => {
        let str = String.fromCharCode.apply(null, data);          //output from batch also option 1 for a callback
        terminal_output.innerHTML = terminal_output.innerHTML + str;
        terminal.scrollTop = terminal_output.scrollHeight;
    });

    bat.stderr.on('data', (data) => {
        //convert the Uint8Array to a readable string.
        var str = String.fromCharCode.apply(null, data);
        terminal_output.innerHTML = terminal_output.innerHTML + str;
        terminal.scrollTop = terminal_output.scrollHeight;
        console.error(str);
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);     // output from batch also option 2 for a callback     
        terminal_output.innerHTML = terminal_output.innerHTML;
        terminal.scrollTop = terminal_output.scrollHeight;
        terminal_input.contentEditable = false;
    });
}

document.getElementById('exit-terminal').onclick = function(){
    document.getElementById('terminal-output').innerHTML = '';
    document.getElementById('terminal-input').innerHTML = '';
    terminal.style.display = 'none';
}
text.addEventListener('mouseup', function () {
    let temp = document.getElementById('cursor-follower');
    temp.style.display = "block";
    let pos = getSelectionCoords();
    temp.style.top = "" + (pos.y - content.offsetTop) + "px";
});

document.addEventListener('mouseup', function(){
    hideAllDropdowns();
    dropdownIsVisible = false;
})


function hideAllDropdowns() {
    document.getElementById('file-dropdown').style.display = "none";
    document.getElementById('edit-dropdown').style.display = "none";
    document.getElementById('view-dropdown').style.display = "none";
    document.getElementById('help-dropdown').style.display = "none";
    document.getElementById('run-dropdown').style.display = "none";
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
    return content.replace(/(<([^>]+)>)/ig, ''); 
}                                                           

function unEscapeCharacters(content){
    return content.replace(/&gt;/g, '>').replace(/&lt;/g, '<'); 
}

function resize(e){
    body.style.userSelect = 'none';
    body.style.cursor = 'n-resize';
    if (terminal.style.height.substring(0,terminal.style.height.length-2) <= 100 && e.clientY >= window.innerHeight - 102){
        terminal_resize.style.top = window.innerHeight - 98 + 'px';
        terminal.style.top = window.innerHeight - 98 +  'px';
        terminal.style.height = 98 + 'px';
    }
    else if(terminal.style.height == '' || (terminal.style.height.substring(0,terminal.style.height.length-2) <= 400 && e.clientY >= window.innerHeight - 398 && terminal.style.height.substring(0,terminal.style.height.length-2) >= 98)){
        terminal_resize.style.top = e.clientY + 'px';
        terminal.style.top = e.clientY + 'px';
        terminal.style.height = window.innerHeight - e.clientY + 'px';
        userCode.style.height = (window.innerHeight - (window.innerHeight - e.clientY) - content.offsetTop) + 'px';

    }
    else{
        terminal_resize.style.top = window.innerHeight - 398 + 'px';
        terminal.style.top = window.innerHeight - 398 +  'px';
        terminal.style.height = 398 + 'px';
    }
}

function getSelectionCoords() {
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
    let el = userCode;
    let y = ((pos.y-el.getBoundingClientRect().top)/18*2);
    let x = 1;
    console.log(el.childNodes);
    console.log(pos.x - el.getBoundingClientRect().left);
    console.log(el.childNodes[y]);
    let range = document.createRange();
    let sel = window.getSelection();
    range.setStart(el.childNodes[y], (pos.x/16)-5);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.focus(); 
} 

window.onresize = function(){
    const terminal_output = document.getElementById('terminal-output');
    terminal_output.style.width = (window.innerWidth - 20) + 'px';
}