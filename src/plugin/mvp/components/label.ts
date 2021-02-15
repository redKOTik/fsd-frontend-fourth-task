import $ from 'jquery';

import Component from "./component";

import {
  createElement
} from '../../utils/view.functions';

class Label extends Component {
  element: HTMLSpanElement;
  value = 0; // px  
  activeLabel = false;

  constructor(type: Orientation, mode: Mode) {
    super(type, mode);
    this.element = this.create();
  }

  create(): HTMLSpanElement {
    return createElement('span', 'slider-label') as HTMLSpanElement;
  }
  
  setTextContent(text: string): this {
    this.element.textContent = text;
    return this;
  }

  setOnElementPosition(position: number): this {
    this.element.style[this.styleKeys.position] = `${position}px`;
    if (!this.isHorizontal() && this.element.textContent)
      this.element.style['left'] = `-${((this.element.textContent.length - 1) * 0.5) + 1}em`;
    this.value = position;
    return this;
  }

  destroy(): this {
    const $label = $(this.element).parent().find($(this.element));
    $label.length !== 0
      ? this.destroyLabelFromDom($label)
      : false;
    return this;
  }

  destroyLabelFromDom($label: JQuery<HTMLSpanElement>): void {
    this.activeLabel = false;
    $label.remove()
  }
}

export default Label;
