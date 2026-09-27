/* =========================================================
   STYLE SYNTH AI
   MAIN APPLICATION LOGIC
   ========================================================= */


/* =========================================================
   DATA
   ========================================================= */

let wardrobe = JSON.parse(
  localStorage.getItem("styleSynthWardrobe") || "[]"
);

let selectedUploadCategory = "shirt";
let selectedOccasion = "College";
let selectedImage = "";

let currentCategory = "all";


/* =========================================================
   DOM HELPERS
   ========================================================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) => document.querySelectorAll(selector);


/* =========================================================
   SAVE DATA
   ========================================================= */

function saveWardrobe() {
  localStorage.setItem(
    "styleSynthWardrobe",
    JSON.stringify(wardrobe)
  );
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

  const toast = $("#toast");

  if (!toast) return;

  toast.querySelector("p").textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* =========================================================
   FRAME NAVIGATION
   ========================================================= */

function showFrame(frameId) {

  $$(".frame").forEach((frame) => {
    frame.classList.remove("active-frame");
  });

  const frame = document.getElementById(frameId);

  if (frame) {
    frame.classList.add("active-frame");
  }

  $$(".nav-item").forEach((item) => {

    item.classList.remove("active");

    if (item.dataset.frame === frameId) {
      item.classList.add("active");
    }

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   NAVIGATION BUTTONS
   ========================================================= */

$$("[data-frame]").forEach((button) => {

  button.addEventListener("click", () => {

    const frame = button.dataset.frame;

    showFrame(frame);

  });

});


/* =========================================================
   OPEN UPLOAD FRAME
   ========================================================= */

function openUploadFrame() {

  showFrame("uploadFrame");

  resetUploadForm();

}


/* =========================================================
   ADD BUTTONS
   ========================================================= */

$("#heroAddBtn")?.addEventListener(
  "click",
  openUploadFrame
);

$("#emptyAddBtn")?.addEventListener(
  "click",
  openUploadFrame
);

$("#wardrobeAddBtn")?.addEventListener(
  "click",
  openUploadFrame
);

$("#wardrobeEmptyBtn")?.addEventListener(
  "click",
  openUploadFrame
);


/* =========================================================
   IMAGE UPLOAD
   ========================================================= */

const imageInput = $("#clothingImage");

$("#chooseImageBtn")?.addEventListener(
  "click",
  () => {

    imageInput?.click();

  }
);


imageInput?.addEventListener(
  "change",
  (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {

      selectedImage = e.target.result;

      $("#uploadPreview").innerHTML = `
        <img src="${selectedImage}" alt="Uploaded clothing">
      `;

    };

    reader.readAsDataURL(file);

  }
);


/* =========================================================
   CATEGORY SELECTION
   ========================================================= */

$$(".select-category").forEach((button) => {

  button.addEventListener("click", () => {

    $$(".select-category").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    selectedUploadCategory =
      button.dataset.uploadCategory;

  });

});


/* =========================================================
   RESET UPLOAD FORM
   ========================================================= */

function resetUploadForm() {

  selectedImage = "";

  selectedUploadCategory = "shirt";

  $("#itemName").value = "";

  $("#itemColor").value = "";

  $("#itemBrand").value = "";

  $("#itemOccasion").value = "Casual";

  if (imageInput) {
    imageInput.value = "";
  }

  $$(".select-category").forEach((button) => {

    button.classList.remove("active");

    if (
      button.dataset.uploadCategory === "shirt"
    ) {
      button.classList.add("active");
    }

  });

  $("#uploadPreview").innerHTML = `

    <div class="upload-placeholder">

      <div class="upload-icon">＋</div>

      <h3>Upload clothing photo</h3>

      <p>
        Add a clear photo of your shirt,
        pants or accessory.
      </p>

      <button class="secondary-btn" id="chooseImageBtn">
        Choose photo
      </button>

    </div>

  `;

  $("#chooseImageBtn")?.addEventListener(
    "click",
    () => imageInput?.click()
  );

}


/* =========================================================
   SAVE CLOTHING ITEM
   ========================================================= */

$("#saveItemBtn")?.addEventListener(
  "click",
  () => {

    const name =
      $("#itemName").value.trim();

    const color =
      $("#itemColor").value.trim();

    const brand =
      $("#itemBrand").value.trim();

    const occasion =
      $("#itemOccasion").value;

    if (!name) {

      showToast(
        "Please enter an item name."
      );

      return;
    }

    const item = {

      id: Date.now(),

      name,

      category:
        selectedUploadCategory,

      color:
        color || "Not specified",

      brand:
        brand || "Not specified",

      occasion,

      image:
        selectedImage,

      favorite:
        false,

      createdAt:
        new Date().toISOString()

    };

    wardrobe.unshift(item);

    saveWardrobe();

    showToast(
      "Added to your wardrobe ✦"
    );

    renderEverything();

    setTimeout(() => {

      showFrame("wardrobeFrame");

    }, 400);

  }
);


/* =========================================================
   CATEGORY FILTER
   ========================================================= */

$$(".category-tab").forEach((button) => {

  button.addEventListener("click", () => {

    $$(".category-tab").forEach((tab) => {
      tab.classList.remove("active");
    });

    button.classList.add("active");

    currentCategory =
      button.dataset.category;

    renderWardrobe();

  });

});


/* =========================================================
   CATEGORY LABEL
   ========================================================= */

function categoryLabel(category) {

  if (category === "shirt") {
    return "SHIRT";
  }

  if (category === "pants") {
    return "PANTS";
  }

  if (category === "accessory") {
    return "ACCESSORY";
  }

  return "ITEM";

}


/* =========================================================
   ITEM ICON
   ========================================================= */

function itemIcon(category) {

  if (category === "shirt") {
    return "👕";
  }

  if (category === "pants") {
    return "👖";
  }

  if (category === "accessory") {
    return "👜";
  }

  return "✦";

}


/* =========================================================
   CREATE ITEM CARD
   ========================================================= */

function createItemCard(item) {

  const card =
    document.createElement("div");

  card.className =
    "clothing-card";

  const imageHTML = item.image

    ? `
      <img
        class="clothing-image"
        src="${item.image}"
        alt="${escapeHTML(item.name)}"
      >
    `

    : `
      <div class="clothing-placeholder">
        ${itemIcon(item.category)}
      </div>
    `;

  card.innerHTML = `

    ${imageHTML}

    <div class="clothing-info">

      <h3>
        ${escapeHTML(item.name)}
      </h3>

      <p>
        ${escapeHTML(item.color)}
        •
        ${escapeHTML(item.brand)}
      </p>

      <p>
        ${categoryLabel(item.category)}
        •
        ${escapeHTML(item.occasion)}
      </p>

    </div>

    <div class="clothing-actions">

      <button
        class="card-action favorite-action
        ${item.favorite ? "favorite-active" : ""}"
        data-id="${item.id}"
      >
        ${item.favorite ? "♥ Saved" : "♡ Favorite"}
      </button>

      <button
        class="card-action edit-action"
        data-id="${item.id}"
      >
        Edit
      </button>

      <button
        class="card-action delete-action"
        data-id="${item.id}"
      >
        Delete
      </button>

    </div>

  `;

  return card;

}


/* =========================================================
   RENDER WARDROBE
   ========================================================= */

function renderWardrobe() {

  const grid =
    $("#wardrobeGrid");

  if (!grid) return;

  grid.innerHTML = "";

  let items = wardrobe;

  if (currentCategory !== "all") {

    items =
      wardrobe.filter(
        (item) =>
          item.category === currentCategory
      );

  }

  if (items.length === 0) {

    grid.innerHTML = `

      <div class="empty-card">

        <div class="empty-icon">
          ${currentCategory === "all" ? "◈" : itemIcon(currentCategory)}
        </div>

        <h3>
          No items here yet
        </h3>

        <p>
          Add clothing to build your digital wardrobe.
        </p>

        <button
          class="primary-btn small"
          id="dynamicAddBtn"
        >
          Add clothing
        </button>

      </div>

    `;

    $("#dynamicAddBtn")?.addEventListener(
      "click",
      openUploadFrame
    );

    return;

  }

  items.forEach((item) => {

    grid.appendChild(
      createItemCard(item)
    );

  });

  attachCardActions();

}


/* =========================================================
   HOME ITEMS
   ========================================================= */

function renderHomeItems() {

  const container =
    $("#homeItems");

  if (!container) return;

  container.innerHTML = "";

  if (wardrobe.length === 0) {

    container.innerHTML = `

      <div class="empty-card">

        <div class="empty-icon">
          ＋
        </div>

        <h3>
          Your wardrobe is waiting
        </h3>

        <p>
          Add your first clothing item to begin.
        </p>

        <button
          class="primary-btn small"
          id="emptyAddBtnDynamic"
        >
          Add clothing
        </button>

      </div>

    `;

    $("#emptyAddBtnDynamic")?.addEventListener(
      "click",
      openUploadFrame
    );

    return;

  }

  wardrobe
    .slice(0, 4)
    .forEach((item) => {

      container.appendChild(
        createItemCard(item)
      );

    });

  attachCardActions();

}


/* =========================================================
   FAVORITES
   ========================================================= */

function renderFavorites() {

  const grid =
    $("#favoritesGrid");

  if (!grid) return;

  grid.innerHTML = "";

  const favorites =
    wardrobe.filter(
      (item) => item.favorite
    );

  if (favorites.length === 0) {

    grid.innerHTML = `

      <div class="empty-card">

        <div class="empty-icon">
          ♡
        </div>

        <h3>
          No favorites yet
        </h3>

        <p>
          Tap the heart on any wardrobe piece
          to save it here.
        </p>

      </div>

    `;

    return;

  }

  favorites.forEach((item) => {

    grid.appendChild(
      createItemCard(item)
    );

  });

  attachCardActions();

}


/* =========================================================
   CARD ACTIONS
   ========================================================= */

function attachCardActions() {

  $$(".favorite-action").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          const item =
            wardrobe.find(
              (item) => item.id === id
            );

          if (!item) return;

          item.favorite =
            !item.favorite;

          saveWardrobe();

          renderEverything();

          showToast(
            item.favorite
              ? "Added to favorites ♥"
              : "Removed from favorites"
          );

        }
      );

    }
  );


  $$(".delete-action").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          wardrobe =
            wardrobe.filter(
              (item) => item.id !== id
            );

          saveWardrobe();

          renderEverything();

          showToast(
            "Item removed"
          );

        }
      );

    }
  );


  $$(".edit-action").forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(button.dataset.id);

          editItem(id);

        }
      );

    }
  );

}


/* =========================================================
   EDIT ITEM
   ========================================================= */

function editItem(id) {

  const item =
    wardrobe.find(
      (item) => item.id === id
    );

  if (!item) return;

  const newName =
    prompt(
      "Item name:",
      item.name
    );

  if (newName === null) return;

  const newColor =
    prompt(
      "Color:",
      item.color
    );

  if (newColor === null) return;

  const newBrand =
    prompt(
      "Brand:",
      item.brand
    );

  if (newBrand === null) return;

  item.name =
    newName.trim() || item.name;

  item.color =
    newColor.trim() || item.color;

  item.brand =
    newBrand.trim() || item.brand;

  saveWardrobe();

  renderEverything();

  showToast(
    "Item updated ✦"
  );

}


/* =========================================================
   AI STYLIST OCCASION
   ========================================================= */

$$(".occasion-btn").forEach(
  (button) => {

    button.addEventListener(
      "click",
      () => {

        $$(".occasion-btn").forEach(
          (item) =>
            item.classList.remove("selected")
        );

        button.classList.add("selected");

        selectedOccasion =
          button.dataset.style;

      }
    );

  }
);


/* =========================================================
   GENERATE OUTFIT
   ========================================================= */

$("#generateOutfitBtn")?.addEventListener(
  "click",
  generateOutfit
);


function generateOutfit() {

  const shirts =
    wardrobe.filter(
      (item) =>
        item.category === "shirt"
    );

  const pants =
    wardrobe.filter(
      (item) =>
        item.category === "pants"
    );

  const accessories =
    wardrobe.filter(
      (item) =>
        item.category === "accessory"
    );


  if (shirts.length === 0 ||
      pants.length === 0) {

    showToast(
      "Add at least one shirt and one pair of pants."
    );

    showFrame("wardrobeFrame");

    return;

  }


  const shirt =
    chooseForOccasion(
      shirts,
      selectedOccasion
    );

  const pant =
    chooseForOccasion(
      pants,
      selectedOccasion
    );

  const accessory =
    accessories.length > 0
      ? chooseForOccasion(
          accessories,
          selectedOccasion
        )
      : null;


  renderOutfit(
    shirt,
    pant,
    accessory
  );

  showFrame("outfitFrame");

}


/* =========================================================
   CHOOSE ITEM FOR OCCASION
   ========================================================= */

function chooseForOccasion(
  items,
  occasion
) {

  const exact =
    items.filter(
      (item) =>
        item.occasion === occasion
    );

  if (exact.length > 0) {

    return exact[
      Math.floor(
        Math.random() *
        exact.length
      )
    ];

  }

  return items[
    Math.floor(
      Math.random() *
      items.length
    )
  ];

}


/* =========================================================
   RENDER OUTFIT
   ========================================================= */

function renderOutfit(
  shirt,
  pant,
  accessory
) {

  const result =
    $("#outfitResult");

  if (!result) return;


  const pieces = [
    {
      item: shirt,
      label: "TOP"
    },
    {
      item: pant,
      label: "BOTTOM"
    }
  ];

  if (accessory) {

    pieces.push({
      item: accessory,
      label: "ACCESSORY"
    });

  }


  result.innerHTML = `

    <div class="generated-outfit">

      <div class="generated-outfit-header">

        <span class="eyebrow">
          STYLE SYNTH RECOMMENDATION
        </span>

        <h2>
          ${escapeHTML(selectedOccasion)} Look
        </h2>

        <p>
          A look created from your own wardrobe.
        </p>

      </div>

      <div class="outfit-items">

        ${pieces.map((piece) => {

          const item =
            piece.item;

          const image =
            item.image

              ? `
                <img
                  src="${item.image}"
                  alt="${escapeHTML(item.name)}"
                >
              `

              : `
                <div class="piece-placeholder">
                  ${itemIcon(item.category)}
                </div>
              `;

          return `

            <div class="outfit-piece">

              ${image}

              <div class="piece-info">

                <span>
                  ${piece.label}
                </span>

                <h3>
                  ${escapeHTML(item.name)}
                </h3>

              </div>

            </div>

          `;

        }).join("")}

      </div>

    </div>

  `;

}


/* =========================================================
   UPDATE COUNTERS
   ========================================================= */

function updateCounters() {

  const shirts =
    wardrobe.filter(
      (item) =>
        item.category === "shirt"
    ).length;

  const pants =
    wardrobe.filter(
      (item) =>
        item.category === "pants"
    ).length;

  const accessories =
    wardrobe.filter(
      (item) =>
        item.category === "accessory"
    ).length;

  const favorites =
    wardrobe.filter(
      (item) =>
        item.favorite
    ).length;


  $("#shirtCount").textContent =
    shirts;

  $("#pantCount").textContent =
    pants;

  $("#accessoryCount").textContent =
    accessories;

  $("#favoriteCount").textContent =
    favorites;

  $("#profileItemCount").textContent =
    wardrobe.length;

  $("#profileFavoriteCount").textContent =
    favorites;

}


/* =========================================================
   RENDER EVERYTHING
   ========================================================= */

function renderEverything() {

  renderHomeItems();

  renderWardrobe();

  renderFavorites();

  updateCounters();

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)

    .replaceAll("&", "&amp;")

    .replaceAll("<", "&lt;")

    .replaceAll(">", "&gt;")

    .replaceAll('"', "&quot;")

    .replaceAll("'", "&#039;");

}


/* =========================================================
   NOTIFICATION
   ========================================================= */

$("#notificationBtn")?.addEventListener(
  "click",
  () => {

    showToast(
      "You're all caught up ✦"
    );

  }
);


/* =========================================================
   INITIALIZE APP
   ========================================================= */

renderEverything();

showFrame("homeFrame");
