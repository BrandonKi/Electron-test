function highlightSyntax(code, lineNum){
    if(!lineNum){
        var data = code.innerHTML;
        console.log(code.innerHTML);
        data = data.replace(/"(.*?)"/g, '<span class="string">\"$1\"</span>');
        //data = data.replace(/\/\* (.*?) \*\//g, '<span class="comment">/* $1 */</span>');
        code.innerHTML = data;
        console.log(code.innerHTML);
    }
}