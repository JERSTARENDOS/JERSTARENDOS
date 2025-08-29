let names = [];

function storeName() {
    let nameValue = document.getElementById("Inp").value;
    names.push(nameValue);
    document.getElementById("Inp").value = ""; 
}

function showNames() {
    let listDiv = document.getElementById("list");
    listDiv.innerHTML = ""; 

    names.forEach((name) => {
        window.alert('Your age is $(input)');
        let p = document.createElement("p");
        p.innerHTML = name;
        listDiv.appendChild(p);
    });
}