const mysql = require('mysql');
const dbConfig = require("../config/testDB");
const moment = require('moment')
const upload = require("../middleware/uploadcard");

// function formatDate(date) {
//     if (date)
//         return moment(date).format('YYYY/MM/DD hh:mm A');
//     else
//         return 'Not Yet'
// }

// const fileTypes = [
//     // "image/apng",
//     // "image/bmp",
//     // "image/gif",
//     "image/jpeg",
//     // "image/pjpeg",
//     "image/png",
//     // "image/svg+xml",
//     // "image/tiff",
//     // "image/webp",
//     // "image/x-icon"
// ];

// function validFileType(file) {
//     return fileTypes.includes(file.type);
// }

// function returnFileSize(number) {
//     if (number < 1024) {
//         return `${number} bytes`;
//     } else if (number >= 1024 && number < 1048576) {
//         return `${(number / 1024).toFixed(1)} KB`;
//     } else if (number >= 1048576) {
//         return `${(number / 1048576).toFixed(1)} MB`;
//     }
// }

function mysqlParseNull(inputStr, defaultStr) {
    if ((typeof inputStr === 'undefined') || (inputStr.trim() === '') || (inputStr.trim().toUpperCase() === 'NULL')) {
        if (defaultStr === undefined)
            return null;
        else
            return defaultStr;
    } else {
        return inputStr;
    }
}

function mysqlParseTime(inputDate, defaultObj) {
    if ((typeof inputDate === 'undefined') || (inputDate === null) || (typeof inputDate === 'string' && ((inputDate.trim() === '') || (inputDate.trim().toUpperCase() === 'NULL')))) {
        if (defaultObj === undefined)
            return null;
        if (defaultObj.str)
            return defaultObj.str
        if (defaultObj.date) {
            if (defaultObj.format) {
                return moment(defaultObj.date).format(defaultObj.format);
            }
            return moment(defaultObj.date).format('YYYY-MM-DD HH:mm:ss');
        }
        return null;
    } else {
        if (defaultObj && defaultObj.format) {
            return moment(inputDate).format(defaultObj.format);
        }
        return moment(inputDate).format('YYYY-MM-DD HH:mm:ss');
    }
}

function isInteger(numStr) {
    return !(isNaN(Number(numStr)) || !Number.isInteger(parseFloat(numStr)))
}

const roles = [
    { "roleid": 1, "rolename": "visitor", "rolechin": "訪客" },
    { "roleid": 2, "rolename": "user", "rolechin": "用戶" },
    { "roleid": 3, "rolename": "admin", "rolechin": "後台" },
    { "roleid": 4, "rolename": "root", "rolechin": "全權" },
]

const getList = (fcn) => {
    return async (req, res) => {
        const conn = mysql.createConnection(dbConfig)
        conn.connect();

        // 查詢所有車牌
        conn.query('select * from `parking`', (error, results, fields) => {
            // 出錯跳回首頁
            if (error) {
                console.error('allCardController.getList 查詢所有車牌 error: ')
                console.error(error);
                conn.end();
                return res.redirect('/?error=查詢車牌出現錯誤<br>\\n請稍後再嘗試');
            }

            // 紀錄查詢結果
            console.log('allCardController.getList');
            console.log('select * from `parking`: ');
            console.log(results);

            // 整理車牌資料 車牌列表有可能為空
            let cardInfo = []
            results.forEach(element => {
                cardInfo.push({
                    "cardid": element.id,
                    "license": element.license_plate,
                    "space_id": element.space_id,
                    "enter_time": mysqlParseTime(element.enter_time, { date: new Date(), format: "YYYY/MM/DD hh:mm A" }),
                    "out_time": mysqlParseTime(element.out_time, { str: "Not Yet", format: "YYYY/MM/DD hh:mm A" }),
                    "had_paid": element.had_paid,
                    "paid_off": element.paid_off,
                    "paid_time": mysqlParseTime(element.paid_time, { str: "Not Yet", format: "YYYY/MM/DD hh:mm A" }),
                    "car_img": element.car_img, //Buffer.from(element.car_img).toString('base64')
                    "car_img_type": element.car_img_type,
                    "car_img_size": element.car_img_size,
                })
            });

            conn.end()

            const auth = req.cookies.auth || 'visitor'
            const renderOption = {
                'title': '車牌列表',
                'pageKey': 'cards',
                'username': req.cookies.name || '訪客',
                'auth': auth,
                'baseUrl': req.baseUrl,
                'lists': cardInfo,
                'toc': fcn(auth),
                'error': req.query.error || '',
                'warning': req.query.warning || '',
                'message': req.query.message || '',
                'success': req.query.success || '',
            }

            if (req.baseUrl.indexOf('Admin') >= 0 && (auth === 'root' || auth === 'admin')) {
                renderOption["title"] = '車牌管理頁'
                return res.status(200).render('cardListAdmin', renderOption)
            } else {
                renderOption["title"] = '車牌列表'
                return res.status(200).render('cardList', renderOption)
            }
        })
    }
}

const uploadFiles = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        // return res.status(403).send({ message: "權限不足" })
        return res.status(403).redirect('/?warning=用戶權限不足')
    }
    try {
        // 使用 upload 中間件函數 處理上傳的文件
        await upload(req, res);
        if (req.file == undefined) {
            return res.status(400).send({ message: "請選擇要上傳的文件" });
        }

        const license = req.file.originalname.replace(/\.[^/.]+$/, "") // 非空
        const space_id = "0" // 非空
        const enter_time = mysqlParseTime("", { "date": new Date() })
        const out_time = mysqlParseTime("")
        const had_paid = "0" // 非空
        const paid_off = "0"
        const paid_time = mysqlParseTime("")

        // 新增車牌
        const conn = mysql.createConnection(dbConfig)
        conn.connect();
        conn.query('insert into parking (license_plate, space_id, enter_time, out_time, had_paid, paid_off, paid_time, car_img, car_img_type, car_img_size) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [license, space_id, enter_time, out_time, had_paid, paid_off, paid_time, req.file.buffer, req.file.mimetype, Math.ceil(req.file.size / 1024)], (error, results) => {
            if (error) {
                console.error('allCardController.insert 新增車牌 error: ')
                console.error(error);
                conn.end();
                return res.status(500).send({ message: "新增車牌出現錯誤<br>\\n請稍後再嘗試" })
                // return res.redirect(`${req.baseUrl}?error=新增車牌出現錯誤<br>\\n請稍後再嘗試`);
            }

            // 紀錄結果
            console.log('allCardController.uploadFiles')
            console.log(`insert into parking (license_plate, space_id, enter_time, out_time, had_paid, paid_off, paid_time, car_img, car_img_type, car_img_size) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            console.log(results);

            // 理論上應該只影響一筆資料
            if (results.affectedRows > 1) {
                // 新增超過一個車牌 錯誤
                console.error('allCardController.uploadFiles error: ')
                console.error(`Failure: insert more then one card`)
                conn.end()
                // return res.redirect(`${req.baseUrl}?error=插入過多車牌，錯誤<br>\\n請檢查資料庫`)
                return res.status(500).send({ message: "插入過多車牌，錯誤<br>\\n請檢查資料庫" })
            }

            if (results.affectedRows == 0) {
                // 沒新增車牌 警告
                console.error('allCardController.uploadFiles warning: ')
                console.error(`Failure: insert zero card`)
                conn.end()
                // return res.redirect(`${req.baseUrl}?warning=沒新增車牌<br>\\n請稍後再嘗試`)
                return res.status(200).send({ message: "沒新增車牌" })
            }

            // 紀錄成功新增車牌
            console.log('allCardController.uploadFiles')
            console.log(` Success: insert card`)
            conn.end()
            // return res.redirect(`${req.baseUrl}?success=插入新車牌資料成功`)
            return res.status(200).send({ message: "成功新增車牌: " + req.file.originalname })
        })
    } catch (error) {
        // 使用 Multer 捕獲相關錯誤
        console.log('allModelController.uploadFiles Multer 捕獲錯誤');
        console.error(error);
        if (error.code == "LIMIT_FILE_SIZE") {
            return res.status(500).send({
                message: "文件大小不能超過 15MB",
            });
        }
        return res.status(500).send({
            message: `無法上傳文件:, ${error}`
        });
    }
}

const download = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
        // return res.status(403).send({ message: "訪客權限不足" })
        return res.status(403).redirect('/modelList?warning=訪客權限不足')
    }

    try {
        const cardid = req.params.id;
        const conn = mysql.createConnection(dbConfig);
        conn.connect()

        conn.query(`select * from parking where id = ?`, cardid, (error, results, fields) => {
            if (error) {
                // 出錯跳回車牌列表頁
                console.error('allCardController.download 搜尋是否有此ID的車牌 error: ')
                console.error(error);
                conn.end();
                return res.redirect(`${req.baseUrl}?error=查詢車牌ID出現錯誤<br>\\n請稍後再嘗試`);
            }

            // 紀錄查詢結果
            console.log('allCardController.download')
            console.log(`select * from parking where id = "${cardid}": `);
            console.log(results);

            // 理論上只會有一個對應ID的車牌
            if (results.length > 1) {
                // 找到超過一個車牌
                console.error('allCardController.download error:')
                console.error(` 太多同 card id = ${cardid} 的車牌`)
                conn.end();
                return res.redirect(`${req.baseUrl}?error=出現錯誤，太多同 card id 的車牌<br>\\n請檢查資料庫`);
            }

            if (results.length == 0) {
                // 沒找到車牌
                console.log('allCardController.download warning:')
                console.log(` 沒找到此 cardid = ${cardid} 的車牌`)
                conn.end();
                return res.redirect(`${req.baseUrl}?warning=沒有 card id 的車牌<br>\\n請重新選擇`);
            }

            // 正確找到一個車牌
            console.log('allCardController.download:')
            console.log(` Success: download card with id = ${cardid}`)
            conn.end()
            // return res.render('cardForm', renderOption)
            return res.status(200).set('Content-Type', results[0].car_img_type).write(results[0].car_img)
        })
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }

}

const showNewForm = (fcn) => {
    return async (req, res) => {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
            // return res.status(403).send({ message: "權限不足" })
            return res.status(403).redirect('/?warning=用戶權限不足')
        }

        const auth = req.cookies.auth || 'visitor'
        const renderOption = {
            'title': '新增車牌',
            'pageKey': 'cards',
            'auth': auth,
            'baseUrl': req.baseUrl,
            'toc': fcn(auth),
            'card': {
                license: '',
                space_id: '',
                enter_time: '', // YYYY-MM-DDThh:mm
                out_time: '',
                had_paid: '',
                paid_off: '',
                paid_time: '',
                car_img: '',
                car_img_type: '',
                car_img_size: '',
            },
            'roles': roles,
            'error': req.query.error || '',
            'warning': req.query.warning || '',
            'message': req.query.message || '',
            'success': req.query.success || '',
        }
        return res.render('cardForm', renderOption)
    }
}

const insert = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        // return res.status(403).send({ message: "權限不足" })
        return res.status(403).redirect('/?warning=用戶權限不足')
    }

    try {
        await upload(req, res) // 先用 multer 中間件 處理後，body 才會有除了檔案以外的表單參數

        const license = req.body.license // 非空
        const space_id = req.body.space_id // 非空
        const enter_time = mysqlParseTime(req.body.enter_time, { "date": new Date() })
        const out_time = mysqlParseTime(req.body.out_time)
        const had_paid = req.body.had_paid // 非空
        const paid_off = mysqlParseNull(req.body.paid_off, "0")
        const paid_time = mysqlParseTime(req.body.paid_time)

        console.log('allCardController.insert post');
        console.log('license => ', license);
        console.log('space_id => ', space_id);
        console.log('enter_time => ', enter_time);
        console.log('out_time => ', out_time);
        console.log('had_paid => ', had_paid);
        console.log('paid_off => ', paid_off);
        console.log('paid_time => ', paid_time);
        console.log('file => ', req.file);  // multer 中間件 處理後，檔案會放在 req.file
        /*
        型式如下:
        {
            fieldname: 'car_img',
            originalname: 'mypilot.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 7d 00 00 07 34 08 02 00 00 00 b5 7e 27 99 00 00 00 06 62 4b 47 44 00 ff 00 ff 00 ff a0 bd a7 ... 78731 more bytes>,
            size: 78781
        }
        */

        // 排除掉沒輸入 license, space_id, had_paid
        if (typeof license === 'undefined' || typeof space_id === 'undefined' || typeof had_paid === 'undefined' || license.length == 0 || space_id.length == 0 || had_paid.length == 0) {
            console.error('allCardController.insert warning: ');
            console.error(` no input license: ${license} space_id: ${space_id} had_paid: ${had_paid} `)
            return res.redirect(`${req.baseUrl}/new?warning=請勿留空、確實輸入`)
        }

        // 排除掉沒上傳車子圖片的
        if (req.file == undefined) {
            console.error('allCardController.insert warning: ');
            console.error(` no input car image file `)
            return res.redirect(`${req.baseUrl}/new?warning=請選好要上傳的車子圖片`)
        }

        // 新增車牌
        const conn = mysql.createConnection(dbConfig)
        conn.connect();
        conn.query('insert into parking (license_plate, space_id, enter_time, out_time, had_paid, paid_off, paid_time, car_img, car_img_type, car_img_size) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [license, space_id, enter_time, out_time, (isInteger(had_paid)) ? had_paid : 0, paid_off, paid_time, req.file.buffer, req.file.mimetype, Math.ceil(req.file.size / 1024)], (error, results) => {
            if (error) {
                console.error('allCardController.insert 新增車牌 error: ')
                console.error(error);
                conn.end();
                return res.redirect(`${req.baseUrl}?error=新增車牌出現錯誤<br>\\n請稍後再嘗試`);
            }

            // 紀錄結果
            console.log('allCardController.insert')
            console.log(`insert into parking (license_plate, space_id, enter_time, out_time, had_paid, paid_off, paid_time, car_img, car_img_type, car_img_size) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            console.log(results);

            // 理論上應該只影響一筆資料
            if (results.affectedRows > 1) {
                // 新增超過一個車牌 錯誤
                console.error('allCardController.insert error: ')
                console.error(`Failure: insert more then one card`)
                conn.end()
                return res.redirect(`${req.baseUrl}?error=插入過多車牌，錯誤<br>\\n請檢查資料庫`)
            }

            if (results.affectedRows == 0) {
                // 沒新增車牌 警告
                console.error('allCardController.insert warning: ')
                console.error(`Failure: insert zero card`)
                conn.end()
                return res.redirect(`${req.baseUrl}?warning=沒新增車牌<br>\\n請稍後再嘗試`)
            }

            // 紀錄成功新增車牌
            console.log('allCardController.insert')
            console.log(` Success: insert card`)
            conn.end()
            return res.redirect(`${req.baseUrl}?success=插入新車牌資料成功`)
        })
    } catch (error) {
        console.error('allCardController.insert Multer 捕獲錯誤');
        console.error(error);
        if (error.code == "LIMIT_FILE_SIZE") {
            console.log('圖片大小超過 2MB');
            // return res.status(500).send({
            //     message: "文件大小不能超過 2MB",
            // });
            return res.redirect(`${req.baseUrl}?warning=圖檔大小不能超過 2MB<br>\\n請換一張圖檔`)
        }
        // return res.status(500).send({
        //     message: `無法上傳文件: ${error}`
        // });
        return res.redirect(`${req.baseUrl}?warning=無法上傳圖檔<br>\\n${error}<br>\\n請換一張圖檔`)
    }
}

const showEditForm = (fcn) => {
    return async (req, res) => {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
            // return res.status(403).send({ message: "權限不足" })
            return res.status(403).redirect('/?warning=用戶權限不足')
        }

        const cardid = req.query.id;

        // 搜尋是否有此ID的車牌
        const conn = mysql.createConnection(dbConfig);
        conn.connect()
        conn.query(`select * from parking where id = ?`, cardid, (error, results, fields) => {
            if (error) {
                // 出錯跳回車牌列表頁
                console.error('allCardController.showEditForm 搜尋是否有此ID的車牌 error: ')
                console.error(error);
                conn.end();
                return res.redirect(`${req.baseUrl}?error=查詢車牌ID出現錯誤<br>\\n請稍後再嘗試`);
            }

            // 紀錄查詢結果
            console.log('allCardController.showEditForm')
            console.log(`select * from parking where id = "${cardid}": `);
            console.log(results);

            // 理論上只會有一個對應ID的車牌
            if (results.length > 1) {
                // 找到超過一個車牌
                console.error('allCardController.showEditForm error:')
                console.error(' 太多同 card id 的車牌')
                conn.end();
                return res.redirect(`${req.baseUrl}?error=出現錯誤，太多同 card id 的車牌<br>\\n請檢查資料庫`);
            }

            if (results.length == 0) {
                // 沒找到車牌
                console.log('allCardController.showEditForm warning:')
                console.log(' 沒找到此 card id 的車牌')
                conn.end();
                return res.redirect(`${req.baseUrl}?warning=沒有 card id 的車牌<br>\\n請重新選擇`);
            }

            const auth = req.cookies.auth || 'visitor'
            const renderOption = {
                'title': '新增車牌',
                'pageKey': 'cards',
                'auth': auth,
                'baseUrl': req.baseUrl,
                'toc': fcn(auth),
                'card': {
                    cardid: cardid,
                    license: results[0].license_plate,
                    space_id: results[0].space_id,
                    enter_time: mysqlParseTime(results[0].enter_time, { date: new Date(), format: "YYYY/MM/DD hh:mm A" }), // YYYY-MM-DDThh:mm
                    out_time: mysqlParseTime(results[0].out_time, { str: "Not Yet", format: "YYYY/MM/DD hh:mm A" }),
                    had_paid: results[0].had_paid,
                    paid_off: results[0].paid_off,
                    paid_time: mysqlParseTime(results[0].paid_time, { str: "Not Yet", format: "YYYY/MM/DD hh:mm A" }),
                    car_img: results[0].car_img,
                    car_img_type: results[0].car_img_type,
                    car_img_size: results[0].car_img_size,
                },
                'roles': roles,
                'error': req.query.error || '',
                'warning': req.query.warning || '',
                'message': req.query.message || '',
                'success': req.query.success || '',
            }
            conn.end()
            return res.render('cardForm', renderOption)
        })
    }
}

const update = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        // return res.status(403).send({ message: "權限不足" })
        return res.status(403).redirect('/?warning=用戶權限不足')
    }


    try {
        await upload(req, res) // 先用 multer 中間件 處理後，body 才會有除了檔案以外的表單參數

        const cardid = req.body.cardid;
        const license = req.body.license // 非空
        const space_id = req.body.space_id // 非空
        const enter_time = mysqlParseTime(req.body.enter_time, { "date": new Date() })
        const out_time = mysqlParseTime(req.body.out_time)
        const had_paid = req.body.had_paid // 非空
        const paid_off = mysqlParseNull(req.body.paid_off, "0")
        const paid_time = mysqlParseTime(req.body.paid_time)

        console.log('allCardController.update post');
        console.log('cardid => ', cardid);
        console.log('license => ', license);
        console.log('space_id => ', space_id);
        console.log('enter_time => ', enter_time);
        console.log('out_time => ', out_time);
        console.log('had_paid => ', had_paid);
        console.log('paid_off => ', paid_off);
        console.log('paid_time => ', paid_time);
        console.log('file => ', req.file);  // multer 中間件 處理後，檔案會放在 req.file
        /*
        型式如下:
        {
            fieldname: 'car_img',
            originalname: 'mypilot.png',
            encoding: '7bit',
            mimetype: 'image/png',
            buffer: <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 02 7d 00 00 07 34 08 02 00 00 00 b5 7e 27 99 00 00 00 06 62 4b 47 44 00 ff 00 ff 00 ff a0 bd a7 ... 78731 more bytes>,
            size: 78781
        }
        */

        // 排除掉沒輸入 license, space_id, had_paid
        if (typeof license === 'undefined' || typeof space_id === 'undefined' || typeof had_paid === 'undefined' || license.length == 0 || space_id.length == 0 || had_paid.length == 0) {
            console.error('allCardController.update warning: ');
            console.error(` no input license: ${license} space_id: ${space_id} had_paid: ${had_paid} `)
            return res.redirect(`${req.baseUrl}/edit?id=${cardid}&warning=請勿留空、確實輸入`)
        }

        // 沒上傳圖片的話 沿用原本的圖
        const sqlstr = 'update parking set license_plate = ?, space_id = ?, enter_time = ?, out_time = ?, had_paid = ?, paid_off = ?, paid_time = ?' + ((req.file == undefined) ? '' : ', car_img = ?, car_img_type = ?, car_img_size = ?') + ' where id = ?';
        const valArr = (req.file == undefined) ? [license, space_id, enter_time, out_time, (isInteger(had_paid)) ? had_paid : 0, paid_off, paid_time, cardid] : [license, space_id, enter_time, out_time, (isInteger(had_paid)) ? had_paid : 0, paid_off, paid_time, req.file.buffer, req.file.mimetype, Math.ceil(req.file.size / 1024), cardid];

        // 修改車牌
        const conn = mysql.createConnection(dbConfig)
        conn.connect();
        conn.query(sqlstr, valArr, (error, results) => {
            if (error) {
                console.error('allCardController.update 修改車牌 error: ')
                console.error(error);
                conn.end();
                return res.redirect(`${req.baseUrl}?error=修改車牌出現錯誤<br>\\n請稍後再嘗試`);
            }

            // 紀錄結果
            console.log('allCardController.update')
            console.log(sqlstr);
            console.log(results);

            // 理論上應該只影響一筆資料
            if (results.affectedRows > 1) {
                // 修改超過一個車牌 錯誤
                console.error('allCardController.update error: ')
                console.error(`Failure: update more then one card`)
                conn.end()
                return res.redirect(`${req.baseUrl}?error=修改過多車牌，錯誤<br>\\n請檢查資料庫`)
            }

            if (results.affectedRows == 0) {
                // 修改增車牌 警告
                console.error('allCardController.update warning: ')
                console.error(`Failure: can't update card with id = "${cardid}"`)
                conn.end()
                return res.redirect(`${req.baseUrl}?warning=沒修改 ID為${cardid} 車牌<br>\\n請稍後再嘗試或檢查ID`)
            }

            // 紀錄成功修改車牌
            console.log('allCardController.update')
            console.log(` Success: update card with id = "${cardid}"`)
            conn.end()
            return res.redirect(`${req.baseUrl}?success=修改車牌資料成功`)
        })
    } catch (error) {
        console.error('allCardController.update Multer 捕獲錯誤');
        console.error(error);
        if (error.code == "LIMIT_FILE_SIZE") {
            console.log('圖片大小超過 2MB');
            // return res.status(500).send({
            //     message: "文件大小不能超過 2MB",
            // });
            return res.redirect(`${req.baseUrl}?warning=圖檔大小不能超過 2MB<br>\\n請換一張圖檔`)
        }
        // return res.status(500).send({
        //     message: `無法上傳文件: ${error}`
        // });
        return res.redirect(`${req.baseUrl}?warning=無法上傳圖檔<br>\\n${error}<br>\\n請換一張圖檔`)
    }
}

const deleted = async (req, res) => {
    if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor' || req.cookies.auth === 'user') {
        // return res.status(403).send({ message: "權限不足" })
        return res.status(403).redirect('/?warning=用戶權限不足')
    }

    const cardid = req.query.id;
    const conn = mysql.createConnection(dbConfig)

    try {
        conn.connect()
        // 刪除車牌
        conn.query('delete from parking where id = ?', cardid, (error, results, fields) => {
            // 出錯跳回車牌列表
            if (error) {
                console.error('allCardController.deleted 刪除車牌 error: ');
                console.error(error);
                conn.end();
                return res.redirect(`${req.baseUrl}?error=刪除車牌出現錯誤<br>\\n請稍後再嘗試`)
            }

            // 紀錄刪除車牌結果
            console.log('allCardController.deleted')
            console.log(`delete from parking where id = "${cardid}": `);
            console.log(results);

            // 理論上應該只影響一筆資料
            if (results.affectedRows > 1) {
                // 刪除超過一個車牌 錯誤
                console.error('allCardController.deleted error: ')
                console.error(`Failure: delete more then one card`)
                conn.end()
                return res.redirect(`${req.baseUrl}?error=刪除過多車牌，錯誤<br>\\n請檢查資料庫`)
            }

            if (results.affectedRows == 0) {
                // 沒刪除車牌 警告
                console.error('allCardController.deleted warning: ')
                console.error(`Failure: delete zero card`)
                conn.end()
                return res.redirect(`${req.baseUrl}?warning=沒成功刪除車牌<br>\\n請稍後再嘗試或檢查ID`)
            }


            // 紀錄成功刪除車牌
            console.log('allCardController.deleted')
            console.log(`Success: delete card id = ${cardid}`)
            conn.end()
            return res.redirect(`${req.baseUrl}?success=刪除車牌成功`)
        })
    } catch (error) {
        conn.on('connection', () => {
            conn.end()
        })
        return res.redirect(`${req.baseUrl}?error=出現錯誤${error}<br>\\n請檢查資料庫`)
    }
    // conn.end()
}

module.exports = {
    getList,
    uploadFiles,
    download,
    showNewForm,
    insert,
    showEditForm,
    update,
    deleted,
}