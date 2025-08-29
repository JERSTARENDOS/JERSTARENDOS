const numbers = []
function checkAge(){
    let input = document.getElementById('inp').value
    let dob = 2025 - input
    numbers.push(dob)
    document.getElementById('save').innerHTML = numbers
}


