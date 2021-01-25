import $ from 'jquery';
import Component from './component';
import Thumb from './thumb';
import Scale from './scale';
import ProgressBar from './progress-bar';

import {
  createElement,
  stepBalancing
} from '../../utils/view.functions';


class Workspace extends Component {
  element: HTMLDivElement;
  space: OwnSpace = {
    start: 0, // начальная точка пространства (px) 
    end: 0 // конечная точнка пространства (px)
  };
  step = 0; // шаг (px)
  delta = 0; // числовая разница (max - min)


  constructor(type: Orientation, mode: Mode, public thumbs: Thumb[], public progressBar: ProgressBar, public scale: Scale) {
    super(type, mode);
    this.element = this.create(this.type);
  }

  create<K extends Orientation>(key: K): HTMLDivElement {
    return createElement('div', ['slider', `slider__${key.toLowerCase()}`]) as HTMLDivElement;
  }

  getUnitMeasure(): number {
    return this.space.end / this.delta;
  }

  setDelta(delta: number): this {
    this.delta = delta;
    return this;
  }

  computeSpace(minimum: number): this {
    this.space.end = this.element[this.styleKeys.offset] - 2;
    this.space.start = this.space.end / this.delta * minimum;
    return this;
  }

  setStep(step: number): this {
    this.step = step;
    return this;
  }  

  renderThumbOnWorkspace(): this {
    this.thumbs.forEach(thumb => {
      this.element.insertAdjacentElement('beforeend', thumb.element);
    });
    return this;    
  }
  
  renderProgressBarOnWorkspace(): this {
    this.element.insertAdjacentElement('beforeend', this.progressBar.element);
    return this;    
  }

  renderScaleOnWorkspace(isShowScale: boolean): this {
    if (isShowScale)
      this.element.insertAdjacentElement('beforeend', this.scale.element);
    else if (this.element.querySelector('.scale')) {
      this.scale.destroy();  
    }      
    return this;
  }    

  computeNewOffsetPosition(now: number, options: HandleOptions): number {
    let newOffsetPosition = stepBalancing(now, this.step, options.ownSpace.start);
    if (newOffsetPosition < options.ownSpace.start || now < options.ownSpace.start) {
      newOffsetPosition = options.ownSpace.start;
    } else if (newOffsetPosition > options.ownSpace.end || now > options.ownSpace.end) {
      newOffsetPosition = options.ownSpace.end;
    }
    return newOffsetPosition;
  }
    
  computeOwnSpace(index: number, options: HandleOptions): void {
    index === 0 
      ? options.ownSpace = { 
        start: this.space.start, 
        end: this.thumbs[0].isMultiple()
          ? this.thumbs[1].value - this.step + this.thumbs[0].getSize() / 2 + this.space.start
          : this.space.end + this.space.start
        }
      : options.ownSpace = { 
        start: this.space.start + this.thumbs[0].value + this.step + this.thumbs[0].getSize() / 2, 
        end: this.space.end + this.space.start
      };
  }  

  destroy(): this {
    const $workspace = $(this.element).parent().find(this.element);
    $workspace.length !== 0
      ? $workspace.remove()
      : false;
    return this;
  }
}

export default Workspace;