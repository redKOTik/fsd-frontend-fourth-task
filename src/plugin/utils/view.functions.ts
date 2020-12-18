import { Validator } from "./validator";

function calcDelta(options: ViewOptions): number {
  return +options.maximumValue - +options.minimumValue;
}

function stepBalancing(change: number, step: number): number {
  const balance = change % step;
  if (step / 2 <= balance) {
    return change + (step - balance);
  } else {
    return change - balance;
  }
}

function convStepNumberToPixel(step: number, unitMeasure: number): number {
  return step * unitMeasure;
}

function convValueNumberToPixel(value: number, unitMeasure: number, minimumValue: number): number {
  return Math.round((value * unitMeasure) - (minimumValue * unitMeasure));
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
        <div class="settings__scale">
            <label>
                <input class="scale-input" type="checkbox">
                <div class="instead_label">off/on scale</div>
            </label>
        </div>
        <div class="settings__view">
            <fieldset>
                <legend>Вид слайдера</legend>
                <label>
                    <input class="view" type="radio" name="view" value="Horizontal" />
                    <div class="label">Горизонтально</div>
                </label>
                <label>
                    <input class="view" type="radio" name="view" value="Vertical" />
                    <div class="label">Вертикально</div>
                </label>                
            </fieldset>
        </div>
        <div class="settings__mode">
            <fieldset>
                <legend>Режим</legend>
                <label>
                    <input class="mode" type="radio" name="mode" value="Single" />
                    <div class="label">Single</div>
                </label>
                <label>
                    <input class="mode" type="radio" name="mode" value="Multiple" />
                    <div class="label">Multiple</div>
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
            <input class="range" name="minimum" type="text" placeholder="Минимальное значение">
            <input class="range" name="maximum" type="text" placeholder="Максимальное значение"></fieldset>
        </div>`;
  const divSettings: HTMLDivElement = createElement('div', 'settings') as HTMLDivElement;
  divSettings.insertAdjacentHTML('afterbegin', htmlSettings);
  return divSettings;
}

function findElements(view: HTMLDivElement): {
  showValueInput: HTMLInputElement,
  showScaleInput: HTMLInputElement,
  orientationInputs: NodeListOf<HTMLInputElement>,
  modeInputs: NodeListOf<HTMLInputElement>,
  stepInput: HTMLInputElement,
  minInput: HTMLInputElement,
  maxInput: HTMLInputElement,
  divWithValue: HTMLDivElement
} {
  const showValueInput: HTMLInputElement = view.querySelector('.settings__info input') as HTMLInputElement;
  const showScaleInput: HTMLInputElement = view.querySelector('.settings__scale input') as HTMLInputElement;
  const orientationInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__view input');
  const modeInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__mode input');
  const stepInput: HTMLInputElement = view.querySelector('.settings__item .step') as HTMLInputElement;
  const minInput: HTMLInputElement = view.querySelector('.settings__item .range[name="minimum"]') as HTMLInputElement;
  const maxInput: HTMLInputElement = view.querySelector('.settings__item .range[name="maximum"]') as HTMLInputElement;
  const divWithValue: HTMLDivElement = view.querySelector('.settings__values fieldset') as HTMLDivElement;

  return {
    showValueInput,
    showScaleInput,
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
    showScaleInput,
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
        case 'showScale':
          showScaleInput.checked = data.showScale;
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
  const length = mode === 'Single' ? 1 : 2;
  for (let index = 0; index < length; index++) {
    const inputWithValue: HTMLInputElement = createElement('input') as HTMLInputElement;
    inputWithValue.classList.add('values');
    inputWithValue.dataset.order = `${index}`;
    inputWithValue.type = 'text';
    array.push(inputWithValue);      
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
  createSettings, 
  findElements, 
  setElementsForValues, 
  initValues, 
  setNewData, 
  setNodeValue, 
  diversification
};

export {
  createElement,
  stepBalancing,
  calcDelta,
  convValueNumberToPixel,
  convStepNumberToPixel
}
