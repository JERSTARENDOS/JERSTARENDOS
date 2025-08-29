class Students {
    constructor(name, classs, age) {
        this.name = name
        this.classs = classs
        this.age = age
    }
}
class Club {
    constructor(name, student1, status) {
        this.name = name
        this.student1 = student1
        this.status = status
    }
    getdetails() {
        return `${this.student1.name} is the best ${this.status}`
    }
}

const students1 = new Students ('jerry', 'SS3', 16)
const club1 = new Club('Arsenal', students1, 'Goalkeeper')

console.log(club1.getdetails())