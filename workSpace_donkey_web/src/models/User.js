class User {
    constructor(name, pass, _email) {
        this.name = name;
        this.email = _email;
    }
}

if (typeof require !== 'undefined' && require.main === module) {
    cat = new User("jack",445,98)
    console.log(cat)
    console.log(cat.name)
    console.log(cat.email)
}

module.exports = User