export default class NotificationMessage {
    static isVisible; timer; activeNotification;
    constructor(text = "", {duration = 0, type = ""} = {}) {
      this.text = text;
      this.duration = duration;
      this.type = type;

      this.render();
    }

    get template() {
      return `
        <div class="notification ${this.type}" style="--value:${this.duration / 1000}s">
            <div class="timer"></div>
            <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">
                     ${this.text}
                </div>
            </div>
        </div>
    `;
    }

    show(parent = document.body) {
      if (NotificationMessage.activeNotification) {
        NotificationMessage.activeNotification.remove();
      }
      parent.append(this.element);
      NotificationMessage.timer = setTimeout(() => {
        this.remove();
      }, this.duration);
      NotificationMessage.activeNotification = this;
    }

    remove () {
      clearTimeout(NotificationMessage.timer);
      if (this.element) {
        this.element.remove();
      }
    }

    destroy() {
      this.remove();
      this.element = null;
      NotificationMessage.activeNotification = null;
    }

    render() {
      const element = document.createElement('div');

      element.innerHTML = this.template;

      this.element = element.firstElementChild;
    }
}
