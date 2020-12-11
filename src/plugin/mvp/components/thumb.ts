import Component from './component';

import {
  createElement
} from '../../utils/view.functions';
import Workspace from './workspace';
import Label from './label';

class Thumb extends Component {

  element: HTMLButtonElement;
  label: Label;
  value = 0; // px
  activeMousedown = false;

  mouseMoveHandler: (event: MouseEvent) => void = () => false;
  mouseUpHadler: () => void = () => {
    document.removeEventListener('mouseup', this.mouseUpHadler);
    document.removeEventListener('mousemove', this.mouseMoveHandler);

    this.cancelDragable();
  } 

  constructor(type: Orientation, mode: Mode, attr?: string) {
    super(type, mode);    
    this.element = this.create();
    this.label = new Label(type, mode); 
    this.setUniqueAttr(attr);
  }

  create(): HTMLButtonElement {
    return createElement('button', 'thumb') as HTMLButtonElement;
  }

  checkShowValue(isShowValue: boolean): this {
    if (isShowValue) {
      this
      .initLabel()
      .renderLabel();
     return this;
    }      
    this.label.destroy(); 
    return this;
  }

  initLabel(): this {
    this.label
      .setTextContent(this.element.value)
      .setOnElementPosition(this.value + this.correctValue());
    return this;
  }

  renderLabel(): this {
    this.element.insertAdjacentElement('beforebegin', this.label.element);
    return this;      
  }  
  
  getUniqueAttr(): string | null {
    const value = this.element.dataset.order
      ? this.element.dataset.order
      : null;
    return value;
  }

  getSize(): number {
    return this.element[this.styleKeys.offset];
  }

  setUniqueAttr(attr?: string): void {
    if (this.isMultiple())
      this.element.dataset.order = attr;
  }
  
  setOnElementDefaultValue(value: string): this {
    this.element.value = value;
    return this;
  }

  setOnElementDefaultPosition(defaultPosition: number): this {
    this.element.style[this.styleKeys.position] = `${defaultPosition - this.getSize() / 2}px`;
    this.value = defaultPosition - this.getSize() / 2;
    return this;
  }

  computeThumbIndex(): 0 | 1 {
    return this.element.dataset.order && this.element.dataset.order === 'second' ? 1 : 0; 
  }

  makeMouseDownHandler(mouseMoveHandler: HandleEvent, context: Workspace): (event: MouseEvent) => void {
    return (event: MouseEvent) => {
      this.activeMousedown = true;
      const index = this.computeThumbIndex();
      const shift = event[this.styleKeys.client] - this.getPropValueFromCoordinates(this.element) - this.getSize() / 2;
      this.mouseMoveHandler = mouseMoveHandler.bind(context, {
        index, 
        shift, 
        ownSpace: { 
          start: 0, 
          end: 0 
        }});
      
      document.addEventListener('mousemove', this.mouseMoveHandler);
      document.addEventListener('mouseup', this.mouseUpHadler);
    }
  }

  onDragStartHandler(dragStartHandler = () => false): this {
    this.element.addEventListener('dragstart', dragStartHandler);
    return this;
  }

  cancelDragable(): void {
    setTimeout(() => {
      this.activeMousedown = false;
    }, 0);
  }
}

export default Thumb;
