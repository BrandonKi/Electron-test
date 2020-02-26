function highlightSyntax(code, lineNum){
    // if(lineNum == undefined){
        var data = code;
        console.log(data); 
        data = data.replace(/("([^>]*?)")(?!>)/igm, '<span class="string">$1</span>');
        data = data.replace(/(\/\/.*)$/igm, '<span class="comment">$1</span>');
        data = data.replace(/(\/\*[\s\S]*\*\/)/igm, '<span class="comment">$1</span>');
        return data;
        //      
    // }
    // else{
        // let temp = code.split('/n');
        // console.log(temp);
        // match all html tags /(<([^>]+)>)/ig
        // temp[lineNum] = temp[lineNum].replace(/("([^>]*?)")(?!>)/ig, '<span class="string">$1</span>');
        // temp[lineNum] = temp[lineNum].replace(/(\/\/.*)$/igm, '<span class="comment">$1</span>');
        // temp[lineNum] = temp[lineNum].replace(/(\/\*[\s\S]*\*\/)/igm, '<span class="comment">$1</span>');
        // code.innerHTML = temp.join('\n');
        // console.log(code.innerHTML); 
   // }
}