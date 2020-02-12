
function highlightSyntax(code, lineNum){
    if(lineNum == undefined){
        var data = code.innerHTML;
        console.log(code.innerHTML);
        data = data.replace(/(<([^>]+)>)/ig, '').replace(/"(.*?)"/g, '<span class="string">\"$1\"</span>');
        //data = data.replace(/\/\* (.*?) \*\//g, '<span class="comment">/* $1 */</span>');
        code.innerHTML = data;
    }
    else{
        let count = 0;
        let temp = code.innerHTML.split('\n');

        temp[lineNum] = temp[lineNum].replace(/(<([^>]+)>)/ig, '').replace(/"(.*?)"/g, '<span class="string">\"$1\"</span>');
        code.innerHTML = temp.join('\n');
        console.log(code.innerHTML);
        
    }
}