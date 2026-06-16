window.catalogProductRender = {
  createProductCard: typeof createProductCard === "function" ? createProductCard : null,
  escapeHTML: typeof escapeHTML === "function" ? escapeHTML : null
};
