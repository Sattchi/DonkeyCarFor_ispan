class User {
    constructor(name, pass, _email) {
        this.name = name;
        this.email = _email;
    }
}

if (typeof require !== 'undefined' && require.main === module) {
    cat = new User("jack")
    console.log(cat)
}