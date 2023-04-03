let galleryItems = document.querySelectorAll('.gallery img');
let galleryPictures = [];
let container = document.querySelector('.container');
let gallery = document.querySelector('.gallery');
let modalPictures = [];
let currentModal = null;
let focusables = [];
let index = 0;
let previouslyFocusedElement = null;
// traitement de éléments de la gallerie
galleryItems.forEach(item => {
    let itemSrc = item.getAttribute('src').replace('-424px', '');
    let itemAlt = item.getAttribute('alt');
    let itemTag = item.getAttribute('data-tag');
    //création d'une array pour manipulations ultérieures
    galleryPictures[index] = { "src": itemSrc, "thumbSrc": item.getAttribute('src'), "alt": itemAlt, "tag": itemTag, "index": index };
    //ajout de l'index pour l'appel à postériori
    item.setAttribute('index', index);
    modalPictures.push([itemSrc, itemAlt, itemTag]);
    item.addEventListener('click', e => {
        openModal(parseInt(e.target.getAttribute('index')));
    });
    index++;
})
//création de la liste de tags pour l'affichage du menu
let tagList = [];
for (let i = 0; i < modalPictures.length; i++) {
    if (!tagList.includes(modalPictures[i][2])) { tagList.push(modalPictures[i][2]); }
}

// préparation et affichage du menu
let catContainer = document.querySelector('.filters-container');
let catBtn = document.createElement('button');
catBtn.setAttribute('class', 'cat-filter-btn');

// all Button
let allBtn = catBtn.cloneNode();
allBtn.classList.add('active');
allBtn.setAttribute('role', 'tab');
allBtn.setAttribute('aria-label', 'All works');
allBtn.setAttribute('aria-controls', 'gallery-items');
allBtn.innerHTML = 'Tous';
allBtn.addEventListener('click', e => {
    e.preventDefault();
    gallery.innerHTML = '';
    activate(e);
    displayPictures(galleryPictures);
});
catContainer.appendChild(allBtn);
// others Button
for (i = 0; i < tagList.length; i++) {
    let newBtn = catBtn.cloneNode();
    newBtn.setAttribute('role', 'tab');
    newBtn.setAttribute('aria-label', tagList[i]+' works');
    newBtn.setAttribute('aria-controls', 'gallery-items');
    newBtn.innerHTML = tagList[i];
    newBtn.addEventListener('click', e => {
        let galleryItemsFiltered = galleryPictures.filter(picture => picture.tag === e.target.innerHTML);
        e.preventDefault();
        document.querySelector('.gallery').innerHTML = "";
        //gallery.scrollIntoView({behavior:"auto", inline:"center",block:"center"})
        activate(e);
        displayPictures(galleryItemsFiltered);
    });
    catContainer.appendChild(newBtn);
}
container.prepend(catContainer);

function activate(e) {
    let actived = catContainer.querySelector('.active');
    actived.classList.remove('active');
    e.target.classList.add('active');
}

function displayPictures(elements) {
    let gallery = document.querySelector('.gallery');
    gallery.classList.remove('slide');
    gallery.classList.add('hide');
    setTimeout(() => {
        for (let element of elements) {
            let newImg = `<img class="gallery-img" data-tag="${element.tag}" src="${element.thumbSrc}" alt="${element.alt}" index="${element.index}">`;
            gallery.innerHTML += newImg;
        }
        gallery.classList.remove('hide');
        gallery.classList.add('slide');
        let newImgs = gallery.querySelectorAll('img');
        newImgs.forEach(img => {
            img.addEventListener('click', e => {
                e.preventDefault();
                openModal(parseInt(e.target.getAttribute('index')));
            });
        });
    }, 100);
}

// add actions from keyboard events
window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeModal(e);
    }
    if (e.key === "Tab" && currentModal !== null) {
        focusInModal(e);
    }
});

function openModal(index) {
    currentModal = index;
    let modalWindow = document.querySelector('.modal-window');
    //ModalWindow
    modalWindow.style.display = null;
    modalWindow.removeAttribute("aria-hidden");
    modalWindow.setAttribute("aria-modal", "true");
    modalWindow.addEventListener("click", closeModal);
    modalWindow.classList.add('show');
    //backdrop
    let modalBackdrop = modalWindow.querySelector('.modal-backdrop');
    modalBackdrop.style.display = 'block';
    modalBackdrop.classList.add('show');
    // Focus
    previouslyFocusedElement = document.querySelector(":focus");
    focusables = Array.from(modalWindow.querySelectorAll("button, a, input, textarea, select"));
    //content
    let modalContent = document.querySelector('.modal-content');
    modalContent.style.display = 'block';
    modalContent.classList.add('show');
    modalContent.addEventListener('click', e => { e.stopPropagation() });
    updateModalDisplay(index);
    //controls
    let modalPrev = modalContent.querySelector('.modal-prev');
    let modalNext = modalContent.querySelector('.modal-next');
    modalPrev.addEventListener('click', e => prev());
    modalNext.addEventListener('click', e => next());
}

function closeModal() {
    let modalWindow = document.querySelector('.modal-window');
    let modalContent = document.querySelector('.modal-content');
    let modalPrev = modalContent.querySelector('.modal-prev');
    let modalNext = modalContent.querySelector('.modal-next');
    let modalBackdrop = modalWindow.querySelector('.modal-backdrop');
    // backdrop
    modalBackdrop.classList.remove('show');
    modalWindow.classList.remove('show');
    modalContent.classList.remove('show');
    setTimeout(() => {
        //controls
        modalPrev.removeEventListener('click', e => prev());
        modalNext.removeEventListener('click', e => next());
        //content reset
        modalContent.removeEventListener('click', e => { e.stopPropagation() });
        let img = modalContent.querySelector('img');
        img.setAttribute('src', "");
        img.setAttribute('alt', "");

        //focus
        if (previouslyFocusedElement !== null) previouslyFocusedElement.focus();
        //modal
        modalWindow.setAttribute("aria-hidden", true);
        modalWindow.removeAttribute("aria-modal", "true");
        modalWindow.removeEventListener("click", closeModal);
        modalWindow.style.display = "none";
    }, 290);

    currentModal = null;
}

function updateModalDisplay(index) {
    let modalContent = document.querySelector('.modal-content');
    let img = modalContent.querySelector('img');
    img.setAttribute('src', modalPictures[index][0]);
    img.setAttribute('alt', modalPictures[index][1]);
}

function prev() {
    currentModal--;
    if (currentModal === -1) { currentModal = 8; }
    updateModalDisplay(currentModal);
}

function next() {
    currentModal++;
    if (currentModal === 9) { currentModal = 0; }
    updateModalDisplay(currentModal);
}

const focusInModal = function (e) {
    e.preventDefault();
    let modalWindow = document.querySelector('.modal-window');
    let modalContent = modalWindow.querySelector('.modal-content');
    modalContent.querySelector(":focus");
    let focusIndex = focusables.findIndex(focusable => focusable === modalContent.querySelector(":focus"));
    if (focusIndex === undefined) { focusIndex = 0; }
    // if shiftKey pressed go back
    if (e.shiftKey === true) {
        focusIndex--;
    } else {
        focusIndex++;
    }
    //Brings focus to the right place (First or last) while exiting window
    if (focusIndex >= focusables.length) {
        focusIndex = 0;
    }
    if (focusIndex < 0) {
        focusIndex = focusable.length - 1;
    }
    focusables[focusIndex].focus();
}