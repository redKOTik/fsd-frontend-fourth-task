import EventEmmiter from '../utils/emmiter';

import {
  calcDelta
} from '../utils/view.functions';

import {
  convValueNumberToPixel,
  convStepNumberToPixel
} from '../utils/view.functions';

import Thumb from './components/thumb';
import ProgressBar from './components/progress-bar';
import Scale from './components/scale';
import Workspace from './components/workspace';


type ChangedValue = {
  [key: string]: string | string[]
};

type ChangedOption = {
  [key: string]: boolean;
}

interface IView {
  $view: JQuery;
  component: Workspace;
  handleValueChanged: (data: ChangedValue) => void;
  handleViewChanged: (data: ChangedOption) => void;
}

/**
 * @class View
 *
 * Визуальное представление слайдера.
 * @param object
 * @param options
 */
class View implements IView {
  options: ViewOptions;
  component: Workspace;

  delta: number;

  constructor(public $view: JQuery, options: ViewOptions, public emmitter: EventEmmiter) {
    this.options = {
      ...options,
      defaultInterval: [...options.defaultInterval] as [string, string]
    };

    this.delta = calcDelta(options);

    this.component = this.createComponents(options);
    this.component
      .renderProgressBarOnWorkspace()
      .renderThumbOnWorkspace()
      .renderScaleOnWorkspace(options.showScale);
    this.addComponentToDomStructure($view);
    this.initComponents(options);

    this.addEventListeners();
  }

  createComponents(options: ViewOptions): Workspace {
    const thumbs: Thumb[] = this.createThumbFromMode(options.mode, options.orientation);
    const progressBar: ProgressBar = new ProgressBar(options.orientation, options.mode);
    const scale: Scale = new Scale(options.orientation, options.mode);
    const workspace: Workspace = new Workspace(options.orientation, options.mode, thumbs, progressBar, scale);
    return workspace;
  }

  createThumbFromMode(mode: Mode, type: Orientation): Thumb[] {
    if (mode === 'Multiple')
      return [new Thumb(type, mode, 'first'), new Thumb(type, mode, 'second')];
    return [new Thumb(type, mode)];
  }

  initComponents(options: ViewOptions): void {
    this.initWorkspace(options);
    this.component.thumbs.forEach((thumb, i) => {
      const value = thumb.isMultiple()
        ? options.defaultInterval[i]
        : options.defaultValue;
      this.initThumbElement(thumb, value, options);
    });
    this.initProgressBarElement();
    this.initScaleElement(options);
  }

  initWorkspace(options: ViewOptions): void {
    this.component
      .computeSpace()
      .computeStep(
        convStepNumberToPixel(
          +options.step,
          this.component.space / this.delta)
      );
  }

  initThumbElement(thumb: Thumb, value: string, options: ViewOptions): void {
    thumb
      .setOnElementDefaultValue(value)
      .setOnElementDefaultPosition(
        convValueNumberToPixel(
          +value,
          this.component.space / this.delta,
          +options.minimumValue))
      .checkShowValue(options.showValue)
      .onDragStartHandler()
  }

  initProgressBarElement(): void {
    this.component.progressBar
      .setOnElementDefaultPosition(this.computeProgressBarDefaultPosition())
      .setOnElementDefaultSize(this.computeProgressBarDefaultSize());
  }

  initScaleElement(options: ViewOptions): void {
    this.component.scale
      .createMarks(options)
      .addMarksToScale();
  }

  computeProgressBarDefaultPosition(): number {
    const thumb = this.component.thumbs[0];
    const defaultPosition = thumb.isMultiple()
      ? thumb.value + thumb.getSize() / 2
      : 0;
    return defaultPosition;
  }

  computeProgressBarDefaultSize(): number {
    const defaultSize = this.component.isMultiple()
      ? this.component.thumbs[1].value - this.component.thumbs[0].value
      : this.component.thumbs[0].value + this.component.thumbs[0].getSize() / 2
    return defaultSize;
  }

  addComponentToDomStructure($view: JQuery): void {
    $view.append(this.component.element);
  }

  addEventListeners(): void {
    this.onClickToScaleHandler();
    this.component.thumbs.forEach(thumb => {
      this.onMousedownThumbHandler(thumb, this.mousemoveHandler, this.component);
    });
  }

  // handlers

  clickToScaleHandler: (event: Event) => void = (event: Event) => {
    const target: HTMLElement = event.target as HTMLElement;
    if (target && target.classList.contains('mark-content'))
      this.emmitter.dispatch('view:scale-clicked', { value: target.textContent })
  }

  mousemoveHandler: HandleEvent = (options: HandleOptions, event: MouseEvent) => {
    const { shift, index } = options;
    this.component.computeOwnSpace(index, options);
        
    const position = event[this.component.styleKeys.client] - shift - this.component.getPropValueFromCoordinates(this.component.element);
    const newOffsetPosition = this.component.computeNewOffsetPosition(position, options);
    this.component.thumbs[index].setOnElementDefaultPosition(newOffsetPosition);
    this.emmitter.dispatch('view:thumb-moved', { position: newOffsetPosition, index, space: this.component.step });
  }

  // set listeners

  onClickToScaleHandler(): void {
    this.component.scale.element.addEventListener('click', this.clickToScaleHandler);
  }

  onMousedownThumbHandler(thumb: Thumb, mousemoveHandler: HandleEvent, context: Workspace): void {
    thumb.element.addEventListener('mousedown', thumb.makeMouseDownHandler(mousemoveHandler, context));
  }


  // private onClick = (event: JQuery.MouseEventBase): void => {   
  //   const selector = this.options.orientation === 'Horizontal' 
  //     ? 'slider__horizontal'
  //     : 'slider__vertical';

  //   if (this.activeMousedown) {
  //     return;
  //   }

  //   const target: HTMLElement = event.target as HTMLElement;

  //   if (target.classList.contains(selector)) {      
  //     const step = stepToPixel(this.space, this.delta, this.options);
  //     if (this.options.mode === 'Multiple') {        
  //       const $thumbB = this.$view.find('.thumb__b');
  //       const offset = this.options.orientation === 'Horizontal'
  //         ? 'offsetX' 
  //         : 'offsetY';
  //       const orient = this.options.orientation === 'Horizontal'
  //         ? 'left' 
  //         : 'top';
  //       const valueA = valueToPixel(+this.options.defaultInterval[0], this.space, this.delta, this.options);
  //       const valueB = valueToPixel(+this.options.defaultInterval[1], this.space, this.delta, this.options);
  //       const spaceA = valueB - step;
  //       const spaceB = this.space - valueA - step;        
  //       if (event[offset] > +$thumbB.css(orient).slice(0,-2)) {
  //         this.onMouseMove({ step, uniqueSpaceB: spaceB }, event);
  //         this.changeModalHandler('interval__b', this.options.defaultInterval[1]);
  //       } else {
  //         this.onMouseMove({ step, uniqueSpaceA: spaceA }, event);
  //         this.changeModalHandler('interval__a', this.options.defaultInterval[0]);
  //       }        
  //     } else {
  //       this.onMouseMove({ step }, event);
  //       this.changeModalHandler('defaultValue', this.options.defaultValue);
  //     }      
  //   }
  // }
  toggleShowValueSetting(): void {
    this.component.thumbs.forEach(thumb => {      
      thumb.checkShowValue(this.options.showValue);
    });
  }

  toggleShowScaleSetting(): void {
    this.component.renderScaleOnWorkspace(this.options.showScale);
  }

  updateThumb(thumb: Thumb, value: string): void {
    thumb
      .setOnElementDefaultValue(value)
      .setOnElementDefaultPosition(
        convValueNumberToPixel(
          +value,
          this.component.space / this.delta,
          +this.options.minimumValue))
      .initLabel()
  }

  handleValueChanged: (data: ChangedValue) => void = (data: ChangedValue) => {
    switch (Object.keys(data)[0]) {
      case 'defaultValue':
        this.options.defaultValue = data['defaulValue'] as string;
        this.updateThumb(this.component.thumbs[0], this.options.defaultValue);
        break;
      case 'defaultInterval':
        this.options.defaultInterval = data['defaultInterval'] as [string, string];
        this.component.thumbs.forEach((thumb, index) => {
          this.updateThumb(thumb, this.options.defaultInterval[index]);
        });          
        break;
    }
    this.initProgressBarElement();
  }

  handleViewChanged: (data: ChangedOption) => void = (data: ChangedOption) => {
    switch (Object.keys(data)[0]) {
      case 'showValue':
        this.options.showValue = data.showValue;
        this.toggleShowValueSetting();
        return;
      case 'showScale':
        this.options.showScale = data.showScale;
        this.toggleShowScaleSetting();
        return;
    }
  }
}

export { View, IView };