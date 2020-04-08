
let currentLanguageKeywords;
let additionalRegex;
let flags;
let colorArr;

function highlightSyntax(code, lineNum){
    // if(lineNum == undefined){
        var data = code;
        console.log(additionalRegex);
        // data = data.replace(/(?:(?<=class))( \w+)/ig, '<span style="color:' + 'red' + '">$1</span>');

        for(let x = 0; x < colorArr[0].length; x++){
            data = data.replace(currentLanguageKeywords[x], '<span style="color:' + colorArr[0][x] + '">$1</span>');
        }
        for(let i = 0; i < additionalRegex.length; i++){
            for(let x = 0; x < additionalRegex[i].length; x++){
                data = data.replace(new RegExp(additionalRegex[i][x], flags[i][x]), '<span style="color:' + colorArr[1][i] + '">$1</span>');
            }
        }
        data = data.replace(/(<span.*?>\$1<.*?span>)/g, '');
        return data;
        // match all html tags /(<([^>]+)>)/ig
}

function initHighlighting(language, code){
    parseHighlightingFiles(language, function(){
        code.innerHTML = highlightSyntax(code.innerHTML);
    });
    //currentLanguageKeywords = new RegExp('(?:^|(?<=\\W))((?:public)|(?:class))(?:(?=\\W)|$)', 'g');
}

function parseHighlightingFiles(language, callback){
    colorArr = [[],[],[],[],[],[],[],[],[],[]];
    flags = [[],[],[],[],[],[],[],[],[],[]];
    const listOfFileExtensions = ['.kw', '.regex'];
    for(let i = 0; i < listOfFileExtensions.length; i++){
        const extension = listOfFileExtensions[i];
        const filename = '_' + language + '_';
        try{
            file_data = fs.readFileSync("SyntaxLib/" + language + "/" + filename + extension);
        }
        catch(Exception){
            alert('Cannot highlight syntax.\nMissing ' + extension + ' file in ' + language + ' directory.');
        }
        if(i == 0){
            currentLanguageKeywords = file_data.toString().replace(/\s/g, '').replace(/(\/\/.*)/g, '').split('}');
            currentLanguageKeywords.pop();                
            for(let x = 0; x < currentLanguageKeywords.length; x++){
                colorArr[i].push(currentLanguageKeywords[x].substring(0,currentLanguageKeywords[x].indexOf('{')));
                currentLanguageKeywords[x] = currentLanguageKeywords[x].substring(currentLanguageKeywords[x].indexOf('{')+1);
                currentLanguageKeywords[x] = currentLanguageKeywords[x].split(',');
                currentLanguageKeywords[x] = new RegExp('(?:^|(?<=\\W))((?:' + currentLanguageKeywords[x].join(')|(?:').replace(/\s/g, '') + '))(?:(?=\\W)|$)', 'g');
            }
        }
        else if (i == 1){
            additionalRegex = file_data.toString().replace(/(\/\/.*)/g, '').replace(/\s/g, '').split('}');
            additionalRegex.pop();
            for(let x = 0; x < additionalRegex.length; x++){
                colorArr[i].push(additionalRegex[x].substring(0,additionalRegex[x].indexOf('{')));
                additionalRegex[x] = additionalRegex[x].substring(additionalRegex[x].indexOf('{')+1);
                additionalRegex[x] = additionalRegex[x].split(',/');
            }
            for(let i = 0; i < additionalRegex.length; i++){
                for(let x = 0; x < additionalRegex[i].length; x++){
                    if(additionalRegex[i][x].charAt(0) === '/')
                        additionalRegex[i][x] = additionalRegex[i][x].substring(1);
                    flags[i][x] = additionalRegex[i][x].substring(additionalRegex[i][x].lastIndexOf('/')+1);
                    additionalRegex[i][x] = additionalRegex[i][x].substring(0, additionalRegex[i][x].lastIndexOf('/')).replace(/(&space&)/g, ' ');
                }
            }
            
        }
    }
    callback();
}


var fullColorHex = function(r,g,b) {   
  var red = rgbToHex(r);
  var green = rgbToHex(g);
  var blue = rgbToHex(b);
  return red+green+blue;
};