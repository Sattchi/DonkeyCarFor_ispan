const modelListUser = (host, port) => {
    return async function (req, res) {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
            return res.redirect('/?warning="訪客權限不足"')
        }
        return res.redirect(`http://${host}:${port}/modelListUser`)
    }
}
const dataProcess = (host, port) => {
    return async function (req, res) {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
            return res.redirect('/?warning="訪客權限不足"')
        }
        return res.redirect(`http://${host}:${port}/dataProcess`)
    }
}
const control = (host, port) => {
    return async function (req, res) {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
            return res.redirect('/?warning="訪客權限不足"')
        }
        return res.redirect(`http://${host}:${port}/control`)
    }
}
const pay = (host, port) => {
    return async function (req, res) {
        if (typeof req.cookies.auth === 'undefined' || req.cookies.auth === 'visitor') {
            return res.redirect('/?warning="訪客權限不足"')
        }
        return res.redirect(`http://${host}:${port}`)
    }
}


module.exports = {
    modelListUser,
    dataProcess,
    control,
    pay,
}