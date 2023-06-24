let overlay = document.getElementById('overlay');

function addDescription() {
    overlay.style.display = 'flex';
    console.log(description);
};

function add () {
    if (description !== '') {
        document.getElementById("text").innerText = description;
        overlay.style.display = 'none';
    }
};

async function getDescription () {
    const response = await fetch("/getDescription");
    const data = await response.json();
    document.getElementById("description").innerHTML = data.descriere;
}
    window.onload = getDescription;