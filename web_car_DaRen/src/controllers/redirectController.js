module.exports = (host, port, path) => {
    return async function (req, res) {
        return res.redirect(`http://${host}:${port}/${path}`)
    }
}