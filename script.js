// ======================================================
// STYLE SYNTH AI
// COMPLETE WARDROBE ENGINE
// ======================================================

const STORAGE_KEY = "styleSynthFinalWardrobe";

let wardrobe = [];

let selectedCategory = "shirt";
let selectedOccasion = "College";
let selectedFilter = "all";
let selectedImage = "";

let lastOutfit = null;


// ======================================================
// LOAD DATA
// ======================================================

try {
    wardrobe = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || [];
} catch {
    wardrobe = [];
}


// ======================================================
// HELPERS
// ======================================================

function $(selector) {
    return document.querySelector(selector);
}

function $$(selector) {
    return document.querySelectorAll(selector);
}

function saveData() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(wardrobe)
    );
}

function escapeHTML(value) {
    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function toast(message) {

    const box = $("#toast");

    if (!box) return;

    box.textContent = message;
    box.classList.add("show");

    setTimeout(() => {
        box.classList.remove("show");
    }, 2200);
}


// ======================================================
// SCREEN NAVIGATION
// ======================================================

function openScreen(screenName) {

    $$(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    const screen = $("#" + screenName);

    if (screen) {
        screen.classList.add("active");
    }


    $$(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.screen === screenName
        );
    });


    const titles = {
        home: "Style your way.",
        wardrobe: "My wardrobe.",
        add: "Add clothing.",
        stylist: "AI Stylist.",
        result: "Your outfit.",
        favorites: "Favorites.",
        profile: "Your profile."
    };

    $("#topTitle").textContent =
        titles[screenName] || "Style Synth.";
}


// Every navigation button
$$("[data-screen]").forEach(button => {

    button.addEventListener("click", () => {

        openScreen(button.dataset.screen);

    });

});


// ======================================================
// ADD CLOTHING SCREEN
// ======================================================

$("#openAddBtn").addEventListener(
    "click",
    () => openScreen("add")
);


// ======================================================
// PHOTO UPLOAD
// ======================================================

const photoInput = $("#photoInput");
const previewArea = $("#previewArea");

$("#choosePhotoBtn").addEventListener(
    "click",
    () => photoInput.click()
);


photoInput.addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload = function(e) {

            selectedImage = e.target.result;

            previewArea.innerHTML = `
                <div style="width:100%;text-align:center;">
                    <img
                        src="${selectedImage}"
                        alt="Clothing preview"
                    >

                    <br>

                    <button
                        id="changePhotoBtn"
                        class="secondary"
                        type="button"
                        style="margin-top:15px;"
                    >
                        Change Photo
                    </button>
                </div>
            `;

            $("#changePhotoBtn")
                .addEventListener(
                    "click",
                    () => photoInput.click()
                );

        };

        reader.readAsDataURL(file);
    }
);


// ======================================================
// CATEGORY SELECTION
// ======================================================

$$(".category-btn").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectedCategory =
                button.dataset.category;

            $$(".category-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

        }
    );

});


// ======================================================
// SAVE CLOTHING
// ======================================================

$("#saveClothingBtn").addEventListener(
    "click",
    saveClothing
);


function saveClothing() {

    const name =
        $("#clothingName").value.trim();

    const color =
        $("#clothingColor").value.trim();

    const brand =
        $("#clothingBrand").value.trim();

    const occasion =
        $("#clothingOccasion").value;


    if (!name) {
        toast("Enter the clothing name");
        return;
    }

    if (!color) {
        toast("Enter the colour");
        return;
    }


    const item = {

        id:
            Date.now().toString() +
            Math.random().toString(36).slice(2),

        name: name,

        color: color,

        brand:
            brand || "No brand",

        category:
            selectedCategory,

        occasion:
            occasion,

        image:
            selectedImage,

        favorite:
            false,

        createdAt:
            Date.now()

    };


    wardrobe.unshift(item);

    saveData();

    resetAddForm();

    renderEverything();

    openScreen("wardrobe");

    toast("Added to your wardrobe ✨");
}


// ======================================================
// RESET ADD FORM
// ======================================================

function resetAddForm() {

    $("#clothingName").value = "";
    $("#clothingColor").value = "";
    $("#clothingBrand").value = "";

    $("#clothingOccasion").value =
        "College";

    selectedCategory = "shirt";
    selectedImage = "";

    photoInput.value = "";


    $$(".category-btn").forEach(button => {

        button.classList.toggle(
            "active",
            button.dataset.category === "shirt"
        );

    });


    previewArea.innerHTML = `

        <div class="upload-placeholder">

            <div class="upload-icon">＋</div>

            <h3>Upload clothing photo</h3>

            <p>
                Add a clear photo of your clothing.
            </p>

            <button
                id="choosePhotoBtn"
                class="primary"
                type="button"
            >
                Choose Photo
            </button>

        </div>
    `;


    $("#choosePhotoBtn")
        .addEventListener(
            "click",
            () => photoInput.click()
        );
}


// ======================================================
// FILTERS
// ======================================================

$$(".tab").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectedFilter =
                button.dataset.filter;

            $$(".tab").forEach(tab => {
                tab.classList.remove("active");
            });

            button.classList.add("active");

            renderWardrobe();

        }
    );

});


// ======================================================
// CARD HTML
// ======================================================

function iconFor(category) {

    if (category === "shirt") return "👕";

    if (category === "pant") return "👖";

    if (category === "accessory") return "🕶️";

    return "✨";
}


function createCard(item) {

    return `

        <article
            class="clothing-card"
            data-id="${item.id}"
        >

            <div class="clothing-photo">

                ${
                    item.image
                    ?
                    `<img
                        src="${item.image}"
                        alt="${escapeHTML(item.name)}"
                    >`
                    :
                    `<span class="emoji">
                        ${iconFor(item.category)}
                    </span>`
                }


                <button
                    class="favorite ${item.favorite ? "active" : ""}"
                    data-action="favorite"
                    data-id="${item.id}"
                    type="button"
                >
                    ${item.favorite ? "♥" : "♡"}
                </button>

            </div>


            <div class="clothing-info">

                <small>
                    ${escapeHTML(item.category)}
                </small>

                <h3>
                    ${escapeHTML(item.name)}
                </h3>

                <p>
                    ${escapeHTML(item.color)}
                </p>

                ${
                    item.brand !== "No brand"
                    ?
                    `<p>${escapeHTML(item.brand)}</p>`
                    :
                    ""
                }


                <div class="card-actions">

                    <button
                        class="edit-btn"
                        data-action="edit"
                        data-id="${item.id}"
                        type="button"
                    >
                        ✏️ Edit
                    </button>


                    <button
                        class="delete-btn"
                        data-action="delete"
                        data-id="${item.id}"
                        type="button"
                    >
                        🗑️ Delete
                    </button>

                </div>

            </div>

        </article>
    `;
}


// ======================================================
// ATTACH CARD ACTIONS
// ======================================================

function attachCardActions() {

    $$("[data-action]").forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                const action =
                    button.dataset.action;

                const id =
                    button.dataset.id;


                if (action === "favorite") {

                    toggleFavorite(id);

                }

                if (action === "edit") {

                    editItem(id);

                }

                if (action === "delete") {

                    deleteItem(id);

                }

            }
        );

    });
}


// ======================================================
// FAVORITES
// ======================================================

function toggleFavorite(id) {
  const item = wardrobe.find(
    item => String(item.id) === String(id)
  );

  if (!item) return;

  item.favorite = !Boolean(item.favorite);

  saveWardrobe();
  renderEverything();

  if (item.favorite) {
    showToast("❤️ Added to Liked");
  } else {
    showToast("💔 Removed from Liked");
  }
}

// ======================================================
// DELETE
// ======================================================

function deleteItem(id) {

    const item =
        wardrobe.find(
            clothing => clothing.id === id
        );

    if (!item) return;


    const confirmed =
        confirm(
            `Delete "${item.name}" from your wardrobe?`
        );


    if (!confirmed) return;


    wardrobe =
        wardrobe.filter(
            clothing => clothing.id !== id
        );


    saveData();

    renderEverything();

    toast("Item deleted");
}


// ======================================================
// EDIT
// ======================================================

function editItem(id) {

    const item =
        wardrobe.find(
            clothing => clothing.id === id
        );

    if (!item) return;


    const name =
        prompt(
            "Clothing name:",
            item.name
        );

    if (name === null) return;


    const color =
        prompt(
            "Colour:",
            item.color
        );

    if (color === null) return;


    const brand =
        prompt(
            "Brand:",
            item.brand
        );

    if (brand === null) return;


    item.name =
        name.trim() || item.name;

    item.color =
        color.trim() || item.color;

    item.brand =
        brand.trim() || "No brand";


    saveData();

    renderEverything();

    toast("Clothing updated ✨");
}


// ======================================================
// RENDER WARDROBE
// ======================================================

function renderWardrobe() {

    const grid =
        $("#wardrobeGrid");

    if (!grid) return;


    let items =
        wardrobe;


    if (selectedFilter !== "all") {

        items =
            wardrobe.filter(
                item =>
                    item.category === selectedFilter
            );

    }


    if (items.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">👗</div>

                <h2>No items here yet</h2>

                <p>
                    Add clothing to build your wardrobe.
                </p>

                <button
                    id="emptyAddBtn"
                    class="primary"
                    type="button"
                >
                    + Add Clothing
                </button>

            </div>
        `;


        $("#emptyAddBtn")
            .addEventListener(
                "click",
                () => openScreen("add")
            );


        return;
    }


    grid.innerHTML =
        items.map(createCard).join("");


    attachCardActions();
}


// ======================================================
// RECENT
// ======================================================

function renderRecent() {

    const grid =
        $("#recentGrid");

    if (!grid) return;


    const items =
        wardrobe.slice(0,4);


    if (items.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">＋</div>

                <h2>Your wardrobe is waiting</h2>

                <p>
                    Add your first clothing item.
                </p>

                <button
                    id="recentAddBtn"
                    class="primary"
                    type="button"
                >
                    Add Clothing
                </button>

            </div>
        `;


        $("#recentAddBtn")
            .addEventListener(
                "click",
                () => openScreen("add")
            );


        return;
    }


    grid.innerHTML =
        items.map(createCard).join("");


    attachCardActions();
}


// ======================================================
// FAVORITES SCREEN
// ======================================================

function renderFavorites() {

    const grid =
        $("#favoritesGrid");

    if (!grid) return;


    const favorites =
        wardrobe.filter(
            item => item.favorite === true
        );


    if (favorites.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">♡</div>

                <h2>No favorites yet</h2>

                <p>
                    Tap the heart on any clothing item.
                </p>

            </div>
        `;

        return;
    }


    grid.innerHTML =
        favorites.map(createCard).join("");


    attachCardActions();
}


// ======================================================
// COUNTERS
// ======================================================

function updateCounters() {

    $("#totalCount").textContent =
        wardrobe.length;


    $("#shirtCount").textContent =
        wardrobe.filter(
            item =>
                item.category === "shirt"
        ).length;


    $("#pantsCount").textContent =
        wardrobe.filter(
            item =>
                item.category === "pant"
        ).length;


    $("#favoriteCount").textContent =
        wardrobe.filter(
            item =>
                item.favorite === true
        ).length;
}


// ======================================================
// OCCASION
// ======================================================

$$(".occasion").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            selectedOccasion =
                button.dataset.occasion;


            $$(".occasion").forEach(
                option =>
                    option.classList.remove("active")
            );


            button.classList.add("active");

        }
    );

});


// ======================================================
// COLOUR ENGINE
// ======================================================

const colorMatches = {

    black: [
        "white","cream","beige","grey","gray",
        "blue","navy","red","green","olive",
        "brown","khaki","yellow"
    ],

    white: [
        "black","blue","navy","grey","gray",
        "beige","cream","brown","khaki",
        "olive","green","red","maroon",
        "burgundy","pink","purple","yellow",
        "orange"
    ],

    navy: [
        "white","cream","beige","grey","gray",
        "blue","brown","khaki","olive","pink"
    ],

    blue: [
        "white","cream","beige","grey","gray",
        "black","navy","brown","khaki","olive"
    ],

    beige: [
        "black","white","navy","blue","brown",
        "olive","green","maroon","burgundy","rust"
    ],

    cream: [
        "black","navy","blue","brown","olive",
        "green","maroon","burgundy","khaki"
    ],

    grey: [
        "black","white","navy","blue","pink",
        "purple","red","green","olive"
    ],

    gray: [
        "black","white","navy","blue","pink",
        "purple","red","green","olive"
    ],

    brown: [
        "white","cream","beige","blue","navy",
        "green","olive","khaki"
    ],

    khaki: [
        "white","black","navy","blue","brown",
        "olive","green","maroon"
    ],

    olive: [
        "white","cream","beige","black",
        "brown","navy","blue","khaki"
    ],

    green: [
        "white","cream","beige","black",
        "brown","navy","blue","grey","gray"
    ],

    red: [
        "black","white","grey","gray","navy","beige"
    ],

    maroon: [
        "black","white","grey","gray",
        "beige","cream","navy","khaki"
    ],

    burgundy: [
        "black","white","grey","gray",
        "beige","cream","navy","khaki"
    ],

    pink: [
        "white","grey","gray","navy",
        "black","beige","cream"
    ],

    purple: [
        "white","grey","gray","black",
        "beige","cream"
    ],

    yellow: [
        "black","white","navy",
        "grey","gray","blue"
    ],

    orange: [
        "black","white","navy",
        "beige","cream","brown"
    ],

    rust: [
        "black","white","navy",
        "beige","cream","brown"
    ]

};


function normalizeColor(color) {

    return String(color || "")
        .toLowerCase()
        .trim();
}


function getColor(color) {

    const value =
        normalizeColor(color);


    const names =
        Object.keys(colorMatches);


    for (const name of names) {

        if (
            value === name ||
            value.includes(name)
        ) {
            return name;
        }

    }


    if (value.includes("off white")) {
        return "white";
    }

    if (value.includes("dark blue")) {
        return "navy";
    }

    if (value.includes("light blue")) {
        return "blue";
    }

    if (value.includes("dark green")) {
        return "green";
    }

    return value;
}


function colourScore(a,b) {

    const colorA =
        getColor(a);

    const colorB =
        getColor(b);


    if (colorA === colorB) {
        return 65;
    }


    if (
        colorMatches[colorA] &&
        colorMatches[colorA].includes(colorB)
    ) {
        return 100;
    }


    if (
        colorMatches[colorB] &&
        colorMatches[colorB].includes(colorA)
    ) {
        return 100;
    }


    return 35;
}


// ======================================================
// OUTFIT SCORE
// ======================================================

function outfitScore(shirt,pants) {

    let score =
        colourScore(
            shirt.color,
            pants.color
        );


    if (
        shirt.occasion === selectedOccasion
    ) {
        score += 10;
    }


    if (
        pants.occasion === selectedOccasion
    ) {
        score += 10;
    }


    return Math.min(
        100,
        Math.round(score)
    );
}


// ======================================================
// GENERATE OUTFIT
// ======================================================

$("#generateBtn").addEventListener(
    "click",
    generateOutfit
);


function generateOutfit() {

    const shirts =
        wardrobe.filter(
            item =>
                item.category === "shirt"
        );


    const pants =
        wardrobe.filter(
            item =>
                item.category === "pant"
        );


    if (shirts.length === 0) {

        toast(
            "Add at least one shirt first 👕"
        );

        openScreen("add");

        return;
    }


    if (pants.length === 0) {

        toast(
            "Add at least one pair of pants first 👖"
        );

        openScreen("add");

        return;
    }


    const combinations = [];


    shirts.forEach(shirt => {

        pants.forEach(pantsItem => {

            combinations.push({

                shirt: shirt,

                pants: pantsItem,

                score:
                    outfitScore(
                        shirt,
                        pantsItem
                    )

            });

        });

    });


    combinations.sort(
        (a,b) =>
            b.score - a.score
    );


    let possible =
        combinations;


    if (lastOutfit) {

        const different =
            combinations.filter(
                combination =>
                    combination.shirt.id !==
                    lastOutfit.shirt.id ||
                    combination.pants.id !==
                    lastOutfit.pants.id
            );


        if (different.length > 0) {
            possible = different;
        }

    }


    const best =
        possible[
            Math.floor(
                Math.random() *
                Math.min(
                    possible.length,
                    3
                )
            )
        ];


    lastOutfit = best;


    renderResult(best);

    openScreen("result");

    toast(
        "Your outfit is ready ✨"
    );
}


// ======================================================
// RESULT
// ======================================================

function renderResult(outfit) {

    const shirt =
        outfit.shirt;

    const pants =
        outfit.pants;


    $("#resultArea").innerHTML = `

        <div class="result-card">

            <div class="result-header">

                <div>

                    <small class="eyebrow">
                        ${escapeHTML(selectedOccasion)}
                    </small>

                    <h2>
                        Your Style Synth Look
                    </h2>

                    <p>
                        Colour-matched from your wardrobe.
                    </p>

                </div>


                <div class="score">
                    ${outfit.score}%
                </div>

            </div>


            <div class="outfit">


                <div class="outfit-piece">

                    <div class="outfit-piece-image">

                        ${
                            shirt.image
                            ?
                            `<img
                                src="${shirt.image}"
                                alt="${escapeHTML(shirt.name)}"
                            >`
                            :
                            `<span>👕</span>`
                        }

                    </div>

                    <small>SHIRT</small>

                    <h3>
                        ${escapeHTML(shirt.name)}
                    </h3>

                    <p>
                        ${escapeHTML(shirt.color)}
                    </p>

                </div>


                <div class="plus">
                    +
                </div>


                <div class="outfit-piece">

                    <div class="outfit-piece-image">

                        ${
                            pants.image
                            ?
                            `<img
                                src="${pants.image}"
                                alt="${escapeHTML(pants.name)}"
                            >`
                            :
                            `<span>👖</span>`
                        }

                    </div>

                    <small>PANTS</small>

                    <h3>
                        ${escapeHTML(pants.name)}
                    </h3>

                    <p>
                        ${escapeHTML(pants.color)}
                    </p>

                </div>


            </div>


            <div class="reason">

                <strong>
                    🎨 Why this combination?
                </strong>

                <p>
                    ${escapeHTML(shirt.color)}
                    works with
                    ${escapeHTML(pants.color)}
                    for a balanced
                    ${escapeHTML(selectedOccasion.toLowerCase())}
                    look.
                </p>

            </div>


            <button
                id="anotherOutfitBtn"
                class="primary full"
                type="button"
            >
                ✦ Generate Another
            </button>

        </div>
    `;


    $("#anotherOutfitBtn")
        .addEventListener(
            "click",
            generateOutfit
        );
}


// ======================================================
// NOTIFICATION
// ======================================================

$("#notificationBtn")
    .addEventListener(
        "click",
        () => {

            toast(
                wardrobe.length
                ?
                `You have ${wardrobe.length} items in your wardrobe.`
                :
                "Your wardrobe is empty."
            );

        }
    );


// ======================================================
// RENDER EVERYTHING
// ======================================================

function renderEverything() {

    renderWardrobe();

    renderRecent();

    renderFavorites();

    updateCounters();

}


// ======================================================
// START
// ======================================================

renderEverything();

openScreen("home");
