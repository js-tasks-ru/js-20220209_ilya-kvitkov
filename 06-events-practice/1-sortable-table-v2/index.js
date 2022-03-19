export default class SortableTable {
  element;
  subElements = {};
  order = "asc";
  constructor(headersConfig, {
    data = [],
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: "asc",
    }
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;

    this.render();
    this.sort(this.sorted);
  }

  get template() {
    return `
      <div class="sortable-table">
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getTableHeaderContent()}
      </div>
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(this.data)}
      </div>
    </div>
    `;
  }

  getTableHeaderContent() {
    return this.headersConfig
      .map(item => {
        return `
          <div class="sortable-table__cell" data-id=${item.id} data-sortable=${item.sortable}>
            <span data-id=${item.id} data-sortable=${item.sortable}>${item.title}</span>
            <span data-element="arrow" class="sortable-table__sort-arrow">
              <span class="sort-arrow"></span>
            </span>
          </div>`;
      })
      .join('');
  }

  getTableRows(data) {
    return data.map((item) => {
      return `
       <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>
      `;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headersConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });
    return cells.map(({id, template}) => {
      return template
        ? template(item[id]) : `<div class="sortable-table__cell">${item[id]}</div>`;
    }).join("");
  }

  sort({id, order}) {
    const sortedData = this.sortData(id, order);
    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    allColumns.forEach(col => {
      col.dataset.order = "";
    });
  
    currentColumn.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
    this.order = this.order === "asc" ? "desc" : "asc";
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(({ id }) => id === field);  
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case "number":
        return direction * (a[field] - b[field]);
      case "string":
        return direction * a[field].localeCompare(b[field], ["ru", "en"]);
      default:
        return direction * (a[field] - b[field]);
      }
    });
  }
  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }
  
    return result;
  }

  setHandleSort() {
    const columns = this.element.querySelectorAll(".sortable-table__cell[data-id] > span:first-child");
    columns.forEach((col) => {
      col.addEventListener("click", (event) => event.target.dataset.sortable === "true" ? this.sort({id: event.target.dataset.id, order: this.order}) : null);
    });
  }
  
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.setHandleSort();
  }
}
