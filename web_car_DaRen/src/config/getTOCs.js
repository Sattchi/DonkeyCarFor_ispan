const tableOfContent = require('./toc.json')
const getTOC = () => {
    const visitor = []
    const user = []
    const admin = []
    const root = []
    tableOfContent.forEach((element) => {
        [key, val] = Object.entries(element)[0];
        val["pageKey"] = key

        if (val.visitor) {
            visitor.push(val)
        }
        if (val.user) {
            user.push(val)
        }
        if (val.admin) {
            admin.push(val)
        }
        if (val.root) {
            root.push(val)
        }
    });

    return { "visitor": visitor, "user": user, "admin": admin, "root": root }
}

if (typeof require !== 'undefined' && require.main === module) {
    console.log(getTOC().user)
}

module.exports = getTOC;
