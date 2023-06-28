let overlay = document.getElementById('overlay');

function addDescription() {
    overlay.style.display = 'flex';
};

function add () {
    if (description !== '') {
        overlay.style.display = 'none';
    }
};
