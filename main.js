var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');

var args = process.argv.slice(2);


//
var _repo = 'mrdoob/three.js';
var _locations = ["France", "Paris"]




var _currentPage = 1;

var _stack = [];
var _run = true;
var _totalNumber = 0;
var _foundNumber = 0;
var _index = 0;
var _startIndex = 0;



if (args.length == 0) {
} else {
    _repo = args[0];
    _startIndex = args[1];
    _currentPage = Math.ceil(_startIndex / 50);
    _index = (_currentPage - 1) * 50;
}

console.log("start parsing repo " + _repo + " at page " + _currentPage);



var _interval = setInterval(function () {
    if (true) {
        setRun(false);
        if (_stack.length > 0) {
            var obj = _stack.pop();
            checkProfil(obj);
        } else {
            console.log("Parse page " + _currentPage)
            getPage(_repo, _currentPage++);
        }
    }
}, 500);




function setRun(value) {
    // console.log("Set run to "+value);
    _run = value;
}
function getPage(repo, page) {
    request('https://github.com/' + repo + '/stargazers?page=' + page, function (error, response, html) {
        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            if (($('li[class="follow-list-item float-left border-bottom"]').length) == 0) {
                console.log("END");
                clearInterval(_interval);
            }

            $('li[class="follow-list-item float-left border-bottom"]').each(function (i, elm) {
                var elt = $('h3[class="follow-list-name"]', $(this));
                var url = $('a', $(elt)).attr('href');
                url = "https://github.com" + url;
                _totalNumber++;
                console.log("Add to stack " + url + '(' + _foundNumber + '/' + _totalNumber + ')');
                _stack.push(url)
            });
            setRun(true);
        }
    })
}




function checkProfil(url) {
    request(url, function (error, response, html) {
        if (!error) {
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
            var $ = cheerio.load(html);
            var elt = $('li[aria-label="Home location"]');
            var name = elt.text().trim();

            for (var i = 0; i < _locations.length; i++) {
                if (name.indexOf(_locations[i]) != -1) {
                    _foundNumber++
                    console.log("Add to  stack" + url + '(' + _foundNumber + '/' + _totalNumber + ')');
                    add(url);
                    break;
                }
            }

            console.log("checked profil : " + url + ' (' + name + ') ---index : ' + '(' + _foundNumber + '/' + _index++ + ')');
            setRun(true);
        } else {
            console.log("error : " + error)
        }
    });


}

function add(link) {
    var filename = _repo.replace('/', "-");
    var text = link + "\n"
    fs.appendFile(filename + '.csv', text, function (err) {

    });
}