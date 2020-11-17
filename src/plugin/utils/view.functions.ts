import { Validator } from "./validator";

const propsViewOptions: Array<string> = ['orientation', 'mode', 'step', 'minimumValue', 'maximumValue',
  'defaultValue', 'defaultInterval', 'showValue', 'showSettings'];

// функции для создания и обновления вида слайдера
function createSlider($view: JQuery, options: ViewOptions, delta: number): void {
  initOrientation($view, options.orientation);
  initMode($view, options);
  initThumb($view, options, delta);
  if (options.showValue) {
    initLabel($view, options);
  }
  $view.addClass('slider');
}

function initOrientation($view: JQuery, orientation: Orientation): void {
  orientation === 'Gorizontal'
    ? $view.addClass('slider__gorizont')
    : $view.addClass('slider__vertical');
}
function initMode($view: JQuery, options: ViewOptions): void {
  if (options.mode === 'Single') {
    const thumb: HTMLButtonElement = createElement('button', 'thumb') as HTMLButtonElement;
    thumb.value = options.defaultValue;
    $view.append(thumb);
  } else {
    let interval: HTMLDivElement
    if (options.orientation === 'Gorizontal') {
      interval = createElement('div', ['interval', 'interval__gorizontal']) as HTMLDivElement;
    } else {
      interval = createElement('div', ['interval', 'interval__vertical']) as HTMLDivElement;
    }
    const thumbA: HTMLButtonElement = createElement('button', 'thumb__a') as HTMLButtonElement;
    thumbA.value = options.defaultInterval[0];
    const thumbB: HTMLButtonElement = createElement('button', 'thumb__b') as HTMLButtonElement;
    thumbB.value = options.defaultInterval[1];
    $view.append(interval);
    $view.append(thumbA);
    $view.append(thumbB);
  }
}
function initThumb($view: JQuery, options: ViewOptions, delta: number): void {

  const orientation: Orientation = options.orientation;
  const mode: Mode = options.mode;

  const offset = orientation === 'Gorizontal'
    ? 'offsetWidth'
    : 'offsetHeight';
  const style = orientation === 'Gorizontal'
    ? 'left'
    : 'top';
  const interval = orientation === 'Gorizontal'
    ? 'width'
    : 'height';
  const selector = mode === 'Single'
    ? '.thumb'
    : '.thumb__a';
  const space = calcSpace($view, options);

  const valueA = valueToPixel(+options.defaultInterval[0], space, delta, options);
  const valueB = valueToPixel(+options.defaultInterval[1], space, delta, options);

  switch (mode) {
    case 'Single':
      $view.find('.thumb')[0].style[style] = (valueToPixel(+options.defaultValue, space, delta, options)).toString() + 'px';
      break;
    case 'Multiple':
      $view.find('.thumb__a')[0].style[style] = valueA.toString() + 'px';
      $view.find('.thumb__b')[0].style[style] = valueB.toString() + 'px';

      $view.find('.interval')[0].style[interval] = (valueB - valueA).toString() + 'px';
      $view.find('.interval')[0].style[style] = ((valueA) + $view.find(selector)[0][offset] / 2).toString() + 'px';
      break;
  }
}
function initLabel($view: JQuery, options: ViewOptions): void {
  const onLabels = options.showValue;
  let labels: string[] = [];

  if (options.mode === 'Single') {
    labels = options.orientation === 'Gorizontal'
      ? ['label__x']
      : ['label__y'];
    multipleCreate(labels[0], options.defaultValue, $view);
  } else {
    labels = options.orientation === 'Gorizontal'
      ? ['label__ax', 'label__bx']
      : ['label__ay', 'label__by'];
    multipleCreate(labels[0], options.defaultInterval[0], $view);
    multipleCreate(labels[1], options.defaultInterval[1], $view);
  }

  if (onLabels) {
    initStartPositionLabel(labels, options, $view);
  }
}
function initStartPositionLabel(labels: string[], options: ViewOptions, $view: JQuery): void {
  const style = options.orientation === 'Gorizontal'
    ? 'left'
    : 'top';
  const space = calcSpace($view, options);
  const delta = calcDelta(options);

  switch (options.mode) {
    case 'Single':
      $view.find('.' + labels[0])[0].style[style] = valueToPixel(+options.defaultValue, space, delta, options).toString() + 'px';
      break;
    case 'Multiple':
      $view.find('.' + labels[0])[0].style[style] = valueToPixel(+options.defaultInterval[0], space, delta, options).toString() + 'px';
      $view.find('.' + labels[1])[0].style[style] = valueToPixel(+options.defaultInterval[1], space, delta, options).toString() + 'px';
      break;
  }
}

function calcSpace($view: JQuery, options: ViewOptions): number {
  const offset = options.orientation === 'Gorizontal'
    ? 'offsetWidth'
    : 'offsetHeight';
  const selector = options.mode === 'Single'
    ? '.thumb'
    : '.thumb__a';
  return $view[0][offset] - $view.find(selector)[0][offset] - 2;
}
function calcDelta(options: ViewOptions): number {
  return +options.maximumValue - +options.minimumValue;
}
function stepToPixel(space: number, delta: number, options: ViewOptions): number {
  return +options.step * (space / delta);
}
function stepBalancing(change: number, step: number): number {
  const balance = change % step;
  if (step / 2 <= balance) {
    return change + (step - balance);
  } else {
    return change - balance;
  }
}
function valueToPixel(value: number, space: number, delta: number, options: ViewOptions): number {
  return Math.round(value * (space / delta) - (+options.minimumValue * (space / delta)));
}
function multipleCreate(label: string, value: string, $view: JQuery): void {
  if ($view.find('.' + label).length !== 0) {
    $view.find('.' + label).remove();
    return;
  }
  const pValue: HTMLParagraphElement = createElement('p', ['label', label]) as HTMLParagraphElement;
  pValue.textContent = value;
  $view.append(pValue);
}

function changeLabelPosition($view: JQuery, options: ViewOptions, offset: [number] | [number, number], lastOffset?: string): void {
  const orientation = options.orientation === 'Gorizontal'
    ? 'left' : 'top';
  const axis = options.orientation === 'Gorizontal'
    ? 'x' : 'y';

  if (options.mode === 'Single') {
    $view.find('.label__' + axis)[0].style[orientation] = offset[0].toString() + 'px';
    $view.find('.label__' + axis)[0].textContent = options.defaultValue;
  } else {
    if (lastOffset && lastOffset === 'A') {
      $view.find('.label__a' + axis)[0].style[orientation] = offset[0].toString() + 'px';
      $view.find('.label__a' + axis)[0].textContent = options.defaultInterval[0];
    } else if (lastOffset && lastOffset === 'B') {
      $view.find('.label__b' + axis)[0].style[orientation] = offset[0].toString() + 'px';
      $view.find('.label__b' + axis)[0].textContent = options.defaultInterval[1];
    } else {
      $view.find('.label__a' + axis)[0].style[orientation] = offset[0].toString() + 'px';
      $view.find('.label__a' + axis)[0].textContent = options.defaultInterval[0];
      $view.find('.label__b' + axis)[0].style[orientation] = offset[1] ? offset[1].toString() + 'px' : '0px';
      $view.find('.label__b' + axis)[0].textContent = options.defaultInterval[1];
    }
  }
}
function checkKey(key: string, data: ViewOptions, oldData: ViewOptions): boolean {
  // eslint-disable-next-line fsd/split-conditionals
  if (key === 'defaultValue'
    || key === 'minimumValue'
    || key === 'maximumValue'
    || key === 'orientation'
    || key === 'defaultInterval'
    || key === 'step'
    || key === 'mode'
    || key === 'showValue'
    || key === 'showSettings') {
    return data[key] !== oldData[key];
  } else {
    return false;
  }
}

function calcOffset($view: JQuery, options: ViewOptions): [number] | [number, number] {
  const space = calcSpace($view, options);
  const delta = calcDelta(options);

  if (options.mode === 'Single') {
    const newOffset = valueToPixel(+options.defaultValue, space, delta, options);
    return [newOffset];
  } else {
    const offsetA = valueToPixel(+options.defaultInterval[0], space, delta, options);
    const offsetB = valueToPixel(+options.defaultInterval[1], space, delta, options);
    return [offsetA, offsetB];
  }
}
function clearAll($view: JQuery) {
  $view.empty();
  $view.off();
}
function toggleOrientation($view: JQuery): void {
  $view.toggleClass('slider__gorizont slider__vertical');
}

function changeView($view: JQuery, data: ViewOptions, oldData: ViewOptions): number {
  //Object.keys(data).forEach((key)
  let code = 0;
  propsViewOptions.forEach((key) => {
    if (checkKey(key, data, oldData)) {
      switch (key) {
        case 'defaultValue':
        case 'defaultInterval':
          updateFunctions.changeDefaultValue($view, data);
          if (typeof (data.onValueChanged) === 'function') {
            const measurement = data.measurement ? data.measurement : '';
            let values = '';
            if (data.mode === 'Single') {
              values = data.defaultValue + measurement
            } else {
              values = data.defaultInterval[0] + measurement + ' - ' + data.defaultInterval[1] + measurement
            }
            $view.trigger('valueChanged', values);
          }
          return;
        case 'minimumValue':
        case 'maximumValue':
          updateFunctions.changeLimitValues($view, data);
          return;
        case 'orientation':
          code = updateFunctions.changeOrientation($view, data);
          return;
        case 'mode':
          code = updateFunctions.changeMode($view, data);
          return;
        case 'step':
          return;
        case 'showValue':
          updateFunctions.changeShowValue($view, data);
          return;
      }
    }
  });
  return code;
}

const updateFunctions = {
  changeDefaultValue: ($view: JQuery, options: ViewOptions): number => {
    const orientation = options.orientation === 'Gorizontal'
      ? 'left' : 'top';
    const offset = options.orientation === 'Gorizontal'
      ? 'offsetWidth' : 'offsetHeight';
    const size = options.orientation === 'Gorizontal'
      ? 'width' : 'height';
    const space = calcSpace($view, options);
    const delta = calcDelta(options);
    const newOffset = valueToPixel(+options.defaultValue, space, delta, options);

    if (options.mode === 'Single') {
      $view.find('.thumb')[0].style[orientation] = newOffset.toString() + 'px';
      if (options.showValue) {
        changeLabelPosition($view, options, [newOffset]);
      }
    } else {
      const offsetA = valueToPixel(+options.defaultInterval[0], space, delta, options);
      const offsetB = valueToPixel(+options.defaultInterval[1], space, delta, options);

      $view.find('.interval')[0].style[orientation] = (offsetA + $view.find('.thumb__a')[0][offset] / 2).toString() + 'px';
      $view.find('.interval')[0].style[size] = (offsetB - offsetA).toString() + 'px';
      $view.find('.thumb__a')[0].style[orientation] = offsetA.toString() + 'px';
      $view.find('.thumb__b')[0].style[orientation] = offsetB.toString() + 'px';
      if (options.showValue) {
        changeLabelPosition($view, options, [offsetA, offsetB]);
      }
      return offsetB;
    }

    return newOffset;
  },
  changeLimitValues: ($view: JQuery, options: ViewOptions): number => {
    const delta = calcDelta(options);
    initThumb($view, options, delta);
    if (options.showValue) {
      changeLabelPosition($view, options, calcOffset($view, options));
    }
    return 0;
  },
  changeOrientation: ($view: JQuery, options: ViewOptions): number => {
    clearAll($view);
    toggleOrientation($view);
    initMode($view, options);
    const delta = calcDelta(options);
    initThumb($view, options, delta);
    if (options.showValue)
      initLabel($view, options);
    return -1;
  },
  changeMode: ($view: JQuery, options: ViewOptions): number => {
    clearAll($view);
    initMode($view, options);
    const delta = calcDelta(options);
    initThumb($view, options, delta);
    if (options.showValue)
      initLabel($view, options);
    return -1;
  },
  changeShowValue: ($view: JQuery, options: ViewOptions): number => {
    initLabel($view, options);
    return 0;
  }
}

// функции для создания и обновления вида настроек
function createSettings(): HTMLDivElement {
  const htmlSettings = `            
        <div class="settings__info">
            <label>
                <input class="info" type="checkbox">
                <div class="instead_label">off/on labels</div>
            </label>
        </div>
        <div class="settings__view">
            <fieldset>
                <legend>Вид слайдера</legend>
                <label>
                    <input class="view__gorizontal" type="radio" name="view" value="Gorizontal" />
                    <div class="gorizontal_label">Горизонтально</div>
                </label>
                <label>
                    <input class="view__vertical" type="radio" name="view" value="Vertical" />
                    <div class="vertical_label">Вертикально</div>
                </label>                
            </fieldset>
        </div>
        <div class="settings__mode">
            <fieldset>
                <legend>Режим</legend>
                <label>
                    <input class="mode__single" type="radio" name="mode" value="Single" />
                    <div class="single_label">Single</div>
                </label>
                <label>
                    <input class="mode__multiple" type="radio" name="mode" value="Multiple" />
                    <div class="multiple_label">Multiple</div>
                </label>                
            </fieldset>            
        </div>
        <div class="settings__item">
            <fieldset>
                <legend>Шаг</legend>
                <input class="step" name="step" type="text">
            </fieldset>
        </div>        
        <div class="settings__values">
            <fieldset>
                <legend>Значения</legend>
            </fieldset>
        </div>
        <div class="settings__item">
            <fieldset>
            <legend>Границы</legend>
            <input class="minimum" name="minimum" type="text" placeholder="Минимальное значение">
            <input class="maximum" name="maximum" type="text" placeholder="Максимальное значение"></fieldset>
        </div>`;
  const divSettings: HTMLDivElement = createElement('div', 'settings') as HTMLDivElement;
  divSettings.insertAdjacentHTML('afterbegin', htmlSettings);
  return divSettings;
}

function findElements(view: HTMLDivElement): {
  showValueInput: HTMLInputElement,
  orientationInputs: NodeListOf<HTMLInputElement>,
  modeInputs: NodeListOf<HTMLInputElement>,
  stepInput: HTMLInputElement,
  minInput: HTMLInputElement,
  maxInput: HTMLInputElement,
  divWithValue: HTMLDivElement
} {
  const showValueInput: HTMLInputElement = view.querySelector('.settings__info input') as HTMLInputElement;
  const orientationInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__view input');
  const modeInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__mode input');
  const stepInput: HTMLInputElement = view.querySelector('.settings__item .step') as HTMLInputElement;
  const minInput: HTMLInputElement = view.querySelector('.settings__item .minimum') as HTMLInputElement;
  const maxInput: HTMLInputElement = view.querySelector('.settings__item .maximum') as HTMLInputElement;
  const divWithValue: HTMLDivElement = view.querySelector('.settings__values fieldset') as HTMLDivElement;

  return {
    showValueInput,
    orientationInputs,
    modeInputs,
    stepInput,
    minInput,
    maxInput,
    divWithValue
  }
}

function setElementsForValues(div: HTMLDivElement, mode: Mode): HTMLInputElement[] {
  div.innerHTML = `<legend>Значения</legend>`;
  const values: HTMLInputElement[] = createElementsForValues(mode);

  if (mode === 'Single') {
    div.append(values[0]);
  } else {
    div.append(values[0]);
    div.append(values[1]);
  }
  return values;
}

function initValues(mode: Mode, values: HTMLInputElement[] | NodeListOf<HTMLInputElement>, defaultValue: string, defaultInterval: [string, string]): void {
  if (mode === 'Single') {
    values[0].value = defaultValue;
  } else {
    values[0].value = defaultInterval[0];
    values[1].value = defaultInterval[1];
  }
}

function setNewData(data: ViewOptions, prevData: ViewOptions, view: HTMLDivElement, $object: JQuery, validator: Validator): void {
  const {
    showValueInput,
    orientationInputs,
    modeInputs,
    stepInput,
    minInput,
    maxInput,
    divWithValue } = findElements(view);
  propsViewOptions.forEach((key) => {
    if (checkKey(key, data, prevData)) {

      let values: HTMLInputElement[] = [];
      if (key === 'mode') {
        values = setElementsForValues(divWithValue, data.mode);
      }
      const inputs: NodeListOf<HTMLInputElement> = divWithValue.querySelectorAll('input');

      switch (key) {
        case 'showValue':
          showValueInput.checked = data.showValue;
          return;
        case 'orientation':
          setNodeValue(orientationInputs, data.orientation);
          return;
        case 'mode':
          setNodeValue(modeInputs, data.mode);
          initValues(data.mode, values, data.defaultValue, data.defaultInterval);
          return;
        case 'step':
          stepInput.value = data.step;

          if (!validator.errorHandler($object, stepInput, 'Обязательное поле', Validator.REQUIRED)) {
            return;
          }
          if (!validator.errorHandler($object, stepInput, 'Поле должно быть целочисленным', Validator.ONLY_NUMBERS)) {
            return;
          }
          validator.errorHandler($object, stepInput, 'Превышено максимальное количество символов', Validator.MAX_LENGTH, '3');
          return;
        case 'minimumValue':
          minInput.value = data.minimumValue;

          if (!validator.errorHandler($object, minInput, 'Обязательное поле', Validator.REQUIRED)) {
            return;
          }
          if (!validator.errorHandler($object, minInput, 'Поле должно быть целочисленным', Validator.ONLY_NUMBERS)) {
            return;
          }
          if (!validator.errorHandler($object, minInput, 'Значение должно быть не меньше -100', Validator.MIN_VALUE, '-100')) {
            return;
          }
          validator.errorHandler($object, minInput, 'Интервал должен быть больше 0', Validator.CORRECT_INTERVAL, (+maxInput.value - +minInput.value).toString());
          return;
        case 'maximumValue':
          maxInput.value = data.maximumValue;

          if (!validator.errorHandler($object, maxInput, 'Обязательное поле', Validator.REQUIRED)) {
            return;
          }
          if (!validator.errorHandler($object, maxInput, 'Поле должно быть целочисленным', Validator.ONLY_NUMBERS)) {
            return;
          }
          if (!validator.errorHandler($object, maxInput, 'Значение должно быть не больше 100', Validator.MAX_VALUE, '100')) {
            return;
          }
          validator.errorHandler($object, maxInput, 'Интервал должен быть больше 0', Validator.CORRECT_INTERVAL, (+maxInput.value - +minInput.value).toString());
          return;
        case 'defaultValue':
        case 'defaultInterval':
          initValues(data.mode, inputs, data.defaultValue, data.defaultInterval);

          if (!validator.errorHandler($object, inputs, 'Обязательное поле', Validator.REQUIRED)) {
            return;
          }
          if (!validator.errorHandler($object, inputs, 'Поле должно быть целочисленным', Validator.ONLY_NUMBERS)) {
            return;
          }
          if (!validator.errorHandler($object, inputs, `Значение должно быть не больше ${maxInput.value}`, Validator.MAX_VALUE, maxInput.value)) {
            return;
          }
          if (!validator.errorHandler($object, inputs, `Значение должно быть не меньше ${minInput.value}`, Validator.MIN_VALUE, minInput.value)) {
            return;
          }
          inputs.length > 1 ? validator.errorHandler($object, inputs, 'Интервал должен быть больше 0', Validator.CORRECT_INTERVAL, (+inputs[1].value - +inputs[0].value).toString()) : true;
          return;
        case 'showSettings':
          view.parentNode?.removeChild(view);
          return;
      }
    }
  })
}

function setNodeValue(nodes: NodeListOf<HTMLInputElement>, value: string): void {
  nodes.forEach(input => {
    input.value === value ? input.checked = true : false;
  });
}
function diversification(nodes: NodeListOf<HTMLInputElement>, id: string): NodeListOf<HTMLInputElement> {
  nodes.forEach(input => input.name = id + '-' + input.name);
  return nodes;
}

function createElementsForValues(mode: Mode): HTMLInputElement[] {
  const array: HTMLInputElement[] = [];
  if (mode === 'Single') {
    const inputWithValue: HTMLInputElement = createElement('input') as HTMLInputElement;
    inputWithValue.classList.add('values');
    inputWithValue.type = 'text';
    array.push(inputWithValue);
  } else {
    const inputWithValueA: HTMLInputElement = createElement('input') as HTMLInputElement;
    const inputWithValueB: HTMLInputElement = createElement('input') as HTMLInputElement;
    inputWithValueA.classList.add('interval__a');
    inputWithValueB.classList.add('interval__b');
    inputWithValueA.type = 'text';
    inputWithValueB.type = 'text';
    array.push(inputWithValueA);
    array.push(inputWithValueB);
  }
  return array;
}
function createElement(tag: string, className?: string | string[]): HTMLElement {
  const element: HTMLElement = document.createElement(tag);

  if (className && typeof className === 'string') element.classList.add(className);
  else if (className) element.classList.add(...className);

  return element;
}

export {
  propsViewOptions, createSlider, calcSpace, calcDelta, stepToPixel,
  stepBalancing, valueToPixel, changeLabelPosition, changeView,
  createSettings, findElements, setElementsForValues, initValues, setNewData, setNodeValue, diversification
};
