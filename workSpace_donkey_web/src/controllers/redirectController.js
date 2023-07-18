module.exports = (host, port, path) => {
    return async function (req, res) {
        console.log('嘗試跳轉')
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
            console.log('死在跳轉前')
            return res.redirect('/?warning=訪客權限不足')
        }
        // cookie 無法跨越網域
        // res.cookie('name', req.cookies.name, {
        //     maxAge: (req.cookies.auth === "root" || req.cookies.auth === "admin")? (60 * 1000):(5*60*1000), // 只存在n秒，n秒後自動消失
        //     httpOnly: true, // true 僅限後端存取，無法使用前端document.cookie取得 預設為 false
        //     // path: `http://${host}:${port}`, // 寫到指定網址 預設 "/"
        //     domain: `${host}`,
        // })
        // res.cookie('auth', req.cookies.auth, {
        //     maxAge: (req.cookies.auth === "root" || req.cookies.auth === "admin")? (60 * 1000):(5*60*1000), // 只存在n秒，n秒後自動消失
        //     httpOnly: true, // 僅限後端存取，無法使用前端document.cookie取得
        //     // path: `http://${host}:${port}`, // 寫到指定網址 預設 "/"
        //     domain: `${host}`,
        // })
        return res.redirect(`http://${host}:${port}/${path}?name=${req.cookies.name}&auth=${req.cookies.auth}`)
    }
}