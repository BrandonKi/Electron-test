
let currentLanguageKeywords;
let colorArr;

function highlightSyntax(code, lineNum){
    // if(lineNum == undefined){
        var data = code;
        for(let i = 0; i < colorArr.length; i++){
            console.log(currentLanguageKeywords[i]);
            data = data.replace(currentLanguageKeywords[i], '<span style="color:' + colorArr[i] + '">$1</span>');
        }
        
        data = data.replace(new RegExp("(\"([^>]*?)\")(?!>)", "igm"), '<span class="string">$1</span>');
        data = data.replace(/(\/\/.*)$/igm, '<span class="comment">$1</span>');
        return data;
        // match all html tags /(<([^>]+)>)/ig
}

function initHighlighting(language, code){
    let extension = '.kw';
    let filename = '_' + language + '_';
    console.log(filename + extension);
    fs.readFile("SyntaxLib/" + language + "/" + filename + extension, (err, file_data) => {
        if (err) 
            throw err;
        currentLanguageKeywords = file_data.toString().replace(/\s/g, '').split('}');
        currentLanguageKeywords.pop();
        colorArr = [];
        for(let i = 0; i < currentLanguageKeywords.length; i++){
            colorArr.push(currentLanguageKeywords[i].substring(0,currentLanguageKeywords[i].indexOf('{')));
            currentLanguageKeywords[i] = currentLanguageKeywords[i].substring(currentLanguageKeywords[i].indexOf('{')+1);
            currentLanguageKeywords[i] = currentLanguageKeywords[i].split(',');
            currentLanguageKeywords[i] = new RegExp('(?:^|(?<=\\W))((?:' + currentLanguageKeywords[i].join(')|(?:').replace(/\s/g, '') + '))(?:(?=\\W)|$)', 'g');

        }
        //currentLanguageKeywords = new RegExp('(?:^|(?<=\\W))((?:public)|(?:class))(?:(?=\\W)|$)', 'g');
        code.innerHTML = highlightSyntax(code.innerHTML)
    })

}


