const state = {
  data: null
};

const qs = (selector, root = document) => root.querySelector(selector);

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function renderHighlights(items) {
  const root = qs("#highlights");
  root.innerHTML = "";
  items.forEach((item) => {
    const card = createElement("article", "highlight");
    card.append(createElement("b", "", item.title));
    if (item.titleZh) card.append(createElement("b", "zh-title", item.titleZh));
    card.append(createElement("p", "", item.text));
    if (item.textZh) card.append(createElement("p", "zh", item.textZh));
    root.append(card);
  });
}

function renderPackages(packages) {
  const root = qs("#package-list");
  const select = qs("#package-select");
  root.innerHTML = "";
  select.innerHTML = '<option value="">Select package / 选择配套</option>';

  packages.forEach((pkg) => {
    const card = createElement("article", "package-card");
    card.dataset.accent = pkg.accent || "soft";
    card.append(createElement("h3", "", pkg.name));
    if (pkg.nameZh) card.append(createElement("p", "package-zh", pkg.nameZh));

    const priceRow = createElement("div", "price-row");
    priceRow.append(createElement("strong", "", pkg.price));
    priceRow.append(createElement("span", "", pkg.pax));
    card.append(priceRow);

    card.append(createElement("p", "", pkg.rate));
    card.append(createElement("p", "", pkg.summary));
    if (pkg.summaryZh) card.append(createElement("p", "zh", pkg.summaryZh));

    const list = createElement("ul");
    pkg.includes.forEach((item) => list.append(createElement("li", "", item)));
    card.append(list);
    root.append(card);

    const option = document.createElement("option");
    option.value = pkg.name;
    option.textContent = `${pkg.name}${pkg.nameZh ? " / " + pkg.nameZh : ""} - ${pkg.price}`;
    select.append(option);
  });
}

function renderMenu(sections) {
  const root = qs("#menu-sections");
  root.innerHTML = "";

  sections.forEach((section, index) => {
    const details = document.createElement("details");
    if (index < 2) details.open = true;

    const summary = document.createElement("summary");
    const titleWrap = createElement("strong", "summary-title");
    titleWrap.append(document.createTextNode(section.title));
    if (section.titleZh) titleWrap.append(createElement("small", "", section.titleZh));
    summary.append(titleWrap);
    summary.append(createElement("span", "", section.note));
    details.append(summary);

    const list = createElement("ul", "menu-items selectable-menu");
    section.items.forEach((item, itemIndex) => {
      const listItem = document.createElement("li");
      const label = createElement("label", "menu-choice");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "menuChoice";
      checkbox.value = `${section.title}: ${item}`;
      checkbox.id = `menu-${index}-${itemIndex}`;
      label.append(checkbox);
      label.append(createElement("span", "", item));
      listItem.append(label);
      list.append(listItem);
    });
    details.append(list);
    root.append(details);
  });
}

function renderGallery(items) {
  const root = qs("#gallery-grid");
  root.innerHTML = "";

  items.forEach((item, index) => {
    const figure = document.createElement("figure");
    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = index === 0 ? "eager" : "lazy";
    image.decoding = "async";
    figure.append(image);
    root.append(figure);
  });
}

function renderTerms(terms) {
  const root = qs("#terms-list");
  root.innerHTML = "";
  terms.forEach((term) => root.append(createElement("li", "", term)));
}

function buildWhatsAppUrl(message) {
  const number = state.data.contact.mainWhatsApp;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function getSelectedMenuChoices() {
  return [...document.querySelectorAll('input[name="menuChoice"]:checked')].map((input) => input.value);
}

function wireWhatsApp() {
  const float = qs("#whatsapp-float");
  const defaultMessage = `Hi La Taste x 3 Yue, I would like to enquire about the buffet event menu. 你好，我想询问自助餐活动配套。`;
  float.href = buildWhatsAppUrl(defaultMessage);

  qs("#enquiry-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const selectedMenu = getSelectedMenuChoices();
    const message = [
      "Hi La Taste x 3 Yue, I would like to enquire about buffet catering.",
      "你好，我想询问自助餐活动配套。",
      "",
      `Name 姓名: ${form.get("name")}`,
      `Event date 活动日期: ${form.get("date")}`,
      `Pax 人数: ${form.get("pax")}`,
      `Package 配套: ${form.get("package")}`,
      "",
      "Selected menu choices / 已选择菜单:",
      selectedMenu.length ? selectedMenu.map((item) => `- ${item}`).join("\n") : "- Not selected yet / 暂未选择",
      "",
      `Message 备注: ${form.get("message") || "-"}`
    ].join("\n");
    window.open(buildWhatsAppUrl(message), "_blank", "noopener");
  });
}

function render(data) {
  state.data = data;
  document.title = `${data.brand.name} ${data.brand.title}`;
  qs("#hero-image").src = data.brand.heroImage;
  qs("#hero-tagline").textContent = data.brand.tagline;
  qs("#hero-tagline-zh").textContent = data.brand.taglineZh || "";
  qs("#footer-contact").textContent = `${data.contact.mainBranch}: ${data.contact.mainPhone} · ${data.contact.secondBranch}: ${data.contact.secondPhone}`;

  renderHighlights(data.highlights);
  renderPackages(data.packages);
  renderMenu(data.menuSections);
  renderGallery(data.gallery);
  renderTerms(data.terms);
  wireWhatsApp();
}

fetch("data/menu-data.json?v=menu-checkbox-20260703")
  .then((response) => {
    if (!response.ok) throw new Error("Menu data could not be loaded.");
    return response.json();
  })
  .then(render)
  .catch((error) => {
    console.error(error);
    qs("main").insertAdjacentHTML(
      "afterbegin",
      '<section class="band"><h1>Menu data could not be loaded.</h1><p>Please open this site through a static server or upload it to Netlify / GitHub Pages.</p></section>'
    );
  });
