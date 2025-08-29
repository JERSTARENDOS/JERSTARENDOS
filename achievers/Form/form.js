const correctUsername = "jeremiah"
const correctPassword = "jeri222"
let attempts = 0
const maxAttempts = 3

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault()
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    const message = document.getElementById("message")

    if (attempts >= maxAttempts) {
        message.textContent = "You have been blocked due to too many failed attempts."
        return
    }

    if (username === correctUsername && password === correctPassword) {
        alert("Login Successful!")
        attempts = 0
        const button = document.querySelector("button[type='submit']")
        button.style.display = "none"
        setTimeout(() => {
            message.textContent = ""
            button.style.display = "block"
        }, 2000)
    } else {
        attempts++
        message.style.color = "red"
        if (attempts >= maxAttempts) {
            message.textContent = "You have been blocked due to too many failed attempts."
            document.getElementById("username").disabled = true
            document.getElementById("password").disabled = true
            document.querySelector("button[type='submit']").disabled = true
        } else {
            message.textContent = `Incorrect credentials. Attempt ${attempts} of ${maxAttempts}.`
        }
    }
})