const mysql = require('mysql');
const dbConfig = require("../config/testDB");
// const { isDate } = require('util/types');
const moment = require('moment')

function formatDate(date) {
    return moment(date).format('YYYY/MM/DD hh:mm A');
}

const roles = [
    { "roleid": 1, "rolename": "visitor", "rolechin": "訪客" },
    { "roleid": 2, "rolename": "user", "rolechin": "用戶" },
    { "roleid": 3, "rolename": "admin", "rolechin": "後台" },
    { "roleid": 4, "rolename": "root", "rolechin": "全權" },
]

const getList = (fcn) => {
    return async (req, res) => {
        // if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        //     // return res.status(403).send({ message: "權限不足" })
        //     return res.status(403).redirect('/?warning=用戶權限不足')
        // }

        const conn = mysql.createConnection(dbConfig)
        conn.connect();

        // 查詢所有用戶
        conn.query('SELECT * FROM `userroleview`', (error, results, fields) => {
            // 出錯跳回首頁
            if (error) {
                console.error('allUserController.getList 查詢所有用戶 error: ')
                console.error(error);
                conn.end();
                return res.redirect('/?error=查詢用戶出現錯誤<br>\\n請稍後再嘗試');
            }

            // 紀錄查詢結果
            console.log('allUserController.getList');
            console.log('SELECT * FROM `userroleview`: ');
            console.log(results);
            /*
            // console.log(fields)
            // let typeCastRow = []
            // fields.forEach(f => {
            //     //console.log(f);
            //     var name = f.name
            //     var type = f.type;
            //     var data = {
            //         columnName: name,
            //         type: type
            //     };
            //     if (type === mysql.Types.TINY || type === mysql.Types.SHORT || type === mysql.Types.LONG || type === mysql.Types.FLOAT || type === mysql.Types.DOUBLE || type === mysql.Types.DECIMAL || type === mysql.Types.LONGLONG || type === mysql.Types.INT24 || type === mysql.Types.NEWDECIMAL) {
            //         data.columnName = name;
            //         data.type = 'numeric-general';
            //     } else if (type === mysql.Types.VAR_STRING || type === mysql.Types.VARCHAR || type === mysql.Types.STRING) {
            //         data.columnName = name;
            //         data.type = 'text-label';
            //     } else if (type === mysql.Types.TIMESTAMP || type === mysql.Types.TIMESTAMP2 || type === mysql.Types.DATETIME || type === mysql.Types.DATETIME2 || type === mysql.Types.DATE || type === mysql.Types.NEWDATE) {
            //         data.columnName = name;
            //         data.type = 'date';
            //     } else {
            //         throw 'unexpected datatype';
            //         //console.error('unexpected datatype ');
            //     }
            //     typeCastRow.push(data);
            // });
            // console.log(typeCastRow)
            // console.log(isDate(results[0].updateTime))
            */
            // console.log('使用 moment');
            // console.log(formatDate(results[0].updateTime))

            // 理論上會有超過一個用戶
            if (results.length > 0) {
                // 找到用戶列表
                console.log('allUserController.getList');
                console.log(' Success: select `userroleview` ')

                // 整理用戶資料
                let userInfo = []
                results.forEach(element => {
                    if ((req.cookies.auth == 'admin' && (element.rolename !== 'admin' && element.rolename !== 'root')) || req.cookies.auth == 'root')
                        userInfo.push({
                            "userid": element.id,
                            "username": element.name,
                            "useremail": element.email,
                            "role": element.rolechin,
                            "updateTime": formatDate(element.updateTime)
                        })
                });

                const auth = req.cookies.auth || 'visitor'
                const renderOption = {
                    'title': '用戶管理頁',
                    'pageKey': 'users',
                    'username': req.cookies.name || '訪客',
                    'auth': auth,
                    'baseUrl': req.baseUrl,
                    'lists': userInfo,
                    'toc': fcn(auth),
                    'error': req.query.error || '',
                    'warning': req.query.warning || '',
                    'message': req.query.message || '',
                    'success': req.query.success || '',
                }

                conn.end()
                return res.render('userListAdmin', renderOption)
            } else {
                // 沒找到用戶 錯誤
                console.error('allUserController.getList');
                console.error(' Failure: select `userroleview` ')
                conn.end();
                return res.redirect('/?error=用戶列表出現錯誤，表格為空<br>\\n請稍後再嘗試');
            }
        })


    }
}

const showNewForm = (fcn) => {
    return async (req, res) => {
        // if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        //     // return res.status(403).send({ message: "權限不足" })
        //     return res.status(403).redirect('/?warning=用戶權限不足')
        // }

        // 紀錄一下
        console.log('allUserController.showNewForm');
        console.log(' Success: show new form');
        const auth = req.cookies.auth || 'visitor'
        const renderOption = {
            'title': '新增用戶',
            'pageKey': 'users',
            'auth': auth,
            'baseUrl': req.baseUrl,
            'toc': fcn(auth),
            'user': { name: '', email: '', password: '', role: '' },
            'roles': roles,
            'error': req.query.error || '',
            'warning': req.query.warning || '',
            'message': req.query.message || '',
            'success': req.query.success || '',
        }
        return res.render('userForm', renderOption)
    }
}

const insert = async (req, res) => {
    const uc = req.body.userName;
    const pw = req.body.passwd;
    const em = req.body.emailAddr;
    const sr = req.body.setrole;

    // 排除掉沒輸入的空字串
    if (typeof uc === 'undefined' || typeof pw === 'undefined' || typeof em === 'undefined' || typeof sr === 'undefined' || uc.length == 0 || pw.length == 0 || em.length == 0 || sr.length == 0) {
        console.error('allUserController.insert warning: ');
        console.error(` no input name: ${uc} email: ${em} password: ${pw} role: ${sr} `)
        return res.redirect('/userListAdmin/new?warning=請勿留空、確實輸入')
    }

    // 非全權不能賦予用戶 後台或全權 權限
    if (req.cookies.auth !== 'root' && (sr == roles[2].roleid || sr == roles[3].roleid)) {
        console.error('allUserController.insert warning: ')
        console.error(' not root want asign admin or root ')
        return res.status(403).redirect('/userListAdmin/new?warning=後台權限不足<br>\\n不能賦予用戶 後台 或 全權 權限')
    }

    const conn = mysql.createConnection(dbConfig)
    conn.connect();

    // 查詢同名或同信箱的用戶
    conn.query('select * from users where name = ? or email = ?', [uc, em], function (error, results, field) {
        // 出錯就跳回原畫面
        if (error) {
            console.error('allUserController.insert 查詢同名或同信箱的用戶 error');
            console.error(error);
            conn.end();
            return res.redirect('/userListAdmin?error=查詢用戶出現錯誤<br>\\n請稍後再嘗試');
        }

        // 紀錄查詢結果
        console.log('allUserController.insert')
        console.log(`select * from users where name = "${uc}" or email = "${em}": `);
        console.log(results);
        // console.log(field);

        if (results.length > 0) {
            // 找到 相同用戶名稱或用戶信箱 代表用戶已註冊過了 無法新增此用戶            
            console.log('allUserController.insert warning:')
            console.log(` USER already have name: ${results[0].name} or email: ${results[0].email} `);
            conn.end();
            return res.redirect('/userListAdmin/new?message=用戶名稱或信箱重複<br>\\n請換一個');
        } else {
            // 沒找到用戶名稱或用戶信箱 代表新用戶 將 用戶名稱、信箱、密碼 新增進入資料庫
            console.log('allUserController.insert:')
            console.log(` new user ${uc} `)
            conn.query('insert into users (name, email, password) values (?,?,?)', [uc, em, pw], function (error1, results1) {
                // 出錯就跳回原畫面
                if (error1) {
                    console.error('allUserController.insert 新增用戶進入資料庫 error');
                    console.error(error1);
                    conn.end();
                    return res.redirect('/userListAdmin?error=插入用戶出現錯誤<br>\\n請稍後再嘗試');
                }

                // 紀錄插入結果
                console.log('allUserController.insert')
                console.log(`insert into users (name, email, password) values ("${uc}","${em}","${pw}"): `);
                console.log(results1)

                // 理論上只會影響一列資料
                if (results1.affectedRows == 1) {
                    // 成功新增新用戶 接著新增新用戶的權限
                    console.log('allUserController.insert:')
                    console.log(` Success: insert new user ${uc} `)
                    conn.query('insert into userrole (id, roleid) values (?,?)', [results1.insertId, sr], function (error2, results2) {
                        // 出錯就跳到登入畫面
                        if (error2) {
                            console.error('allUserController.insert 新增用戶權限進入資料庫 error');
                            console.error(error2);
                            conn.end();
                            return res.redirect('/userListAdmin?error=插入用戶權限出現錯誤<br>\\n請稍後再嘗試');
                        }

                        // 紀錄插入結果
                        console.log('allUserController.insert')
                        console.log(`insert into userrole (id, roleid) values ("${results1.insertId}", "${sr}"): `);
                        console.log(results2)

                        // 理論上只會影響一列資料
                        if (results2.affectedRows == 1) {
                            // 新增新用戶的權限 成功
                            console.log('allUserController.insert')
                            console.log(` Success: insert new user ${uc} auth ${sr} `)
                            conn.end()
                            return res.redirect('/userListAdmin?success=插入用戶和權限成功');
                        } else {
                            // 新增新用戶的權限 失敗
                            console.log('allUserController.insert')
                            console.log(` Failure: insert new user ${uc} auth ${sr} `)
                            conn.end()
                            return res.redirect('/userListAdmin?warning=插入用戶成功<br>\\n但設定權限失敗<br>\\n請檢查資料庫');
                        }
                    })
                } else {
                    // 失敗新增新用戶 跳回原畫面
                    console.log('allUserController.insert')
                    console.log(` Failure: insert new user ${uc} `)
                    conn.end()
                    return res.redirect('/userListAdmin?warning=插入用戶失敗');
                }
            })
        }
    });
}

const showEditForm = (fcn) => {
    return async (req, res) => {
        // if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        //     // return res.status(403).send({ message: "權限不足" })
        //     return res.status(403).redirect('/?warning=用戶權限不足')
        // }
        const userid = req.query.id;
        console.log(`allUserController.showNewForm:`)
        console.log(` get id ${userid}`)

        // 禁止修改 jack 和 ohayowu
        if (userid == 1 || userid == 2) {
            console.log('allUserController.showEditForm:')
            console.log(' can\' edit jack and ohayowu')
            return res.redirect('/userListAdmin?warning=不能編輯這個用戶')
        }

        const conn = mysql.createConnection(dbConfig)
        conn.connect();

        // 查詢給定ID用戶的資料 預先填入表單內
        conn.query('SELECT `users`.*, `userrole`.`roleid` FROM `users` LEFT JOIN `userrole` ON `userrole`.`id` = `users`.`id` WHERE `users`.`id` = ?', userid, (error, results, fields) => {
            if (error) {
                console.error('allUserController.showEditForm 查詢給定ID用戶的資料 error: ')
                console.error(error);
                conn.end();
                return res.redirect('/userListAdmin?error=搜尋用戶ID出現錯誤<br>\\n請稍後再嘗試');
            }

            // 紀錄查詢結果
            console.log('allUserController.showEditForm')
            console.log(`SELECT \`users\`.*, \`userrole\`.\`roleid\` FROM \`users\` LEFT JOIN \`userrole\` ON \`userrole\`.\`id\` = \`users\`.\`id\` WHERE \`users\`.\`id\` = "${userid}": `);
            console.log(results);

            // 理論上只會有一個對應ID的用戶
            if (results.length == 1) {
                // 如果該用戶為 後台或全權 權限 而 網頁使用者沒有全權權限 禁止
                if (req.cookies.auth !== 'root' && (results[0].roleid == roles[2].roleid || results[0].roleid == roles[3].roleid)) {
                    console.log('allUserController.showEditForm:')
                    console.log(' not root want edit admin or root')
                    conn.end()
                    return res.status(403).redirect('/userListAdmin?warning=後台權限不足<br>\\n不能編輯 後台 或 全權 權限的用戶')
                }

                // 紀錄 顯示修改表單 成功
                console.log('allUserController.showEditForm:')
                console.log(' Success: show edit form')
                const auth = req.cookies.auth || 'visitor'
                const renderOption = {
                    'title': '修改用戶',
                    'pageKey': 'users',
                    'auth': auth,
                    'baseUrl': req.baseUrl,
                    'toc': fcn(auth),
                    'user': { id: userid, name: results[0].name, email: results[0].email, password: results[0].password, role: results[0].roleid }, // 預先填入表單用
                    'roles': roles,
                    'error': req.query.error || '',
                    'warning': req.query.warning || '',
                    'message': req.query.message || '',
                    'success': req.query.success || '',
                }
                conn.end()
                return res.render('userForm', renderOption)
            } else if (results.length > 1) {
                // 找到超過一個用戶
                console.error('allUserController.showEditForm error:')
                console.error(' 太多同 user id 的用戶')
                conn.end();
                return res.redirect('/userListAdmin?error=出現錯誤，太多同 user id 的用戶<br>\\n請檢查資料庫');
            } else {
                // 沒找到用戶
                console.log('allUserController.showEditForm warning:')
                console.log(' 沒找到此 user id 的用戶')
                conn.end();
                return res.redirect('/userListAdmin?warning=沒有 user id 的用戶<br>\\n請重新選擇');
            }
        })
    }
}

const update = async (req, res) => {
    const userid = req.body.userid;
    const uc = req.body.userName;
    const pw = req.body.passwd;
    const em = req.body.emailAddr;
    const sr = req.body.setrole;

    // 排除掉沒輸入的空字串
    if (typeof uc === 'undefined' || typeof pw === 'undefined' || typeof em === 'undefined' || typeof sr === 'undefined' || uc.length == 0 || pw.length == 0 || em.length == 0 || sr.length == 0) {
        console.log('allUserController.update warning:')
        console.log(` no input name: ${uc} email: ${em} password: ${pw} role: ${sr} `)
        return res.redirect(`/userListAdmin/edit?id=${userid}&warning=請勿留空、確實輸入`)
    }

    // 非全權不能賦予用戶 後台或全權 權限
    if (req.cookies.auth !== 'root' && (sr == roles[2].roleid || sr == roles[3].roleid)) {
        console.log('allUserController.update warning:')
        console.log(' not root want asign admin or root')
        return res.status(403).redirect(`/userListAdmin/edit?id=${userid}&warning=後台權限不足<br>\\n不能賦予用戶 後台 或 全權 權限`)
    }

    // 禁止修改 jack 和 ohayowu
    if (userid == 1 || userid == 2) {
        console.log('allUserController.update warning:')
        console.log(' can\' edit jack and ohayowu')
        return res.redirect('/userListAdmin?warning=不能編輯這個用戶')
    }

    const conn = mysql.createConnection(dbConfig)
    conn.connect();

    // 查詢是否有此 id 和他的權限
    conn.query('select * FROM `userroleview` where id = ?', userid, (error, results, fields) => {
        if (error) {
            console.error('allUserController.update 查詢是否有此 id 和他的權限 error');
            console.error(error);
            conn.end();
            return res.redirect('/userListAdmin?error=查詢用戶出現錯誤<br>\\n請稍後再嘗試');
        }

        // 紀錄查詢結果
        console.log('allUserController.update');
        console.log(`select * FROM \`userroleview\` where id = "${userid}"`);
        console.log(results);

        // - 數量為零 沒有此人 警告 跳出 /
        if (results.length === 0) {
            console.log('allUserController.update warning: ')
            console.log(` no user with id: ${userid} `);
            conn.end();
            return res.redirect('/userListAdmin?warning=沒有此ID用戶<br>\\n請重新輸入');
        }

        // - 數量超過一 錯誤 跳出 / 檢查資料庫
        if (results.length > 1) {
            console.error('allUserController.update error: ')
            console.error(` more then one users with id: ${userid} `);
            conn.end();
            return res.redirect('/userListAdmin?error=太多同 user id 的用戶<br>\\n請檢查資料庫');
        }

        // - 數量為一 有此人 但非全權不能修改 後台或全權 權限的用戶 警告 跳出 /
        if (req.cookies.auth !== 'root' && (results[0].roleid == roles[2].roleid || results[0].roleid == roles[3].roleid)) {
            console.log('allUserController.update warning:')
            console.log(' not root want edit admin or root')
            conn.end()
            return res.status(403).redirect(`/userListAdmin?warning=後台權限不足<br>\\n不能編輯 後台 或 全權 權限的用戶`)

        }

        // - 數量為一 有此人 有權限修改
        // 因為不希望用戶名稱或信箱重複 查詢非此 id 但同名或同信箱的用戶
        conn.query('select * from users where (not id = ?) and (name = ? or email = ?)', [userid, uc, em], (error1, results1, fields1) => {
            // - 錯誤 跳出 /
            if (error1) {
                console.error('allUserController.update 查詢非此 id 但同名或同信箱的用戶 錯誤');
                console.error(error1);
                conn.end();
                return res.redirect('/userListAdmin?error=查詢用戶出現錯誤<br>\\n請稍後再嘗試');
            }

            // 紀錄查詢結果
            console.log('allUserController.update');
            console.log(`select * from users where (not id = "${userid}") and (name = "${uc}" or email = "${em}")`);
            console.log(results1);

            // - 數量超過零 有重複 訊息 跳出 /edit
            if (results1.length > 0) {
                // 找到 非此 id 但同名或同信箱的用戶 因為用戶名稱和信箱禁止相同 無法更新此用戶名稱或信箱            
                console.log('allUserController.update message')
                console.log(` USER already have name: ${results1[0].name} or email: ${results1[0].email} `);
                conn.end();
                return res.redirect(`/userListAdmin/edit?id=${id}&message=用戶名稱或信箱重複<br>\\n請換一個`);
            }

            // - 數量為零 沒有重複
            // 沒找到 非此 id 但同名或同信箱的用戶 代表用戶名稱或信箱沒跟其他人重複 將此用戶更新
            // 開始更新 先更新用戶資料
            console.log('allUserController.update')
            console.log(` try update user ${uc} `)
            conn.query('update users set name = ?, email = ?, password = ? where id = ?', [uc, em, pw, userid], function (error2, results2) {
                // - 錯誤 跳出 /
                // 出錯就跳回原畫面
                if (error2) {
                    console.error('allUserController.update 更新用戶資料 錯誤');
                    console.error(error2);
                    conn.end();
                    return res.redirect('/userListAdmin?error=更新用戶資料出現錯誤<br>\\n請稍後再嘗試');
                }

                // 紀錄更新結果
                console.log('allUserController.update')
                console.log(`update users name = "${uc}", email = "${em}", password = "${pw}" where id = "${userid}": `);
                console.log(results2)

                // - 影響很多列 錯誤 跳出 / 檢查資料庫
                if (results2.affectedRows > 1) {
                    // 更新很多列 錯誤
                    console.error('allUserController.update error: ')
                    console.error(` update more then one rows of users `);
                    conn.end();
                    return res.redirect('/userListAdmin?error=更新太多列用戶列表<br>\\n請檢查資料庫');
                }

                // - 影響零列 沒成功更新用戶資料 警告
                if (results2.affectedRows === 0) {
                    console.log('allUserController.update warning: ');
                    console.log(` Failure: update no row of users `);

                    // 嘗試更新用戶權限
                    conn.query('update userrole set roleid = ? where id = ?', [sr, userid], function (error3, results3) {
                        // - 錯誤 跳出 /
                        // 出錯就跳到登入畫面
                        if (error3) {
                            console.error('allUserController.update 更新用戶權限 錯誤');
                            console.error(error3);
                            conn.end();
                            return res.redirect('/userListAdmin?error=更新用戶權限出現錯誤<br>\\n請稍後再嘗試');
                        }

                        // 紀錄更新結果
                        console.log('allUserController.update')
                        console.log(`update userrole set roleid = "${sr}" where id = "${userid}": `);
                        console.log(results3)

                        // - 影響很多列 錯誤 跳出 / 檢查資料庫
                        if (results2.affectedRows > 1) {
                            // 更新很多列 錯誤
                            console.error('allUserController.update error: ')
                            console.error(` update more then one rows of userrole `);
                            conn.end();
                            return res.redirect('/userListAdmin?error=更新太多列用戶權限列表<br>\\n請檢查資料庫');
                        }

                        // - 影響零列 沒成功更新用戶的權限 警告 跳出 /
                        if (results2.affectedRows === 0) {
                            // 更新用戶的權限 失敗
                            console.log('allUserController.update warning: ')
                            console.log(` update zero row of userrole `);
                            conn.end();
                            return res.redirect('/userListAdmin?warning=沒成功更新用戶和權限<br>\\n請重新輸入');
                        }

                        // - 只影響一列 成功更新 成功 跳出 /
                        console.log('allUserController.update warning')
                        console.log(` Success: update user ${uc}'s auth ${sr} `)
                        conn.end()
                        return res.redirect('/userListAdmin?warning=沒成功更新用戶資料<br>\\n但成功更新用戶權限<br>\\n請重新輸入');
                    })
                }

                // - 只影響一列 成功更新用戶資料
                console.log('allUserController.update')
                console.log(` Success: update user ${uc} `)
                // 接著更新用戶權限
                conn.query('update userrole set roleid = ? where id = ?', [sr, userid], function (error4, results4) {
                    // - 錯誤 跳出 /
                    // 出錯就跳到登入畫面
                    if (error4) {
                        console.error('allUserController.update 更新用戶權限 錯誤');
                        console.error(error4);
                        conn.end();
                        return res.redirect('/userListAdmin?error=更新用戶權限出現錯誤<br>\\n請稍後再嘗試');
                    }

                    // 紀錄更新結果
                    console.log('allUserController.update')
                    console.log(`update userrole set roleid = "${sr}" where id = "${userid}": `);
                    console.log(results4)

                    // - 影響很多列 錯誤 跳出 / 檢查資料庫
                    if (results2.affectedRows > 1) {
                        // 更新很多列 錯誤
                        console.error('allUserController.update error: ')
                        console.error(` update more then one rows of userrole `);
                        conn.end();
                        return res.redirect('/userListAdmin?error=更新太多列用戶權限列表<br>\\n請檢查資料庫');
                    }

                    // - 影響零列 沒成功更新用戶的權限 警告 跳出 /
                    if (results2.affectedRows === 0) {
                        // 更新用戶的權限 失敗
                        console.log('allUserController.update warning: ')
                        console.log(` Failure: update zero row of userrole `);
                        conn.end();
                        return res.redirect('/userListAdmin?warning=成功更新用戶<br>\\n但沒成功更新用戶權限<br>\\n請重新輸入');
                    }

                    // - 只影響一列 成功更新 成功 跳出 /
                    // 更新用戶權限 成功
                    console.log('allUserController.update')
                    console.log(` Success: update user ${uc}'s auth ${sr} `)
                    conn.end()
                    return res.redirect('/userListAdmin?success=成功更新用戶資料和權限');
                })
            })

        })
    })

}

const deleted = async (req, res) => {
    // 取得想刪除的用戶ID
    const userid = req.query.id

    // 頭兩個用戶(ID=1,2)不能刪除
    if (userid == 1 || userid == 2) {
        console.log('allUserController.deleted can\' delete jack and ohayowu')
        return res.redirect('/userListAdmin?warning=不能刪除這個用戶')
    }

    const conn = mysql.createConnection(dbConfig)
    conn.connect()

    // 先查詢是否有此ID的用戶、同時查詢此用戶的權限
    conn.query('SELECT `users`.*, `userrole`.`roleid` FROM `users` LEFT JOIN `userrole` ON `userrole`.`id` = `users`.`id` WHERE `users`.`id` = ?', userid, (error, results, fields) => {
        // 出錯跳回用戶列表
        if (error) {
            console.error('allUserController.deleted 查詢是否有此ID的用戶、同時查詢此用戶的權限 error: ')
            console.error(error);
            conn.end();
            return res.redirect('/userListAdmin?error=搜尋用戶ID出現錯誤<br>\\n請稍後再嘗試');
        }

        // 紀錄查詢結果
        console.log('allUserController.deleted')
        console.log(`SELECT \`users\`.*, \`userrole\`.\`roleid\` FROM \`users\` LEFT JOIN \`userrole\` ON \`userrole\`.\`id\` = \`users\`.\`id\` WHERE \`users\`.\`id\` = "${userid}": `);
        console.log(results);

        // 理論上應該只找到一個用戶
        if (results.length == 1) {
            // 檢查此用戶權限和發送此刪除要求的使用者權限 auth(root) 權限的使用者無法刪除 後台(auth) 或 全權(root) 權限的用戶
            if (req.cookies.auth !== 'root' && (results[0].roleid == roles[2].roleid || results[0].roleid == roles[3].roleid)) {
                console.log('allUserController.deleted not root want delete admin or root')
                conn.end()
                return res.status(403).redirect('/userListAdmin?warning=後台權限不足<br>\\n不能刪除 後台 或 全權 權限的用戶')
            }

            // 開始刪除用戶 為了通過外鍵檢查 先從用戶權限開始刪除
            conn.query('delete from userrole where id = ?', userid, (error1, results1) => {
                // 出錯跳回用戶列表
                if (error1) {
                    console.error('allUserController.deleted 先從用戶權限開始刪除 error: ');
                    console.error(error1);
                    conn.end();
                    return res.redirect('/userListAdmin?error=刪除用戶權限出現錯誤<br>\\n請稍後再嘗試')
                }

                // 紀錄刪除權限結果
                console.log('allUserController.deleted')
                console.log(`delete from userrole where id = "${userid}": `);
                console.log(results1);

                // 理論上應該只影響一筆資料
                if (results1.affectedRows == 1) {
                    // 紀錄成功刪除用戶權限
                    console.log('allUserController.deleted')
                    console.log(`Success: delete role of user id = ${userid}`)

                    // 接著刪除用戶
                    conn.query('delete from users where id = ?', userid, (error2, results2) => {
                        // 出錯跳回用戶列表
                        if (error2) {
                            console.error('allUserController.deleted 接著刪除用戶 error: ');
                            console.error(error2);
                            conn.end();
                            return res.redirect('/userListAdmin?error=刪除用戶出現錯誤<br>\\n但用戶權限已刪除<br>\\n請稍後再嘗試')
                        }

                        // 紀錄刪除用戶的結果
                        console.log('allUserController.deleted')
                        console.log(`delete from users where id = "${userid}": `);
                        console.log(results2);

                        // 理論上應該只影響一筆資料
                        if (results2.affectedRows == 1) {
                            // 紀錄成功刪除用戶
                            console.log('allUserController.deleted')
                            console.log(`Success: delete user id = ${userid} 中文`)
                            conn.end()
                            return res.redirect('/userListAdmin?success=刪除用戶成功')
                        } else if (results2.affectedRows > 1) {
                            // 刪除超過一個用戶 錯誤
                            console.error('allUserController.deleted error: ')
                            console.error(`Failure: delete more then one user`)
                            conn.end()
                            return res.redirect('/userListAdmin?error=刪除過多用戶，錯誤<br>\\n請檢查資料庫')
                        } else {
                            // 沒刪除用戶 警告
                            console.error('allUserController.deleted warning: ')
                            console.error(`Failure: delete zero user but delete one auth`)
                            conn.end()
                            return res.redirect('/userListAdmin?warning=沒成功刪除用戶<br>\\n但成功刪除用戶權限<br>\\n請檢查資料庫')
                        }
                    })
                } else if (results1.affectedRows > 1) {
                    // 刪除超過一個用戶權限 錯誤
                    console.error('allUserController.deleted error: ')
                    console.error(`Failure: delete more then one user auth`)
                    conn.end()
                    return res.redirect('/userListAdmin?error=刪除過多用戶權限，錯誤<br>\\n請檢查資料庫')
                } else {
                    // 沒刪除用戶權限 警告
                    console.error('allUserController.deleted warning: ')
                    console.error(`Failure: delete zero user auth`)

                    // 嘗試繼續刪除用戶
                    conn.query('delete from users where id = ?', userid, (error2, results2) => {
                        // 出錯跳回用戶列表
                        if (error2) {
                            console.error('allUserController.deleted 沒刪除用戶權限 嘗試繼續刪除用戶 error: ');
                            console.error(error2);
                            conn.end();
                            return res.redirect('/userListAdmin?error=刪除用戶出現錯誤<br>\\n沒刪除用戶權限<br>\\n請稍後再嘗試')
                        }

                        // 紀錄刪除用戶的結果
                        console.log('allUserController.deleted')
                        console.log(`delete from users where id = "${userid}": `);
                        console.log(results2);

                        // 理論上應該只影響一筆資料
                        if (results2.affectedRows == 1) {
                            // 紀錄成功刪除用戶
                            console.log('allUserController.deleted')
                            console.log(`Success: delete user id = ${userid}`)
                            conn.end()
                            return res.redirect('/userListAdmin?success=刪除用戶成功')
                        } else if (results2.affectedRows > 1) {
                            // 刪除超過一個用戶 錯誤
                            console.error('allUserController.deleted error: ')
                            console.error(`Failure: delete more then one user`)
                            conn.end()
                            return res.redirect('/userListAdmin?error=刪除過多用戶，錯誤<br>\\n請檢查資料庫')
                        } else {
                            // 沒刪除用戶 警告
                            console.error('allUserController.deleted warning: ')
                            console.error(`Failure: delete zero user and delete zero auth`)
                            conn.end()
                            return res.redirect('/userListAdmin?warning=沒成功刪除用戶<br>\\也沒刪除用戶權限<br>\\n請檢查資料庫')
                        }
                    })
                }
            })
        } else if (results.length > 1) {
            // 找到超過一個用戶 錯誤
            console.error('allUserController.deleted error: ')
            console.error(`Failure: find more then one user with id = "${userid}"`)
            conn.end()
            return res.redirect('/userListAdmin?error=找到過多用戶，錯誤<br>\\n請檢查資料庫')
        } else {
            // 沒找到用戶 警告
            console.error('allUserController.deleted warning: ')
            console.error(`Failure: find no user with id = "${userid}"`)
            conn.end()
            return res.redirect('/userListAdmin?warning=沒找到用戶<br>\\n請重新輸入')
        }
    })
}

module.exports = {
    getList,
    showNewForm,
    insert,
    showEditForm,
    update,
    deleted,
}