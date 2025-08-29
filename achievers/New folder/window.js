// function start() {
//     const inp = document.getElementById('inp')
//     if (inp.value === "5") {
//         alert("Correct guess")
//         alert(window.location.href)
//     } else {
//         alert("wrong guess! Try Again")
//         alert(window.location.href)
//     }

// const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// let txt = ""
// numbers.forEach(loopThrough)
// function loopThrough(value, index, array) {
//     "<ul class='nav'>"
//     "<nav>"
//     txt += "<li>" + value + "</li>"
//     "</nav>"
//     "</ul>"
// }
// document.getElementById('demo').innerHTML = txt

function switchValue() {
    let inp = document.getElementById('inp')
    switch(inp.value) {
        case '1':
            console.log("One");
            break;
        case '2':
            console.log("Two");
            break;
        case '3':
            console.log("Three");
            break;
        case '4':
            console.log("Four");
            break;
        case '5':
            console.log("Five");
            break;
        default:
            console.log("No match found");
            break;
    }
}