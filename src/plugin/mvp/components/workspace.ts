import Component from './component';
import Thumb from './thumb';
import Scale from './scale';
import ProgressBar from './progress-bar';

import {
  createElement,
  stepBalancing
} from '../../utils/view.functions';


interface IWorkspace {
  computeSpace(): this;
  computeStep(step: number): this;
}

class Workspace extends Component implements IWorkspace {
  element: HTMLDivElement;
  space = 0;
  step = 0;  

  constructor(type: Orientation, mode: Mode, public thumbs: Thumb[], public progressBar: ProgressBar, public scale: Scale) {
    super(type, mode);
    this.element = this.create(this.type);
  }

  create<K extends Orientation>(key: K): HTMLDivElement {
    return createElement('div', ['slider', `slider__${key.toLowerCase()}`]) as HTMLDivElement;
  }

  computeSpace(): this {
    this.space = this.element[this.styleKeys.offset] - 2;
    return this;
  }
  computeStep(step: number): this {
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
    else 
      this.scale.destroy();  
    return this;
  }    

  computeNewOffsetPosition(now: number, options: HandleOptions): number {
    let newOffsetPosition;
    if (now < options.ownSpace.start) {
      newOffsetPosition = options.ownSpace.start;
    } else if (now > options.ownSpace.end) {
      newOffsetPosition = options.ownSpace.end;
    } else {
      newOffsetPosition = stepBalancing(now, this.step);
    }
    return newOffsetPosition;
  }
    
  computeOwnSpace(index: number, options: HandleOptions): void { 
    index === 0 
      ? options.ownSpace = { 
        start: 0, 
        end: this.thumbs[0].isMultiple() 
          ? this.thumbs[1].value - this.step + this.thumbs[0].getSize() / 2
          : this.space
        }
      : options.ownSpace = { 
        start: this.thumbs[0].value + this.step + this.thumbs[0].getSize() / 2, 
        end: this.space
      };
  }  

  // changeProgressBarSizeAndPosition(index: number, newOffsetPosition: number): this {
  //   const tSize = this.thumbs[index].getSize() / 2;
  //   if (this.isMultiple()) {
  //     if (index === 0) {
  //       this.progressBar.setOnElementDefaultPosition(newOffsetPosition);
  //       this.progressBar.setOnElementDefaultSize(this.thumbs[1].value - newOffsetPosition + tSize);
  //     } else {
  //       this.progressBar.setOnElementDefaultSize(newOffsetPosition - this.thumbs[0].value - tSize);
  //     }      
  //   } else {
  //     this.progressBar.setOnElementDefaultSize(newOffsetPosition);
  //   }
  //   return this;
  // }

  // changeLabelPositionAndValue(index: number, newOffsetPosition: number): this {
  //   const activeThumb = this.thumbs[index];
  //   activeThumb.label
  //     .setOnElementPosition(newOffsetPosition + this.correctValue() - activeThumb.getSize() / 2)
  //     .setTextContent(activeThumb.element.value);
  //   return this;
  // }

  // mouseMoveHandler: HandleEvent = (options: HandleOptions, event: MouseEvent) => {
  //   const { shift, index } = options;
  //   this.computeOwnSpace(index, options);
        
  //   const position = event[this.styleKeys.client] - shift - this.getPropValueFromCoordinates(this.element);
  //   const newOffsetPosition = this.computeNewOffsetPosition(position, options);
   
  //   // console.log('evtype - workspace', event.type);
  //   // console.log('evthumb - workspace', event.target);
  //   // console.log('this - workspace', this);
  //   // console.log('client - workspace', event[this.styleKeys.client]);
  //   // console.log('options - workspace', options);
  //   // console.log('prop', this.getPropValueFromCoordinates(this.element))
  //   // console.log('position - workspace', position);
  //   // console.log('newOffsetPosition - workspace', newOffsetPosition);

  //   this.thumbs[index].setOnElementDefaultPosition(newOffsetPosition);
  //   this
  //     .changeProgressBarSizeAndPosition(index, newOffsetPosition)
  //     .changeLabelPositionAndValue(index, newOffsetPosition);
  // }
}

export default Workspace;