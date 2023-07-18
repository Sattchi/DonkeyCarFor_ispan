const mysql = require('mysql');
const dbConfig = require("../config/testDB");

const index = (fcn) => {
    return async function (req, res) {
        /*
        res.cookie('name', 'lulu', {
            maxAge: 10000, // 只存在n秒，n秒後自動消失
            httpOnly: true // 僅限後端存取，無法使用前端document.cookie取得
        })*/
        console.log('一般cookies');
        console.log(req.cookies);
        console.log('signed cookies');
        console.log(req.signedCookies);
        // console.log(req.cookies.name); //找單個cookies

        return res.render('index', {
            'title': '首頁',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'index',
            'error': req.query.error || '',
            'warning': req.query.warning || '',
            'message': req.query.message || '',
            'success': req.query.success || '',
        });
    };
}

const resign = (fcn) => {
    return async function (req, res) {
        // 已經登入者請先登出
        if (req.cookies.name || req.cookies.auth) {
            console.log(` user already login cookie: ${req.cookies} `)
            return res.redirect('/?message=你已經登入過了<br>\\n請先登出才能更換帳號')
        }
        return res.render('resign', {
            'title': '註冊新用戶',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'resign',
            'error': req.query.error || '',
            'warning': req.query.warning || '',
            'message': req.query.message || '',
            'success': req.query.success || '',
        });
    }
}

const login = (fcn) => {
    return async function (req, res) {
        // 已經登入者請先登出
        if (req.cookies.name || req.cookies.auth) {
            console.log(` user already login cookie: ${req.cookies} `)
            return res.redirect('/?message=你已經登入過了<br>\\n請先登出才能更換帳號')
        }

        return res.render('login', {
            'title': '登入',
            'username': req.cookies.name || '訪客',
            'auth': req.cookies.auth || 'visitor',
            'baseUrl': req.baseUrl,
            'toc': fcn(req.cookies.auth),
            'pageKey': 'login',
            'error': req.query.error || '',
            'warning': req.query.warning || '',
            'message': req.query.message || '',
            'success': req.query.success || '',
        });
    }
}

const about = (fcn) => {
    return async function (req, res) {
        return res.render('about', {
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
const regist = async function (req, res) {
    // 已經登入者請先登出
    if (req.cookies.name || req.cookies.auth) {
        console.log(` user already login cookie: ${req.cookies} `)
        return res.redirect('/?message=你已經登入過了<br>\\n請先登出才能更換帳號')
    }

    const uc = req.body.userName;
    const pw = req.body.passwd;
    const em = req.body.emailAddr;
    // 排除掉沒輸入的空字串
    if (typeof uc === 'undefined' || typeof pw === 'undefined' || typeof em === 'undefined' || uc.length == 0 || pw.length == 0 || em.length == 0) {
        console.log(` no input name: ${uc} email: ${em} password: ${pw} `)
        return res.redirect('/resign?warning=請勿留空、確實輸入')
    }

    const conn = mysql.createConnection(dbConfig)
    conn.connect();

    // 查詢同名或同信箱的用戶
    conn.query('select * from users where name = ? or email = ?', [uc, em], function (error, results, field) {
        // 出錯就跳回原畫面
        if (error) {
            console.error('indexController.regist 查詢同名或同信箱的用戶 錯誤');
            console.error(error);
            conn.end();
            return res.redirect('/resign?error=查詢用戶出現錯誤，請稍後再嘗試');
        }

        console.log(`select * from users where name = "${uc}" or email = "${em}": `);
        console.log(results);
        // console.log(field);

        if (results.length > 0) {
            // 找到用戶名稱或用戶信箱 代表用戶已註冊過了 請用戶登入或選擇忘記密碼
            console.log(` USER already sign name: ${results[0].name} or email: ${results[0].email} `);
            conn.end();
            return res.redirect('/login?message=你已經註冊過了，請直接登入');
        } else {
            // 沒找到用戶名稱或用戶信箱 代表新用戶 將 用戶名稱、信箱、密碼 新增進入資料庫
            console.log(` new user ${uc} sign in`)
            conn.query('insert into users (name, email, password) values (?,?,?)', [uc, em, pw], function (error1, results1) {
                // 出錯就跳回原畫面
                if (error1) {
                    console.error('indexController.regist 新增用戶進入資料庫 錯誤');
                    console.error(error1);
                    conn.end();
                    return res.redirect('/resign?error=插入用戶出現錯誤，請稍後再嘗試');
                }

                console.log(`insert into users (name, email, password) values ("${uc}","${em}","${pw}"): `);
                console.log(results1)

                if (results1.affectedRows == 1) {
                    // 成功新增新用戶 接著新增新用戶的權限

                    console.log(` Success: insert new user ${uc} `)
                    conn.query('insert into userrole (id, roleid) values (?,?)', [results1.insertId, '2'], function (error2, results2) {
                        // 出錯就跳到登入畫面
                        if (error2) {
                            console.error('indexController.regist 新增用戶權限進入資料庫 錯誤');
                            console.error(error2);
                            conn.end();
                            return res.redirect('/login?error=插入用戶權限出現錯誤，請稍後再嘗試');
                        }

                        console.log(`insert into userrole (id, roleid) values ("${results1.insertId}", 2): `);
                        console.log(results2)

                        if (results2.affectedRows == 1) {
                            // 成功新增新用戶的權限
                            console.log(` Success: insert new user ${uc} auth 2 `)
                        } else {
                            console.log(` Failure: insert new user ${uc} auth 2 `)
                        }


                        conn.end()
                        return res.redirect('/login?success=你已成功註冊，請嘗試登入');
                    })
                } else {
                    // 失敗新增新用戶 跳回原畫面
                    console.log(` Failure: insert new user ${uc} `)
                    conn.end()
                    return res.redirect('/resign?warning=註冊失敗，請重新輸入');
                }
            })
        }
    });
}

// 帳號登入
const loging = async function (req, res) {
    // 已經登入者請先登出
    if (req.cookies.name || req.cookies.auth) {
        console.log(` user already login cookie: ${req.cookies} `)
        return res.redirect('/?message=你已經登入過了<br>\\n請先登出才能更換帳號')
    }

    const uc = req.body.userName;
    const pw = req.body.passwd;
    // 排除掉沒輸入的空字串
    if (typeof uc === 'undefined' || typeof pw === 'undefined' || uc.length == 0 || pw.length == 0) {
        console.log(` no input name: ${uc} password: ${pw} `)
        return res.redirect('/login?warning=請勿留空、確實輸入')
    }

    if (uc === 'guest' && pw === '123456') {
        res.cookie('name', '測試帳號', {
            maxAge: 5*60 * 1000, // 只存在n秒，n秒後自動消失
            httpOnly: true // true 僅限後端存取，無法使用前端document.cookie取得 預設為 false
        })
        res.cookie('auth', 'user', {
            maxAge: 5*60 * 1000, // 只存在n秒，n秒後自動消失
            httpOnly: true, // 僅限後端存取，無法使用前端document.cookie取得
        })
        return res.redirect('/?success=測試帳號登入')
    }

    const conn = mysql.createConnection(dbConfig)
    conn.connect();

    // 查詢同名且同密碼的用戶
    conn.query('select * from users where name = ? and password = ?', [uc, pw], function (error, results, field) {
        // 出錯就跳回原畫面
        if (error) {
            console.error('indexController.loging 查詢同名且同密碼的用戶 錯誤');
            console.error(error);
            conn.end();
            return res.redirect('/login?error=查詢用戶出現錯誤，請稍後再嘗試');
        }

        console.log(`select * from users where name = "${uc}" and password = "${pw}": `);
        console.log(results);
        // console.log(field);

        if (results.length > 0) {
            // 找到用戶名稱 將用戶名稱寫到 cookie
            res.cookie('name', uc, {
                maxAge: 5*60 * 1000, // 只存在n秒，n秒後自動消失
                httpOnly: true, // true 僅限後端存取，無法使用前端document.cookie取得 預設為 false
                // path: "/modelList", // 寫到指定網址 預設 "/"
            })
            console.log(` found user name: ${uc} `);

            // 查詢該用戶的權限
            conn.query(`select * from userroleview where name = ?`, uc, function (error2, results2, field2) {
                // 出錯就跳到首頁
                if (error2) {
                    console.error('indexController.loging 查詢該用戶的權限 錯誤');
                    console.error(error);
                    conn.end();
                    return res.redirect('/?error=查詢用戶權限出現錯誤，請稍後再嘗試')
                }
                console.log(`select * from userroleview where name = "${uc}": `);
                console.log(results2);

                if (results2.length > 0) {
                    // 找到用戶權限 將該權限寫到 cookie
                    res.cookie('auth', results2[0].rolename, {
                        maxAge: (results2[0].rolename === "root" || results2[0].rolename === "admin")? (5*60 * 1000):(5*60*1000), // 只存在n秒，n秒後自動消失
                        httpOnly: true, // 僅限後端存取，無法使用前端document.cookie取得
                    })
                    res.cookie('name', uc, {
                        maxAge: (results2[0].rolename === "root" || results2[0].rolename === "admin")? (5*60 * 1000):(5*60*1000), // 只存在n秒，n秒後自動消失
                        httpOnly: true, // true 僅限後端存取，無法使用前端document.cookie取得 預設為 false
                        // path: "/modelList", // 寫到指定網址 預設 "/"
                    })
                    console.log(` found user auth: ${results2[0].rolename} `);
                    conn.end();
                    return res.redirect(`/?success=歡迎 ${uc} 登入`)
                } else {
                    // 沒找到用戶權限 將 visitor 當權限寫到 cookie
                    res.cookie('auth', 'visitor', {
                        maxAge: 5*60*1000, // 只存在n秒，n秒後自動消失
                        httpOnly: true, // 僅限後端存取，無法使用前端document.cookie取得
                    })
                    console.log(` nofound user auth: visitor `);
                    conn.end();
                    return res.redirect(`/?success=歡迎 訪客`)
                }
            })
            // conn.end();
            // console.log('found user but no auth'); // 非同步

        } else {
            // 沒找到用戶名稱 重新回原畫面
            console.log(` nofound user name: ${uc} `)
            conn.end();
            return res.redirect('/login?message=沒有此用戶名稱、請重新輸入')
        }
    })
}

// 帳號登出
const logout = async function (req, res) {
    console.log('logout USER: ' + req.cookies.name);
    res.clearCookie('name', { path: '/' }); //清除目標
    res.clearCookie('auth');
    return res.redirect('/?success=完成登出');
}

module.exports = {
    index,
    resign,
    login,
    about,
    regist,
    loging,
    logout,
};