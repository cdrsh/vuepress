const path = require('path');
const fs = require('fs');
const LineByLineReader = require('line-by-line');

function updateConfigClient(config) {
    var outputFileData="";
    var re=/export(\ {1,})const(\ {1,})HOST(\ {1,})=/gi;
    var lr = new LineByLineReader(
        path.resolve(__dirname, './env.js')
    );
    lr.on('line', function (line) {
        var res=line.match(re);
        if(res!=null)
            outputFileData+="export const HOST = '"+
            config.http+"://"+config.host+
            ((config.port!="80")?":"+config.port:"")+
            "'; \r\n";
        else
            outputFileData+=line+"\r\n";
    });

    lr.on('end', function () {
        fs.writeFileSync(
           path.resolve(__dirname, './env.js'), 
           outputFileData
        );
    });
}


module.exports = {
    updateConfigClient:updateConfigClient,
};