class EventEmmiter {
  constructor(public events: Emmiter = {}) {}

  subscribe(eventName: string, observer: Observer): Unsubables {
    if (!this.events[eventName])
      this.events[eventName] = [];
    this.events[eventName].push(observer);

    return {
      unsubscribe: (): void => {
        this.events[eventName] = this.events[eventName].filter(ob => ob != observer);
      }
    };
  }

  dispatch(eventName: string, data: {[key: string]: any}): void {
    const observers: Observer[] = this.events[eventName];

    if (observers)
      observers.forEach(observer => observer.call(null, data))
  }
}

export default EventEmmiter;