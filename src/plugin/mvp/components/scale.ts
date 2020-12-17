import Component from "./component";

import {
  createElement
} from '../../utils/view.functions';

class Scale extends Component {  
  element: HTMLDivElement;
  marks: HTMLSpanElement[] = [];
  length = 5;
  marksInScale = false;

  constructor(type: Orientation, mode: Mode) {
    super(type, mode);
    this.element = this.create();
  }

  create(): HTMLDivElement {
    return createElement('div', 'scale') as HTMLDivElement;
  }

  createMarks(): this {
    if (this.marks.length === 0) {
      const spanArray: HTMLSpanElement[] = [];
      for(let i = 0; i <=  this.length; i++) {
        const span: HTMLSpanElement = createElement('span', 'scale__mark') as HTMLSpanElement;
        const content: HTMLElement = createElement('em', 'mark-content');      
        span.insertAdjacentElement('afterbegin', content);            
        spanArray.push(span);
      }
      this.marks = spanArray;
    }    
    return this;
  }

  initMarks(options: ViewOptions): this {
    const interval = +options.maximumValue - +options.minimumValue;
    const step = Math.floor(interval / this.length);

    this.marks.forEach((mark, i) => {
      const content = mark.querySelector('.mark-content') as HTMLElement;
      if (i ===  this.length) {
        content.textContent = options.maximumValue;
        mark.style[this.styleKeys.props] = `${0}px`;
      } else {
        content.textContent = (step * i + +options.minimumValue).toString();
        mark.style[this.styleKeys.props] = `${this.element[this.styleKeys.offset] / (this.length+1)}px`;
      }
      this.setContentPosition(content, content.textContent);
    });

    return this;
  }

  setContentPosition(content: HTMLElement, textContent: string): void {
    if (this.type === 'Horizontal')
      content.style[this.styleKeys.position] = `-${textContent.length * 2.5}px`;
  }

  addMarksToScale(): this {
    if (!this.marksInScale) 
      this.marks.forEach(mark => this.element.insertAdjacentElement('beforeend', mark));
      this.marksInScale = true;
    return this;
  }

  destroy(): this {
    const $scale = $(this.element).parent().find(this.element);
    $scale.length !== 0
      ? $scale.remove()
      : false;
    return this;
  }
}

export default Scale;