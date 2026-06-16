(() => {
  const grid = document.querySelector("[data-products-grid]");
  const page = document.querySelector("[data-category-id]");

  if (!grid || !page) return;

  const categoryId = page.dataset.categoryId;

  fetch("/assets/data/products.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Products data failed to load");
      }

      return response.json();
    })
    .then((products) => {
      const filteredProducts = products
        .filter((product) => product.categoryId === categoryId)
        .sort((a, b) => (a.priority || 999) - (b.priority || 999));

      if (!filteredProducts.length) {
        grid.innerHTML = `
          <p class="empty-products-message">
            מוצרים נוספים יעלו בקרוב. ניתן ליצור קשר לבדיקת זמינות.
          </p>
        `;
        return;
      }

      grid.innerHTML = filteredProducts.map(createProductCard).join("");
    })
    .catch(() => {
      grid.innerHTML = `
        <p class="empty-products-message">
          לא ניתן היה לטעון את המוצרים כרגע. ניתן ליצור קשר ישירות עם החנות.
        </p>
      `;
    });
})();

const STORE_WHATSAPP_PHONE = "972502126707";

const getProductWhatsappUrl = (product) => {
  const message =
    product.whatsappText ||
    `שלום, אני רוצה לבדוק זמינות לגבי ${product.title}`;

  return `https://wa.me/${STORE_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createProductCard(product) {
  const title = escapeHTML(product.title);
  const brand = escapeHTML(product.brand);
  const shortDescription = escapeHTML(product.shortDescription);
  const image = escapeHTML(product.image);
  const alt = escapeHTML(product.alt);
  const availabilityText = escapeHTML(product.availabilityText);
  const badges = Array.isArray(product.badges) ? product.badges : [];
  const whatsappUrl = escapeHTML(getProductWhatsappUrl(product));
  const ariaLabel = escapeHTML(`בדיקת זמינות בוואטסאפ עבור ${product.title}`);

  return `
    <a class="product-card" href="${whatsappUrl}" target="_blank" rel="noopener" aria-label="${ariaLabel}">
      <div class="product-card__media">
        <img src="${image}" alt="${alt}" loading="lazy" decoding="async">
      </div>

      <div class="product-card__body">
        ${brand ? `<p class="product-card__brand">${brand}</p>` : ""}
        <h3>${title}</h3>
        <p>${shortDescription}</p>

        ${
          badges.length
            ? `<div class="product-card__badges">
                ${badges.map((badge) => `<span>${escapeHTML(badge)}</span>`).join("")}
              </div>`
            : ""
        }

        <p class="product-card__availability">${availabilityText}</p>

        <span class="product-card__cta">
          בדקו זמינות בוואטסאפ
        </span>
      </div>
    </a>
  `;
}
