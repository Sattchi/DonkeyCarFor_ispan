// 包含 joystick 和 所有模型設定
const joystick = require('../config/joystick.json');

const modelData = require('../config/autoModel.json');
console.log(modelData);
// const fileChins = Object.values(modelData).map(item => item.chinName);
const fileChins = modelData.map(item => item.chinName);
const newfileChins = [];
while (fileChins.length) {
    newfileChins.push(fileChins.splice(0, 3))
}
console.log(newfileChins)

const index = (fcn) => {
    return async function (req, res) {
        res.cookie('name','測試帳號')
        res.cookie('auth','user')
        return res.render('index', {
            'title': '我的收藏',
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

const control = (fcn, host, carPort, page) => {
    return async function (req, res) {
        const name = (req.query.name)?req.query.name:'guest';
        const auth = (req.query.auth)?req.query.auth:'visitor';

        res.cookie('name', name, {
            maxAge: 5*60*1000,
            httpOnly: true,
        })
        res.cookie('auth', auth, {
            maxAge: 5*60*1000,
            httpOnly: true,
        })

        return res.render(page, {
            "title": "控制台",
            'toc': fcn(req.cookies.auth),
            'pageKey': 'control',
            "joyChin": joystick.chinName,
            "fileChins": newfileChins,
            "carWeb": `http://${host}:${carPort}`
        });
    }
}

module.exports = {
    index,
    control
}