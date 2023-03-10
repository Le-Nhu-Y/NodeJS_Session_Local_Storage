const http = require('http');
const fs = require('fs');
const qs = require('qs');
const url = require('url');
const localStorage= require('local-storage');

const server = http.createServer(function (req, res) {
    readSession(req, res);
});

server.listen(8080, function () {
    console.log('server running at localhost:8080 ')
});

let handlers={};
handlers.login = function (rep,res){
    fs.readFile('./views/login.html',function (err, data){
    res.writeHead(200,{'Content-Type':'text/html'});
    res.write(data);
    return res.end();
    });
};
handlers.notfound = function (rep, res) {
    fs.readFile('./views/notfound.html', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
};

handlers.infor = function (req, res) {

    var data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {
        data = qs.parse(data);
        let expires = Date.now() + 1000*60*60;
        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";
        let tokenId = createRandomString(20);
        createTokenSession(tokenId, tokenSession);
        localStorage.set('token', tokenId);
        fs.readFile('./views/infor.html', 'utf8', function (err, datahtml) {
            if (err) {
                console.log(err);
            }
            datahtml = datahtml.replace('{name}', data.name);
            datahtml = datahtml.replace('{email}', data.email);
            datahtml = datahtml.replace('{password}', data.password);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(datahtml);
            return res.end();
        });

    })
    req.on('error', () => {
        console.log('error')
    })
};

var router = {
    'login': handlers.login,
    'infor': handlers.infor,
    'notfound': handlers.notfound
}



handlers.infor = function (req, res) {

// xu ly submit

    var data = '';
    req.on('data', chunk => {
        data += chunk;
    })
    req.on('end', () => {

//- L???y th??ng tin t??? form login

        data = qs.parse(data);

//- T???o th???i gian h???t h???n cho sessionId

        let expires = Date.now() + 1000*60*60;

//- T???o chu???i ????? ghi v??o sessionId

        let tokenSession = "{\"name\":\""+data.name+"\",\"email\":\""+data.email+"\",\"password\":\""+data.password+"\",\"expires\":"+expires+"}";

//- T???o sessionId ng???u nhi??n

        let tokenId = createRandomString(20);

//- Ghi sessionId v??o server

        createTokenSession(tokenId, tokenSession);

//- D??ng localStorage ????? ghi l???i sessionId ph??a client.

        localStorage.set('token', tokenId);

//- Hi???n th??? trang infor

        fs.readFile('./views/infor.html', 'utf8', function (err, datahtml) {
            if (err) {
                console.log(err);
            }
            datahtml = datahtml.replace('{name}', data.name);
            datahtml = datahtml.replace('{email}', data.email);
            datahtml = datahtml.replace('{password}', data.password);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.write(datahtml);
            return res.end();
        });

    })
    req.on('error', () => {
        console.log('error')
    })
};


var createTokenSession = function (fileName, data){
    fileName = './token/' + fileName;
    fs.writeFile(fileName, data, err => {
    });
}
//t???o ra chu???i ng???u nhi??n


var createRandomString = function (strLength){
    strLength = typeof(strLength) == 'number' & strLength >0 ? strLength:false;
    if (strLength){
        var possibleCharacter = 'abcdefghiklmnopqwerszx1234567890';
        var str='';
        for (let i = 0; i <strLength ; i++) {
            let ramdomCharater = possibleCharacter.charAt(Math.floor(Math.random()*possibleCharacter.length));
            str+=ramdomCharater;
        }
        return str;
    }
}

//l???y d??? li???u t??? local storage, ?????c d??? li???u t??? sessionID

var readSession = function(req, res){

//l???y sessionId t??? local storage

    var tokenID = localStorage.get("token");
    if (tokenID){
        var sessionString= "";
        let expires=0;

//?????c file sessionId t????ng ???ng ph??a server

        fs.readFile('./token/'+tokenID, 'utf8' , (err, data) => {
            if (err) {
                console.error(err)
                return
            }
            sessionString = String(data);

// l???y ra th???i gian h???t h???n c???a sessionId

            expires = JSON.parse(sessionString).expires;

// l???y ra th???i gian hi???n t???i

            var now = Date.now();

// so s??nh th???i gian h???t h???n v???i th???i h???n c???a sessionID

            if (expires<now){

//???? ????ng nh???p nh??ng h???t h???n

//Th???c h??nh ????ng nh???p v?? l??u l???i

                var parseUrl = url.parse(req.url, true);
                var path = parseUrl.pathname;
                var trimPath = path.replace(/^\/+|\/+$/g, '');
                var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
                chosenHandler(req, res);
            }
            else {

// ???? ????ng nh???p v?? ch??a h???t h???n

// chuy???n sang trang dashboard

                fs.readFile('./views/dashboard.html', 'utf8', function (err, datahtml) {
                    if (err) {
                        console.log(err);
                    }
                    datahtml = datahtml.replace('{name}', JSON.parse(sessionString).name);
                    datahtml = datahtml.replace('{email}', JSON.parse(sessionString).email);
                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.write(datahtml);
                    return res.end();
                });
            }
        });
    }
    else {

// ch??a ????ng nh???p

        var parseUrl = url.parse(req.url, true);
        var path = parseUrl.pathname;
        var trimPath = path.replace(/^\/+|\/+$/g, '');
        var chosenHandler = (typeof (router[trimPath]) !== 'undefined') ? router[trimPath] : handlers.notfound;
        chosenHandler(req, res);
    }
}
