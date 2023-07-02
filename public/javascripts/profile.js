let overlay = document.getElementById('overlay');

function openInput() {
    overlay.style.display = 'flex';
};

function addDescription() {
    if (description !== '') {
        overlay.style.display = 'none';
    }
}

function back() {
    window.location.reload;
}
