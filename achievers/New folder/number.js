document.getElementById('num').innerText = 0
let num = 0
function plus() {
    num++
    document.getElementById('num').innerText = num
}
function minus() {
    num--
    document.getElementById('num').innerText = num
    if (num < 0) {
        num = 0
        document.getElementById('num').innerText = num
    }
}
