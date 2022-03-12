import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  subElements = {};
  chartHeight = 50;
  data = []
  
  constructor({
    label = '',
    link = '',
    url = '',
    formatHeading = data => data,
    range = {
      from: new Date(),
      to: new Date(),
    },
  } = {}) {
    this.range = range;
    this.label = label;
    this.link = link;
    this.formatHeading = formatHeading;
    this.url = new URL(url, BACKEND_URL);

    this.render();
    this.update(this.range.from, this.range.to);
  }

  get template() {
    return `
      <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">
          Total ${this.label}
          ${this.getLink()}
        </div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header"></div>
          <div data-element="body" class="column-chart__chart">
            ${this.getColumnBody()}
          </div>
        </div>
      </div>
    `;
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }

    this.subElements = this.getSubElements();
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

  getHeaderValue(data) {
    return this.formatHeading(Object.values(data).reduce((accum, item) => (accum + item), 0));
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data
      .map(item => {
        const percent = (item / maxValue * 100).toFixed(0);

        return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
      })
      .join('');
  }

  getLink() {
    return this.link ? `<a class="column-chart__link" href="${this.link}">View all</a>` : '';
  }

  async update(startDate, endDate) {
    this.element.classList.add('column-chart_loading');
    const newData = [];
    const data = await fetchJson(this.url);

    for (const date in data) {
      const formatDate = new Date(date);
      if (formatDate >= startDate && formatDate <= endDate) {
        newData.push(data[date]);
      }
    }
    this.data = newData;

    if (this.data.length) {
      this.element.classList.remove('column-chart_loading');
    }
    
    this.subElements.body.innerHTML = this.getColumnBody(newData);
    this.subElements.header.textContent = this.getHeaderValue(data);
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
}