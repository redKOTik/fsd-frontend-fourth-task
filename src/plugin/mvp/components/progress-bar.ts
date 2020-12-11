import Component from "./component";

import {
  createElement
} from '../../utils/view.functions';

class ProgressBar extends Component {
  element: HTMLDivElement;
  value = 0; // px.
  size = 0; // px.

  constructor(type: Orientation, mode: Mode) {
    super(type, mode);
    this.element = this.create();
  }

  create(): HTMLDivElement {
    return createElement('div', 'progress-bar') as HTMLDivElement;
  }

  setOnElementDefaultPosition(defaultPosition: number): this {
    this.element.style[this.styleKeys.position] = `${defaultPosition}px`;
    this.value = defaultPosition;
    return this;
  }

  setOnElementDefaultSize(defaultSize: number): this {
    this.element.style[this.styleKeys.props] = `${defaultSize}px`;
    this.size = defaultSize;
    return this;
  }
}

export default ProgressBar;