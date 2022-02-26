export default class NotificationMessage {
    static isVisible = false;
    static timer = false;
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
    deleteNotification() {
      document.querySelector('.notification').remove();
      NotificationMessage.isVisible = false;
    }
    

    notificationСуcle() {
      document.body.append(this.element);
      NotificationMessage.isVisible = true;
      NotificationMessage.timer = setTimeout(() => {
        this.deleteNotification();
      }, this.duration);
    }


    show() {
      if (!NotificationMessage.isVisible) {
        this.notificationСуcle();
        return;
      }
      clearTimeout(NotificationMessage.timer);
      this.deleteNotification();
      this.notificationСуcle();
    }
    remove () {
      if (this.element) {
        this.element.remove();
      }
    }

    destroy() {
      this.remove();
      this.element = null;
    }

    render() {
      const element = document.createElement('div');

      element.innerHTML = this.template;

      this.element = element.firstElementChild;
    }
}
