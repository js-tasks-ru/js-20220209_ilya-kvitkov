export default class ColumnChart {
  constructor({data = [], label, value, formatHeading, link}) {
    this.data = data;
    this.label = label;
    this.value = value;
    this.formatHeading = formatHeading;
    this.link = link;
    this.render();
  }

  update(arr) {
    this.data = arr;
    this.render();
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.className = `column-chart` + `${!this.data.length ? " column-chart_loading" : ''}`;
    wrapper.style = "--chart-height: 50";

    const title = document.createElement('div');
    title.className = "column-chart__title";
    title.innerHTML = `
        Total ${this.label}
        ${this.link ? `<a href="/${this.link}" class="column-chart__link">View all</a>` : ''}
    `;
    wrapper.append(title);

    const container = document.createElement('div');
    container.className = "column-chart__container";
    wrapper.append(container);

    const containerHeader = document.createElement('div');
    containerHeader.dataset.element = "header";
    containerHeader.className = "column-chart__header";
    container.append(containerHeader);

    const containerHeaderText = document.createTextNode(this.formatHeading ? this.formatHeading(this.value) : this.value);
    containerHeader.append(containerHeaderText);

    const containerBody = document.createElement('div');
    containerBody.dataset.element = "body";
    containerBody.className = "column-chart__chart";
    container.append(containerBody);
  
    if (this.data.length) {
      this.data.forEach((item) => {
        const scale = document.createElement('div');
        scale.style = `--value: ${item}`;
        containerBody.append(scale);
      });
    }

    this.element = wrapper;
  }
}