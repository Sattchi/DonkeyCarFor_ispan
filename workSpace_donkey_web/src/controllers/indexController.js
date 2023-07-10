const index = (fcn) => {
    return async function (req, res) {
        /*
        res.cookie('name', 'lulu', {
            maxAge: 10000, // 只存在n秒，n秒後自動消失
            httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
        })*/
        console.log(req.cookies);
        console.log(req.cookies.name); //找單個cookies

        return res.render('index', {
            'title': '首頁',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'index',
        });
    };
}

const resign = (fcn) => {
    return async function (req, res) {
        return res.render('resign', {
            'title': '註冊新用戶',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'resign',
        });
    }
}

const login = (fcn) => {
    return async function (req, res) {
        return res.render('login', {
            'title': '登入',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'login',
        });
    }
}

const about = (fcn) => {
    return async function (req, res) {
        res.render('about', {
            'title': '關於',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'about',
        });
    };
}

// 註冊新用戶
const resigt = async function (req, res) {
    var uc = req.body.uc;
    var pw = req.body.passWord;
    var cn = req.body.customName;

    var html = '帳號：' + uc + '<br>' +
        '密碼：' + pw + '<br>' + '完成註冊';

    fs.readFile(__dirname + "/www/json/" + "data.json", 'utf8', function (err, data) {
        data = JSON.parse(data); //將目標json 轉為js對象
        var arr = Object.keys(data);  //將js對象套用至object
        var length = arr.length + 1; //獲得json資料總長度arr.length console.log(arr.length);
        var newuserl = "user" + length;
        var user = { //console.log(user);
            [newuserl]: {  //將變數用作key的寫法
                "name": uc,
                "password": pw,
                "customName": cn,
                "id": length
            }
        }
        data[newuserl] = user[newuserl];
        //console.log(data[newuserl]);
        //console.log( data );
        res.end(JSON.stringify(data));
        fs.writeFile(__dirname + "/www/json/" + "data.json", JSON.stringify(data), function (err) {
            if (err)
                console.log(err);
            else
                console.log('new USER .' + uc);
        });
    });
    return res.send(html);
}

// 帳號登入
const loging = async function (req, res) {
    var uc = req.body.uc;
    var pw = req.body.passWord;
    //var cn=req.body.customName;
    /*
      var html = '帳號：' + uc + '<br>' +
                 '密碼：' + pw + '<br>'+'完成登入';*/
    res.cookie('name', uc, {
        maxAge: 100 * 1000, // 只存在n秒，n秒後自動消失
        httpOnly: false // 僅限後端存取，無法使用前端document.cookie取得
    })
    res.cookie('auth', uc, {
        maxAge: 100 * 1000, // 只存在n秒，n秒後自動消失
        httpOnly: true, // 僅限後端存取，無法使用前端document.cookie取得
    })
    // user0.name = uc;
    /*
    res.cookie('firstName', uc, { path: '/', signed: true, maxAge:600000});  //set cookie
    res.cookie('lastName', pw, { path: '/', signed: true, maxAge:600000 });  //set cookie
    */

    // res.send(html);
    console.log(' USER login: ' + uc);
    return res.redirect('/');
}

// 帳號登出
const logout = async function (req, res) {
    console.log('logout USER: ' + req.cookies.name);
    res.clearCookie('name', { path: '/' }); //清除目標
    res.clearCookie('auth');
    return res.redirect('/');
}

module.exports = {
    index,
    resign,
    login,
    about,
    resigt,
    loging,
    logout,
};