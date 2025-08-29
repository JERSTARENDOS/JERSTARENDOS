// const myChrildren = ['john', 'jane', 'jack']
// for(let i = 0; i < 3; i++) {
//     console.log(myChrildren[i]);
// }

// const car = {
//     brand: 'Toyota',
//     model: 'Camry',
//     year: '2020',
//     seats : {
//         frontseat: 2,
//         backseat: 3,
//     }
// }

// let txt = ''
// for (let x in car) {
//     txt += car[x] + ''
// }
// console.log(txt)

// car.color = 'red'
// console.log(car)


// car.seats.backseat
// console.log(car.seats.backseat)

// car.start = function() {
//     return (`The ${this.brand} ${this.model} is starting.`).toUpperCase()
// }
// console.log(car.start())

// const person = {
//   firstName: "John",
//   lastName: "Doe",
//   id: 5566,
//   fullName: function() {
//     return this.firstName + " " + this.lastName
//   }
// }
// console.log(person.fullName())

// const cars = ["BMW", "Volvo", "Mini"]

// let text = ""
// for (let x of cars) {
//   text += x + "<br>"
// }
// console.log(text)

// let i = 0

// while (i <=5) {
//   console.log(i)
//   i++
// }

// let count = 0
// function fave() {
//   while (count < 5) {
//     count++
//     console.log("Loop running")
//     return
//   }
//   console.log("Loop finished")
// }

// for(let x = 0; x < 5; x++) {
//     if(x === 3){ console.log(Loop Finished);
//         continue; // Skip the rest of the loop when x is 3
//     }
//    console.log("Loop Running" + x );
   
// }

try{
    console.log('The sum is: ' + c)
}catch(e){
    console.error("An error occurred: " + e.message)
}