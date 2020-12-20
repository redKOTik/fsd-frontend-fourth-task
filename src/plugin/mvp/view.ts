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

interface IView {
  $view: JQuery;
  component: Workspace;
  handleValueChanged: (data: DispatchData) => void;
  handleViewChanged: (data: DispatchData) => void;
  handleModeChanged: (data: DispatchData) => void;
  handleTypeChanged: (data: DispatchData) => void;
  handleRangeChanged: (data: DispatchData) => void;
  handleStepChanged: (data: DispatchData) => void;
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

  constructor(public $view: JQuery, options: ViewOptions, public emmitter: EventEmmiter) {
    this.options = {
      ...options,
      defaultInterval: [...options.defaultInterval] as [string, string]
    };
    this.component = this.createView();
  }

  createView(): Workspace {
    if (this.component)
      this.component.destroy();
      
    this.component = this.createComponents(this.options);
    this.component
      .renderProgressBarOnWorkspace()
      .renderThumbOnWorkspace()
      .renderScaleOnWorkspace(this.options.showScale);
    this.addComponentToDomStructure(this.$view);
    this.initComponents(this.options);
    this.addEventListeners();

    return this.component;
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
      .setDelta(calcDelta(options))
      .computeSpace(+options.minimumValue)
      .setStep(
        convStepNumberToPixel(
          +options.step,
          this.component.getUnitMeasure())
      );
  }

  initThumbElement(thumb: Thumb, value: string, options: ViewOptions): void {
    thumb
      .setOnElementDefaultValue(value)
      .setOnElementDefaultPosition(
        convValueNumberToPixel(
          +value,
          this.component.getUnitMeasure(),
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
      .createMarks()
      .initMarks(options)
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
            
    const position = this.component.space.start + event[this.component.styleKeys.client] - shift - this.component.getPropValueFromCoordinates(this.component.element); // start + clickEvent.clientX - shift - workspace.offsetLeft
    const newOffsetPosition = this.component.computeNewOffsetPosition(position, options);
    this.component.thumbs[index].setOnElementDefaultPosition(newOffsetPosition);
    this.emmitter.dispatch('view:thumb-moved', { position: newOffsetPosition, index, step: this.component.step });
  }

  // set listeners

  onClickToScaleHandler(): void {
    this.component.scale.element.addEventListener('click', this.clickToScaleHandler);
  }

  onMousedownThumbHandler(thumb: Thumb, mousemoveHandler: HandleEvent, context: Workspace): void {
    thumb.setMouseDownHandler(thumb.makeMouseDownHandler(mousemoveHandler, context));
    thumb.element.addEventListener('mousedown', thumb.mouseDownHandler);
  }  

  // methods view update

  toggleShowValueSetting(): void {
    this.component.thumbs.forEach(thumb => {      
      thumb.checkShowValue(this.options.showValue);
    });
  }

  toggleShowScaleSetting(): void {
    this.component.renderScaleOnWorkspace(this.options.showScale);
  }

  toggleSetting(): void {
    this.createView();
  }

  reInitThumbs(): void {
    this.component.thumbs.forEach(thumb => {      
      this.initThumbElement(thumb, thumb.element.value, this.options);
    });
  }

  reInitScale(): void {
    this.initScaleElement(this.options);
  }

  reInitProgressBar():void {
    this.initProgressBarElement();
  }
  
  reHangEventListeners(): void {
    this.component.thumbs.forEach(thumb => {
      thumb.element.removeEventListener('mousedown', thumb.mouseDownHandler)
      this.onMousedownThumbHandler(thumb, this.mousemoveHandler, this.component);
    });
  }

  changeViewFromRange(): void {
    this.reInitThumbs();
    this.reInitProgressBar();
    this.reInitScale();
    //this.reHangEventListeners();
  }

  updateThumb(thumb: Thumb, value: string): void {
    thumb
      .setOnElementDefaultValue(value)
      .setOnElementDefaultPosition(
        convValueNumberToPixel(
          +value,
          this.component.getUnitMeasure(),
          +this.options.minimumValue))
      .initLabel()
  }

  // model handlers

  handleValueChanged: (data: DispatchData) => void = (data: DispatchData) => {
    Object.keys(data).forEach(key => {
      switch (key) {
        case 'defaultValue':
          this.options.defaultValue = data['defaultValue'] as string;
          if (this.options.mode === 'Single')
            this.updateThumb(this.component.thumbs[0], this.options.defaultValue);
          break;
        case 'defaultInterval':
          this.options.defaultInterval = data['defaultInterval'] as [string, string];
          if (this.options.mode === 'Multiple')
            this.component.thumbs.forEach((thumb, index) => {
              this.updateThumb(thumb, this.options.defaultInterval[index]);
            });          
          break;
      }
    });    
    this.initProgressBarElement();
  }

  handleViewChanged: (data: DispatchData) => void = (data: DispatchData) => {
    switch (Object.keys(data)[0]) {
      case 'showValue':
        this.options.showValue = data.showValue as boolean;
        this.toggleShowValueSetting();
        return;
      case 'showScale':
        this.options.showScale = data.showScale as boolean;
        this.toggleShowScaleSetting();
        return;
    }
  }

  handleModeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.options.mode = data.mode as Mode;
    this.toggleSetting();
  }

  handleTypeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.options.orientation = data.view as Orientation;
    this.toggleSetting();
  }

  handleRangeChanged: (data: DispatchData) => void = (data: DispatchData) => {
    data.minimumValue 
      ? this.options.minimumValue = data.minimumValue as string 
      : this.options.maximumValue = data.maximumValue as string;
    this.initWorkspace(this.options);
    this.changeViewFromRange();
  }

  handleStepChanged: (data: DispatchData) => void = (data: DispatchData) => {
    this.options.step = data.step as string;
    this.component.setStep(
      convStepNumberToPixel(
        +this.options.step,
        this.component.getUnitMeasure()));  
  }
}

export { View, IView };