const path = require('path');
const fs = require('fs');
const LineByLineReader = require('line-by-line');


function updateConfigServer(config) {
    var outputFileDataSrv="";
    var reSrv=/export(\ {1,})const(\ {1,})API_HOST(\ {1,})=/gi;
    var lrSrv = new LineByLineReader(
        path.resolve(__dirname, './env.js')
    );
    lrSrv.on('line', function (line) {
        var resSrv=line.match(reSrv);
        if(resSrv!=null)
            outputFileDataSrv+="export const API_HOST = '"+
            config.http+"://"+config.host+
            ((config.port!="80")?":"+config.port:"")+
            "'; \r\n";
        else
            outputFileDataSrv+=line+"\r\n";
    });

    lrSrv.on('end', function () {
        fs.writeFileSync(
            path.resolve(__dirname, './env.js'), 
            outputFileDataSrv
         );
    });
}

module.exports = {
    updateConfigServer:updateConfigServer,
};