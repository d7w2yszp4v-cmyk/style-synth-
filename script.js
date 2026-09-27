// ==========================================
// STYLE SYNTH AI - SMART WARDROBE STYLIST
// ==========================================

const STORAGE_KEY = "styleSynthWardrobe";

let wardrobe = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

let selectedUploadCategory = "shirt";
let selectedOccasion = "College";
let selectedImage = "";
let currentCategory = "all";

let lastGeneratedPair = null;


// ==========================================
// BASIC HELPERS
// ==========================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

function saveWardrobe() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wardrobe));
}

function showToast(message) {
    const toast = $("#toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


// ==========================================
// FRAME NAVIGATION
// ==========================================

function showFrame(frameId) {
    $$(".frame").forEach(frame => {
        frame.classList.remove("active");
    });

    const frame = $("#" + frameId);

    if (frame) {
        frame.classList.add("active");
    }

    $$("[data-frame]").forEach(button => {
        button.classList.remove("active");
    });

    $$(`[data-frame="${frameId}"]`).forEach(button => {
        button.classList.add("active");
    });
}

$$("[data-frame]").forEach(button => {
    button.addEventListener("click", () => {
        showFrame(button.dataset.frame);
    });
});


// ==========================================
// UPLOAD FRAME
// ==========================================

function openUploadFrame(category = "shirt") {
    selectedUploadCategory = category;

    showFrame("uploadFrame");

    $$(".upload-category").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === category
        );
    });

    const categoryInput = $("#itemCategory");

    if (categoryInput) {
        categoryInput.value = category;
    }
}

$$(".add-item-btn").forEach(button => {
    button.addEventListener("click", () => {
        openUploadFrame(button.dataset.category || "shirt");
    });
});


// ==========================================
// IMAGE UPLOAD
// ==========================================

const imageInput = $("#imageInput");
const uploadPreview = $("#uploadPreview");

function resetUploadPreview() {
    if (!uploadPreview) return;

    uploadPreview.innerHTML = `
        <div class="upload-placeholder">
            <div class="upload-icon">＋</div>
            <h3>Add clothing photo</h3>
            <p>Upload a clear photo of your clothing item</p>
            <button type="button" class="primary-btn" id="chooseImageBtn">
                Choose Photo
            </button>
        </div>
    `;

    const chooseButton = $("#chooseImageBtn");

    if (chooseButton) {
        chooseButton.addEventListener("click", () => {
            imageInput?.click();
        });
    }
}

resetUploadPreview();

if (imageInput) {
    imageInput.addEventListener("change", event => {
        const file = event.target.files?.[0];

        if (!file) return;

        const reader = new FileReader();

        reader.onload = e => {
            selectedImage = e.target.result;

            if (uploadPreview) {
                uploadPreview.innerHTML = `
                    <div class="preview-image-wrap">
                        <img src="${selectedImage}" alt="Clothing preview">
                        <button type="button" class="secondary-btn" id="changeImageBtn">
                            Change Photo
                        </button>
                    </div>
                `;

                $("#changeImageBtn")?.addEventListener("click", () => {
                    imageInput.click();
                });
            }
        };

        reader.readAsDataURL(file);
    });
}


// ==========================================
// UPLOAD CATEGORY
// ==========================================

$$(".upload-category").forEach(button => {
    button.addEventListener("click", () => {
        selectedUploadCategory = button.dataset.category;

        $$(".upload-category").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const categoryInput = $("#itemCategory");

        if (categoryInput) {
            categoryInput.value = selectedUploadCategory;
        }
    });
});


// ==========================================
// RESET UPLOAD
// ==========================================

function resetUploadForm() {
    selectedImage = "";
    selectedUploadCategory = "shirt";

    if ($("#itemName")) $("#itemName").value = "";
    if ($("#itemColor")) $("#itemColor").value = "";
    if ($("#itemBrand")) $("#itemBrand").value = "";
    if ($("#itemOccasion")) $("#itemOccasion").value = "College";
    if ($("#itemCategory")) $("#itemCategory").value = "shirt";

    if (imageInput) {
        imageInput.value = "";
    }

    $$(".upload-category").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.category === "shirt"
        );
    });

    resetUploadPreview();
}


// ==========================================
// SAVE CLOTHING ITEM
// ==========================================

$("#saveItemBtn")?.addEventListener("click", () => {

    const name = $("#itemName")?.value.trim();
    const color = $("#itemColor")?.value.trim();
    const brand = $("#itemBrand")?.value.trim();
    const occasion = $("#itemOccasion")?.value || "College";
    const category = $("#itemCategory")?.value || selectedUploadCategory;

    if (!name) {
        showToast("Please enter the clothing name");
        return;
    }

    if (!color) {
        showToast("Please enter the colour");
        return;
    }

    const item = {
        id: Date.now().toString(),
        name,
        color,
        brand: brand || "No brand",
        occasion,
        category,
        image: selectedImage || "",
        favorite: false,
        createdAt: new Date().toISOString()
    };

    wardrobe.unshift(item);

    saveWardrobe();

    showToast("Clothing added to wardrobe ✨");

    resetUploadForm();

    renderEverything();

    showFrame("wardrobeFrame");
});


// ==========================================
// COLOUR ENGINE
// ==========================================

function normalizeColor(color) {
    return String(color || "")
        .toLowerCase()
        .trim();
}


const COLOR_GROUPS = {

    neutral: [
        "black",
        "white",
        "grey",
        "gray",
        "charcoal",
        "cream",
        "beige",
        "ivory",
        "off white",
        "off-white",
        "brown",
        "tan",
        "khaki"
    ],

    blue: [
        "blue",
        "navy",
        "light blue",
        "sky blue",
        "royal blue",
        "denim",
        "dark blue"
    ],

    green: [
        "green",
        "olive",
        "sage",
        "mint",
        "dark green"
    ],

    red: [
        "red",
        "maroon",
        "burgundy",
        "wine"
    ],

    yellow: [
        "yellow",
        "mustard",
        "gold"
    ],

    orange: [
        "orange",
        "rust",
        "burnt orange",
        "terracotta"
    ],

    pink: [
        "pink",
        "rose",
        "baby pink"
    ],

    purple: [
        "purple",
        "lavender",
        "violet"
    ]
};


function getColorGroup(color) {

    const value = normalizeColor(color);

    for (const group in COLOR_GROUPS) {

        if (
            COLOR_GROUPS[group].some(
                knownColor =>
                    value === knownColor ||
                    value.includes(knownColor)
            )
        ) {
            return group;
        }
    }

    return "neutral";
}


// ==========================================
// COLOUR COMPATIBILITY
// ==========================================

const COLOR_MATCHES = {

    black: [
        "black",
        "white",
        "grey",
        "gray",
        "beige",
        "cream",
        "blue",
        "navy",
        "red",
        "green",
        "olive",
        "brown",
        "khaki",
        "yellow"
    ],

    white: [
        "black",
        "navy",
        "blue",
        "grey",
        "gray",
        "beige",
        "cream",
        "brown",
        "khaki",
        "olive",
        "green",
        "red",
        "maroon",
        "burgundy",
        "pink",
        "purple",
        "yellow",
        "orange"
    ],

    navy: [
        "white",
        "cream",
        "beige",
        "grey",
        "gray",
        "blue",
        "brown",
        "khaki",
        "olive",
        "pink"
    ],

    blue: [
        "white",
        "cream",
        "beige",
        "grey",
        "gray",
        "black",
        "navy",
        "brown",
        "khaki",
        "olive"
    ],

    beige: [
        "black",
        "white",
        "navy",
        "blue",
        "brown",
        "olive",
        "green",
        "maroon",
        "burgundy",
        "rust"
    ],

    cream: [
        "black",
        "navy",
        "blue",
        "brown",
        "olive",
        "green",
        "maroon",
        "burgundy",
        "khaki"
    ],

    grey: [
        "black",
        "white",
        "navy",
        "blue",
        "pink",
        "purple",
        "red",
        "green",
        "olive"
    ],

    gray: [
        "black",
        "white",
        "navy",
        "blue",
        "pink",
        "purple",
        "red",
        "green",
        "olive"
    ],

    brown: [
        "white",
        "cream",
        "beige",
        "blue",
        "navy",
        "green",
        "olive",
        "khaki"
    ],

    khaki: [
        "white",
        "black",
        "navy",
        "blue",
        "brown",
        "olive",
        "green",
        "maroon"
    ],

    olive: [
        "white",
        "cream",
        "beige",
        "black",
        "brown",
        "navy",
        "blue",
        "khaki"
    ],

    green: [
        "white",
        "cream",
        "beige",
        "black",
        "brown",
        "navy",
        "blue",
        "grey",
        "gray"
    ],

    red: [
        "black",
        "white",
        "grey",
        "gray",
        "navy",
        "beige"
    ],

    maroon: [
        "black",
        "white",
        "grey",
        "gray",
        "beige",
        "cream",
        "navy",
        "khaki"
    ],

    burgundy: [
        "black",
        "white",
        "grey",
        "gray",
        "beige",
        "cream",
        "navy",
        "khaki"
    ],

    pink: [
        "white",
        "grey",
        "gray",
        "navy",
        "black",
        "beige",
        "cream"
    ],

    purple: [
        "white",
        "grey",
        "gray",
        "black",
        "beige",
        "cream"
    ],

    yellow: [
        "black",
        "white",
        "navy",
        "grey",
        "gray",
        "blue"
    ],

    mustard: [
        "black",
        "white",
        "navy",
        "brown",
        "blue",
        "cream"
    ],

    orange: [
        "black",
        "white",
        "navy",
        "beige",
        "cream",
        "brown"
    ],

    rust: [
        "black",
        "white",
        "navy",
        "beige",
        "cream",
        "brown"
    ]
};


function getExactColorWord(color) {

    const value = normalizeColor(color);

    const possibleColors = Object.keys(COLOR_MATCHES);

    for (const knownColor of possibleColors) {

        if (
            value === knownColor ||
            value.includes(knownColor)
        ) {
            return knownColor;
        }
    }

    return value;
}


function colorCompatibility(colorA, colorB) {

    const a = getExactColorWord(colorA);
    const b = getExactColorWord(colorB);

    if (!a || !b) return 45;

    if (a === b) return 70;

    if (
        COLOR_MATCHES[a] &&
        COLOR_MATCHES[a].includes(b)
    ) {
        return 100;
    }

    if (
        COLOR_MATCHES[b] &&
        COLOR_MATCHES[b].includes(a)
    ) {
        return 100;
    }

    const groupA = getColorGroup(a);
    const groupB = getColorGroup(b);

    if (groupA === "neutral" || groupB === "neutral") {
        return 80;
    }

    return 45;
}


// ==========================================
// OCCASION SCORING
// ==========================================

function occasionScore(item, occasion) {

    if (!item.occasion) return 50;

    const itemOccasion = item.occasion.toLowerCase();
    const target = occasion.toLowerCase();

    if (itemOccasion === target) {
        return 100;
    }

    if (
        itemOccasion === "casual" ||
        target === "casual"
    ) {
        return 75;
    }

    return 50;
}


// ==========================================
// OUTFIT SCORING
// ==========================================

function scoreOutfit(shirt, pants, occasion) {

    let score = 0;

    // Colour compatibility
    score += colorCompatibility(
        shirt.color,
        pants.color
    ) * 0.55;

    // Occasion compatibility
    score += occasionScore(
        shirt,
        occasion
    ) * 0.20;

    score += occasionScore(
        pants,
        occasion
    ) * 0.20;

    // Small bonus for complete metadata
    if (shirt.brand && shirt.brand !== "No brand") {
        score += 2;
    }

    if (pants.brand && pants.brand !== "No brand") {
        score += 2;
    }

    return Math.round(score);
}


// ==========================================
// SMART OUTFIT GENERATOR
// ==========================================

function generateOutfit() {

    const shirts = wardrobe.filter(
        item => item.category === "shirt"
    );

    const pants = wardrobe.filter(
        item =>
            item.category === "pant" ||
            item.category === "pants"
    );

    if (shirts.length === 0) {
        showToast("Add at least one shirt first 👕");
        return;
    }

    if (pants.length === 0) {
        showToast("Add at least one pant first 👖");
        return;
    }


    const combinations = [];

    shirts.forEach(shirt => {

        pants.forEach(pantsItem => {

            const score = scoreOutfit(
                shirt,
                pantsItem,
                selectedOccasion
            );

            combinations.push({
                shirt,
                pants: pantsItem,
                score
            });

        });

    });


    combinations.sort(
        (a, b) => b.score - a.score
    );


    // Avoid immediately showing the exact same pair
    let selected = combinations[0];

    const differentOptions = combinations.filter(
        option =>
            !lastGeneratedPair ||
            option.shirt.id !== lastGeneratedPair.shirtId ||
            option.pants.id !== lastGeneratedPair.pantsId
    );

    if (differentOptions.length > 0) {

        // Choose from the top few compatible combinations
        const topOptions = differentOptions.slice(
            0,
            Math.min(3, differentOptions.length)
        );

        selected =
            topOptions[
                Math.floor(Math.random() * topOptions.length)
            ];
    }


    lastGeneratedPair = {
        shirtId: selected.shirt.id,
        pantsId: selected.pants.id
    };


    renderOutfit(selected);

    showFrame("outfitFrame");

    showToast("AI Stylist created your outfit ✨");
}


// ==========================================
// OCCASION SELECTION
// ==========================================

$$(".occasion-option").forEach(button => {

    button.addEventListener("click", () => {

        selectedOccasion =
            button.dataset.occasion ||
            button.textContent.trim();

        $$(".occasion-option").forEach(
            option => option.classList.remove("active")
        );

        button.classList.add("active");
    });

});


// Generate button
$("#generateOutfitBtn")?.addEventListener(
    "click",
    generateOutfit
);


// ==========================================
// OUTFIT RESULT
// ==========================================

function renderOutfit(result) {

    const outfitResult = $("#outfitResult");

    if (!outfitResult || !result) return;

    const shirt = result.shirt;
    const pants = result.pants;

    outfitResult.innerHTML = `

        <div class="outfit-result-card">

            <div class="outfit-header">

                <div>
                    <span class="eyebrow">AI STYLIST</span>

                    <h2>${selectedOccasion} Outfit</h2>

                    <p>
                        Smart colour-matched combination
                        selected from your wardrobe.
                    </p>
                </div>

                <div class="outfit-score">
                    ${result.score}%
                    <span>match</span>
                </div>

            </div>


            <div class="outfit-items">

                <div class="outfit-piece">

                    <div class="outfit-image">

                        ${
                            shirt.image
                            ? `<img src="${shirt.image}" alt="${shirt.name}">`
                            : `<span>👕</span>`
                        }

                    </div>

                    <div>
                        <small>SHIRT</small>
                        <h3>${escapeHTML(shirt.name)}</h3>
                        <p>${escapeHTML(shirt.color)}</p>
                    </div>

                </div>


                <div class="outfit-plus">＋</div>


                <div class="outfit-piece">

                    <div class="outfit-image">

                        ${
                            pants.image
                            ? `<img src="${pants.image}" alt="${pants.name}">`
                            : `<span>👖</span>`
                        }

                    </div>

                    <div>
                        <small>PANTS</small>
                        <h3>${escapeHTML(pants.name)}</h3>
                        <p>${escapeHTML(pants.color)}</p>
                    </div>

                </div>

            </div>


            <div class="stylist-reason">

                <strong>Why this works</strong>

                <p>
                    ${escapeHTML(shirt.color)}
                    shirt pairs with
                    ${escapeHTML(pants.color)}
                    pants for a balanced ${selectedOccasion.toLowerCase()} look.
                </p>

            </div>


            <button
                class="primary-btn"
                id="generateAnotherBtn"
            >
                Generate Another
            </button>

        </div>
    `;


    $("#generateAnotherBtn")?.addEventListener(
        "click",
        generateOutfit
    );
}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHTML(value) {

    return String(value || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ==========================================
// CATEGORY LABEL
// ==========================================

function categoryLabel(category) {

    const labels = {
        shirt: "Shirt",
        pant: "Pants",
        pants: "Pants",
        accessory: "Accessory"
    };

    return labels[category] || category;
}


// ==========================================
// ITEM ICON
// ==========================================

function itemIcon(category) {

    if (category === "shirt") return "👕";
    if (category === "pant" || category === "pants") return "👖";
    if (category === "accessory") return "🕶️";

    return "✨";
}


// ==========================================
// ITEM CARD
// ==========================================

function createItemCard(item) {

    return `

        <div class="item-card" data-id="${item.id}">

            <div class="item-image">

                ${
                    item.image
                    ? `<img src="${item.image}" alt="${escapeHTML(item.name)}">`
                    : `<span>${itemIcon(item.category)}</span>`
                }

                <button
                    type="button"
                    class="favorite-btn ${item.favorite ? "active" : ""}"
                    data-action="favorite"
                    data-id="${item.id}"
                    aria-label="Favorite"
                >
                    ${item.favorite ? "♥" : "♡"}
                </button>

            </div>


            <div class="item-info">

                <span class="item-category">
                    ${categoryLabel(item.category)}
                </span>

                <h3>${escapeHTML(item.name)}</h3>

                <p>${escapeHTML(item.color)}</p>

                ${
                    item.brand &&
                    item.brand !== "No brand"
                    ? `<small>${escapeHTML(item.brand)}</small>`
                    : ""
                }


                <div class="item-actions">

                    <button
                        type="button"
                        class="secondary-btn"
                        data-action="edit"
                        data-id="${item.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="secondary-btn danger-btn"
                        data-action="delete"
                        data-id="${item.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </div>
    `;
}


// ==========================================
// CARD ACTIONS
// ==========================================

function attachCardActions() {

    $$(".item-card").forEach(card => {

        card.addEventListener("click", event => {

            const button =
                event.target.closest("[data-action]");

            if (!button) return;

            const action = button.dataset.action;
            const id = button.dataset.id;

            const item =
                wardrobe.find(item => item.id === id);

            if (!item) return;


            // FAVORITE
            if (action === "favorite") {

                item.favorite = !item.favorite;

                saveWardrobe();

                renderEverything();

                showToast(
                    item.favorite
                        ? "Added to favorites ❤️"
                        : "Removed from favorites"
                );

                return;
            }


            // DELETE
            if (action === "delete") {

                const confirmed =
                    confirm(
                        `Delete "${item.name}" from your wardrobe?`
                    );

                if (!confirmed) return;

                wardrobe =
                    wardrobe.filter(
                        clothing => clothing.id !== id
                    );

                saveWardrobe();

                renderEverything();

                showToast("Item deleted");

                return;
            }


            // EDIT
            if (action === "edit") {

                editItem(item);

                return;
            }

        });

    });
}


// ==========================================
// EDIT ITEM
// ==========================================

function editItem(item) {

    const newName =
        prompt("Clothing name:", item.name);

    if (newName === null) return;

    const newColor =
        prompt("Colour:", item.color);

    if (newColor === null) return;

    const newBrand =
        prompt("Brand:", item.brand);

    if (newBrand === null) return;


    item.name = newName.trim() || item.name;
    item.color = newColor.trim() || item.color;
    item.brand = newBrand.trim() || "No brand";


    saveWardrobe();

    renderEverything();

    showToast("Clothing updated ✨");
}


// ==========================================
// WARDROBE FILTERS
// ==========================================

$$(".category-tab").forEach(button => {

    button.addEventListener("click", () => {

        currentCategory =
            button.dataset.category || "all";

        $$(".category-tab").forEach(tab => {
            tab.classList.remove("active");
        });

        button.classList.add("active");

        renderWardrobe();
    });

});


// ==========================================
// RENDER WARDROBE
// ==========================================

function renderWardrobe() {

    const grid = $("#wardrobeGrid");

    if (!grid) return;


    let items = wardrobe;

    if (currentCategory !== "all") {

        items = wardrobe.filter(
            item => item.category === currentCategory
        );

    }


    if (items.length === 0) {

        grid.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">👗</div>

                <h3>Your wardrobe is empty here</h3>

                <p>Add clothing items to build your wardrobe.</p>

                <button
                    class="primary-btn"
                    id="emptyAddBtn"
                >
                    Add Clothing
                </button>

            </div>
        `;

        $("#emptyAddBtn")?.addEventListener(
            "click",
            () => openUploadFrame("shirt")
        );

        return;
    }


    grid.innerHTML =
        items.map(createItemCard).join("");

    attachCardActions();
}


// ==========================================
// HOME RECENT ITEMS
// ==========================================

function renderHomeItems() {

    const container = $("#recentItems");

    if (!container) return;


    const recent =
        wardrobe.slice(0, 4);


    if (recent.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">✨</div>

                <h3>Start building your wardrobe</h3>

                <p>Your latest clothing items will appear here.</p>

                <button
                    class="primary-btn"
                    id="homeAddBtn"
                >
                    Add First Item
                </button>

            </div>
        `;

        $("#homeAddBtn")?.addEventListener(
            "click",
            () => openUploadFrame("shirt")
        );

        return;
    }


    container.innerHTML =
        recent.map(createItemCard).join("");

    attachCardActions();
}


// ==========================================
// FAVORITES
// ==========================================

function renderFavorites() {

    const container = $("#favoritesGrid");

    if (!container) return;


    const favorites =
        wardrobe.filter(item => item.favorite);


    if (favorites.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">♡</div>

                <h3>No favorites yet</h3>

                <p>
                    Tap the heart on your favourite clothing items.
                </p>

            </div>
        `;

        return;
    }


    container.innerHTML =
        favorites.map(createItemCard).join("");

    attachCardActions();
}


// ==========================================
// COUNTERS
// ==========================================

function updateCounters() {

    const total = wardrobe.length;

    const shirts =
        wardrobe.filter(
            item => item.category === "shirt"
        ).length;

    const pants =
        wardrobe.filter(
            item =>
                item.category === "pant" ||
                item.category === "pants"
        ).length;

    const favorites =
        wardrobe.filter(
            item => item.favorite
        ).length;


    const totalElement = $("#totalItems");
    const shirtElement = $("#shirtCount");
    const pantsElement = $("#pantsCount");
    const favoriteElement = $("#favoriteCount");


    if (totalElement)
        totalElement.textContent = total;

    if (shirtElement)
        shirtElement.textContent = shirts;

    if (pantsElement)
        pantsElement.textContent = pants;

    if (favoriteElement)
        favoriteElement.textContent = favorites;
}


// ==========================================
// NOTIFICATION
// ==========================================

$("#notificationBtn")?.addEventListener(
    "click",
    () => {
        showToast(
            wardrobe.length
                ? `You have ${wardrobe.length} items in your wardrobe`
                : "Your wardrobe is ready for your first item ✨"
        );
    }
);


// ==========================================
// EVERYTHING
// ==========================================

function renderEverything() {

    renderWardrobe();
    renderHomeItems();
    renderFavorites();
    updateCounters();
}


// ==========================================
// START APP
// ==========================================

renderEverything();

showFrame("homeFrame");
