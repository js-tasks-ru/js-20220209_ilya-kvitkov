import fetchJson from './utils/fetch-json.js';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  element;
  subElements = {};
  order = "asc";
  data = [];
  loading = false;
  constructor(headersConfig,
    {
      start = 1,
      step = 20,
      end = start + step,
      url = '',
      isSortLocally = false,
      sorted = {
        id: headersConfig.find(item => item.sortable).id,
        order: "asc",
      }
    } = {}
  ) {
    this.headersConfig = headersConfig;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
    this.url = new URL(url, BACKEND_URL);
    this.start = start;
    this.end = end;
    this.step = step;

    this.render();
    this.sort(this.sorted);
  }

  sortOnClient (field, order) {
    const arr = [...this.data];
    const column = this.headersConfig.find(({ id }) => id === field);  
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };

    const direction = directions[order];

    const sortData = arr.sort((a, b) => {
      switch (sortType) {
      case "number":
        return direction * (a[field] - b[field]);
      case "string":
        return direction * a[field].localeCompare(b[field], ["ru", "en"]);
      default:
        return direction * (a[field] - b[field]);
      }
    });
    this.renderRows(sortData);
  }

  async sortOnServer (id, order) {
    const start = 1;
    const end = this.sorted.end; // мне кажется это правильнее
    const data = await this.fetchData(id, order, start, end);
  
    this.renderRows(data);
  }

  async fetchData (id, order, start = this.start, end = this.end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    this.element.classList.add('sortable-table__loading');
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table__loading');

    return data;
  }

  renderRows(data) {
    if (data.length) {
      this.subElements.body.innerHTML = this.getTableRows(data);
    }
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

  async sort({id, order}) {
    if (!this.isSortLocally) {
      await this.sortOnServer(id, order);
    } else {
      this.sortOnClient(id, order);
    }
    this.sorted = {id: id, order: order};
    const allColumns = this.element.querySelectorAll(".sortable-table__cell[data-id]");
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);

    allColumns.forEach(col => {
      col.dataset.order = "";
    });
  
    currentColumn.dataset.order = order;

    this.order = this.order === "asc" ? "desc" : "asc";
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
    this.removeEventListener('scroll', onWindowScroll);
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

  onWindowScroll = async () => {
    if ((document.documentElement.scrollTop + document.documentElement.clientHeight === document.documentElement.offsetHeight) && !this.loading) {
      this.start = this.end;
      this.end = this.start + this.step;
      this.loading = true;
      const data = await this.fetchData(this.sorted.id, this.sorted.order, this.start, this.end);
      this.update(data);
      this.loading = false;
    }
  }

  update(data) {
    const rows = document.createElement('div');
    this.data = [...this.data, ...data];
    rows.innerHTML = this.getTableRows(data);

    this.subElements.body.append(...rows.childNodes);
  }

  initEventListener() {
    window.addEventListener('scroll', this.onWindowScroll);
  }
  
  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.setHandleSort();
    this.initEventListener();
  }
}
