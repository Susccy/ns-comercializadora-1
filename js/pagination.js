const PRODUCTS_PER_PAGE = 15

const productContainer = document.getElementById("product-container")
const productStore = [...productContainer.children]
const paginationList = document.getElementById("pagination-list")
const categoryList = document.getElementById("category-list")
const subcategoryList = document.getElementById("subcategory-list")
const brandList = document.getElementById("brand-list")

function paginate() {
  paginationList.innerHTML = ""

  const productsArray = Array.from(productContainer.children)

  if (!productsArray.length) {
    const noProductsPlaceholder = document.createElement("p")
    noProductsPlaceholder.appendChild(
      document.createTextNode("No se encontraron productos disponibles.")
    )
    paginationList.appendChild(noProductsPlaceholder)
    return
  }

  const pageAmount = Math.ceil(productsArray.length / PRODUCTS_PER_PAGE)

  let currentPage

  function openPage(pageNumber) {
    return function () {
      productContainer.innerHTML = ""
      currentPage = pageNumber
      const productsForCurrentPage = productsArray.slice(
        PRODUCTS_PER_PAGE * (currentPage - 1),
        PRODUCTS_PER_PAGE * (currentPage - 1) + PRODUCTS_PER_PAGE
      )
      for (const product of productsForCurrentPage)
        productContainer.appendChild(product)
      paginationList
        .querySelectorAll(":not(:last-child):not(:nth-last-child(2))")
        .forEach((el) => el.removeAttribute("class"))
      paginationList
        .querySelector(`:nth-child(${currentPage})`)
        .setAttribute("class", "current-page")
    }
  }

  for (let i = 1; i <= pageAmount; i++) {
    const pageButton = document.createElement("span")
    const pageNumber = document.createTextNode(i.toString())
    pageButton.appendChild(pageNumber)
    pageButton.addEventListener("click", openPage(i))
    paginationList.appendChild(pageButton)
  }

  const nextPageButton = document.createElement("span")
  const lastPageButton = document.createElement("span")

  nextPageButton.appendChild(document.createTextNode("››"))
  nextPageButton.setAttribute("class", "icon")
  nextPageButton.addEventListener("click", function () {
    currentPage < pageAmount && openPage(currentPage + 1)()
  })

  lastPageButton.appendChild(document.createTextNode("Último »"))
  lastPageButton.setAttribute("class", "last")
  lastPageButton.addEventListener("click", openPage(pageAmount))

  paginationList.appendChild(nextPageButton)
  paginationList.appendChild(lastPageButton)

  openPage(1)()
}

const categoryNames = new Set()
const subcategoryNames = new Set()
const brandNames = new Set()
const activeFilters = {
  categories: [],
  subcategories: [],
  brands: [],
}

for (const {
  dataset: { categories, subcategories, brands },
} of productStore) {
  categories
    ?.split(/ /)
    .filter((cn) => cn)
    .map(categoryNames.add, categoryNames)
  subcategories
    ?.split(/ /)
    .filter((sn) => sn)
    .map(subcategoryNames.add, subcategoryNames)
  brands
    ?.split(/ /)
    .filter((bn) => bn)
    .map(brandNames.add, brandNames)
}

function filter({ target }) {
  const [filterType, filterValue] = target.name.split(/-/)

  target.checked
    ? activeFilters[filterType].push(filterValue)
    : activeFilters[filterType].splice(
        activeFilters[filterType].indexOf(filterValue),
        1
      )

  productContainer.innerHTML = ""

  if (
    !activeFilters.categories.length &&
    !activeFilters.subcategories.length &&
    !activeFilters.brands.length
  )
    for (const product of productStore) productContainer.appendChild(product)
  else {
    const matchingProducts = productStore.filter(
      ({ dataset }) =>
        Object.keys(dataset).some((dataName) =>
          ["categories", "subcategories", "brands"].includes(dataName)
        ) &&
        (typeof dataset.categories === "undefined" ||
          dataset.categories
            .split(/ /)
            .some(
              (category) =>
                !activeFilters.categories.length ||
                activeFilters.categories.includes(category)
            )) &&
        (typeof dataset.subcategories === "undefined" ||
          dataset.subcategories
            .split(/ /)
            .some(
              (subcategory) =>
                !activeFilters.subcategories.length ||
                activeFilters.subcategories.includes(subcategory)
            )) &&
        (typeof dataset.brands === "undefined" ||
          dataset.brands
            .split(/ /)
            .some(
              (brand) =>
                !activeFilters.brands.length ||
                activeFilters.brands.includes(brand)
            ))
    )
    for (const matchingProduct of matchingProducts) {
      productContainer.appendChild(matchingProduct)
    }
  }
  paginate()
}

function createFilterCheckbox(type, name, checked = false) {
  const listItem = document.createElement("li")
  listItem.dataset[type] = name
  const input = document.createElement("input")
  input.setAttribute("type", "checkbox")
  input.setAttribute("name", `${type}-${name}`)
  input.setAttribute("id", input.name)
  input.addEventListener("change", filter)
  checked && input.click()
  const label = document.createElement("label")
  label.setAttribute("for", input.name)
  const span = document.createElement("span")
  span.appendChild(document.createTextNode(name))
  const small = document.createElement("small")
  small.appendChild(
    document.createTextNode(
      `(${
        productStore.filter(({ dataset }) =>
          dataset[type]?.split(/ /).includes(name)
        ).length
      })`
    )
  )
  label.appendChild(span)
  label.appendChild(small)
  listItem.appendChild(input)
  listItem.appendChild(label)
  return listItem
}

const preselectFilter = new URLSearchParams(window.location.search)
  .get("filter")
  ?.toLowerCase()
let preselectFilterIsValid = false

for (const categoryName of [...categoryNames].sort()) {
  preselectFilterIsValid =
    preselectFilterIsValid || preselectFilter === categoryName.toLowerCase()
  categoryList.appendChild(
    createFilterCheckbox(
      "categories",
      categoryName,
      preselectFilter === categoryName.toLowerCase()
    )
  )
}

for (const subcategoryName of [...subcategoryNames].sort()) {
  subcategoryList.appendChild(
    createFilterCheckbox("subcategories", subcategoryName)
  )
}

for (const brandName of [...brandNames].sort()) {
  brandList.appendChild(createFilterCheckbox("brands", brandName))
}

preselectFilterIsValid || paginate()
