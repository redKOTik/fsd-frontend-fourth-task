import {
  createSlider,
  calcSpace,
  calcDelta,
  stepToPixel,
  stepBalancing,
  valueToPixel,
  changeView,
  changeLabelPosition
} from '../utils/view.functions';

type handlerOptions = {
  step: number;
  uniqueSpaceA?: number;
  uniqueSpaceB?: number;
};
type changeModalHandler = (option: 'defaultValue' | 'interval__a' | 'interval__b', value: string) => void;
type mouseHandler = (event: JQuery.MouseEventBase, options: handlerOptions) => void;

interface IView {
  $view: JQuery;
  shift: number;
  newOffset: number;
  space: number;

  changeModalHandler: changeModalHandler;
  updateView(data: ViewOptions, oldData: ViewOptions): void;
  initHandleChangeModel(handler: changeModalHandler): void;
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
  shift: number;
  newOffset: number;
  delta: number;
  space: number;
  handler?: mouseHandler = (): void => undefined;
  handlers?: [mouseHandler, mouseHandler] = [(): void => undefined, (): void => undefined];
  lastSetOffset?: string; // 'A' or 'B'

  changeModalHandler: changeModalHandler = () => false;

  constructor(public $view: JQuery, options: ViewOptions) {
    this.options = {
      ...options,
      defaultInterval: [...options.defaultInterval] as [string, string]
    };
    this.shift = 0;
    this.newOffset = 0;
    this.delta = calcDelta(options);
    createSlider($view, options, this.delta);

    this.space = calcSpace($view, options);
  }

  private setShift(event: JQuery.MouseEventBase, thumb: JQuery<HTMLElement>) {
    const prop = this.options.orientation === 'Gorizontal'
      ? 'left'
      : 'top';
    const client = this.options.orientation === 'Gorizontal'
      ? 'clientX'
      : 'clientY';
    const coordinates: JQuery.Coordinates | undefined = thumb.offset();
    const thumbPropValue: number = coordinates !== undefined ? coordinates[prop] : 0

    this.shift = event[client] - thumbPropValue;
  }

  initHandleChangeModel(handler: changeModalHandler): void {
    this.changeModalHandler = handler;
    const dummyHandler = () => false;

    if (this.options.mode === 'Single') {
      const $thumb = this.$view.find('.thumb');
      this.setOn($thumb);
      $thumb.on('dragstart', dummyHandler);
    } else {
      const $thumbA = this.$view.find('.thumb__a');
      this.setOn($thumbA);
      $thumbA.on('dragstart', dummyHandler);
      const $thumbB = this.$view.find('.thumb__b');
      this.setOn($thumbB);
      $thumbB.on('dragstart', dummyHandler);
    }
  }

  private setOn($thumb: JQuery) {
    let handler: mouseHandler;

    const mousedownHandler = (event: JQuery.MouseEventBase) => {
      this.setShift(event, $thumb);
      const step = stepToPixel(this.space, this.delta, this.options);
      if (this.options.mode === 'Multiple') {
        const valueA = valueToPixel(+this.options.defaultInterval[0], this.space, this.delta, this.options);
        const valueB = valueToPixel(+this.options.defaultInterval[1], this.space, this.delta, this.options);
        const spaceA = valueB - step;
        const spaceB = this.space - valueA - step;

        if ($thumb.hasClass('thumb__a')) {
          if (this.handlers) {
            this.handlers[0] = this.onMouseMove.bind(this, { step, uniqueSpaceA: spaceA });
            handler = this.handlers[0];
          }

        } else {
          if (this.handlers) {
            this.handlers[1] = this.onMouseMove.bind(this, { step, uniqueSpaceB: spaceB });
            handler = this.handlers[1];
          }
        }
      } else {
        this.handler = this.onMouseMove.bind(this, { step });
        handler = this.handler;
      }
      $(document).on('mousemove', handler);
      document.addEventListener('mouseup', this.onMouseUp);
    }

    $thumb.on('mousedown', mousedownHandler);
  }

  private checkedPosition(position: number, step: number, mode: Mode,
    uniqueSpaceA?: number, uniqueSpaceB?: number) {

    const space = mode === 'Single'
      ? this.space : uniqueSpaceB !== undefined
        ? this.space : uniqueSpaceA;

    const cond = mode === 'Single'
      ? 0 : uniqueSpaceB !== undefined
        ? this.space - uniqueSpaceB : 0;

    const spaceValue = space !== undefined ? space : -1;

    if (position < cond) {
      this.newOffset = cond;
    } else if (position > spaceValue) {
      this.newOffset = spaceValue;
    } else {
      this.newOffset = stepBalancing(position, step);
    }
  }

  private changeValue(width: number, left: number): string {
    const value: number =
      Math.round(left * ((+this.options.maximumValue - +this.options.minimumValue) / width))
      + +this.options.minimumValue;
    return value.toString();
  }

  private onMouseMove = (options: handlerOptions, event: JQuery.MouseEventBase): void => {
    const orient = this.options.orientation === 'Gorizontal'
      ? 'left' : 'top';
    const client = this.options.orientation === 'Gorizontal'
      ? 'clientX' : 'clientY';
    const offset = this.options.orientation === 'Gorizontal'
      ? 'offsetWidth' : 'offsetHeight';
    const prop = this.options.orientation === 'Gorizontal'
      ? 'width' : 'height';

    const { step, uniqueSpaceA, uniqueSpaceB } = options;

    const coordinates: JQuery.Coordinates | undefined = this.$view.offset();
    const viewPropValue: number = coordinates !== undefined ? coordinates[orient] : 0

    const position = event[client] - this.shift - viewPropValue;

    this.checkedPosition(position, step, this.options.mode, uniqueSpaceA, uniqueSpaceB);

    if (this.options.mode === 'Single') {
      this.$view.find('.thumb')[0].style[orient] = this.newOffset.toString() + 'px';
      this.options.defaultValue = this.changeValue(this.space, this.newOffset);
    } else {
      if (uniqueSpaceB !== undefined) {
        this.$view.find('.thumb__b')[0].style[orient] = this.newOffset.toString() + 'px';
        this.$view.find('.interval')[0].style[prop] = (this.newOffset - valueToPixel(+this.options.defaultInterval[0], this.space, this.delta, this.options)).toString() + 'px';
        this.lastSetOffset = 'B';
        this.options.defaultInterval[1] = this.changeValue(this.space, this.newOffset);
      } else {
        this.$view.find('.thumb__a')[0].style[orient] = this.newOffset.toString() + 'px';
        this.$view.find('.interval')[0].style[orient] = (this.newOffset + (this.$view.find('.thumb__a')[0][offset]) / 2).toString() + 'px';
        this.$view.find('.interval')[0].style[prop] = (valueToPixel(+this.options.defaultInterval[1], this.space, this.delta, this.options) - this.newOffset).toString() + 'px';
        this.lastSetOffset = 'A';
        this.options.defaultInterval[0] = this.changeValue(this.space, this.newOffset);
      }
    }

    if (this.options.showValue) {
      changeLabelPosition(this.$view, this.options, [this.newOffset], this.lastSetOffset);
    }
  }

  private onMouseUp = () => {
    document.removeEventListener('mouseup', this.onMouseUp);

    if (this.options.mode === 'Single') {
      $(document).off('mousemove', this.handler);
      this.changeModalHandler('defaultValue', this.options.defaultValue);
    } else {
      if (this.handlers) {
        if (this.lastSetOffset === 'A') {
          $(document).off('mousemove', this.handlers[0]);
          this.changeModalHandler('interval__a', this.options.defaultInterval[0]);
        } else {
          $(document).off('mousemove', this.handlers[1]);
          this.changeModalHandler('interval__b', this.options.defaultInterval[1]);
        }
      }
    }
  }

  // Methods changing of settings
  updateView(data: ViewOptions, oldData: ViewOptions): void {
    console.log('view update', data);
    this.newOffset = changeView(
      this.$view,
      data,
      oldData);
    this.options = Object.assign({}, this.options, data);
    this.delta = calcDelta(this.options);
    this.space = calcSpace(this.$view, this.options);

    if (this.newOffset === -1) {
      this.initHandleChangeModel(this.changeModalHandler);
    }
  }
}

export { View, IView };