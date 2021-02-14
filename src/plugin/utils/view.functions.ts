import $ from 'jquery';

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
  return (value * unitMeasure) - (minimumValue * unitMeasure);
}

// функции для создания и обновления вида настроек
function createSettings(): HTMLDivElement {
  const htmlSettings = `            
        <div class="settings__info">
            <label>
                <input name="info" class="info" type="checkbox">
                <div class="instead_label">off/on labels</div>
            </label>
        </div>
        <div class="settings__scale">
            <label>
                <input name="scale" class="scale-input" type="checkbox">
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
                <input name="values" class="values" data-order="0" type="text">
            </fieldset>
        </div>
        <div class="settings__range">
            <fieldset>
            <legend>Границы</legend>
            <input class="range" name="minimum" type="text" data-order="0" placeholder="Минимальное значение">
            <input class="range" name="maximum" type="text" data-order="1" placeholder="Максимальное значение"></fieldset>
        </div>`;
  const divSettings: HTMLDivElement = createElement('div', 'settings') as HTMLDivElement;
  divSettings.insertAdjacentHTML('afterbegin', htmlSettings);
  return divSettings;
}

function findInput(inputs: NodeListOf<HTMLInputElement>): HTMLInputElement | undefined{
  let active;
  inputs.forEach(input => {
    if (input.checked) {
      active = input;
    }
  });

  return active;
}

function findElements(view: HTMLDivElement): Elements {
  const showValueInput: HTMLInputElement = view.querySelector('.settings__info input') as HTMLInputElement;
  const showScaleInput: HTMLInputElement = view.querySelector('.settings__scale input') as HTMLInputElement;
  const orientationInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__view input');
  const modeInputs: NodeListOf<HTMLInputElement> = view.querySelectorAll('.settings__mode input');
  const stepInput: HTMLInputElement = view.querySelector('.settings__item .step') as HTMLInputElement;
  const minInput: HTMLInputElement = view.querySelector('.settings__range .range[name="minimum"]') as HTMLInputElement;
  const maxInput: HTMLInputElement = view.querySelector('.settings__range .range[name="maximum"]') as HTMLInputElement;
  const valuesInput: HTMLInputElement = view.querySelector('.settings__values .values') as HTMLInputElement;

  return {
    showValueInput,
    showScaleInput,
    orientationInputs,
    modeInputs,
    stepInput,
    minInput,
    maxInput,
    valuesInput: [valuesInput]
  }
}

function makeValuesOfMode(inputs: HTMLInputElement[], mode: Mode): void {
  const $fisrt = $(inputs[0]);
  const $parent = $fisrt.parent();
  
  if (mode === 'Single' && inputs.length > 1) {
    $(inputs[1]).remove();
    inputs.pop();
  }

  if (mode === 'Multiple' && inputs.length === 1) {
    const second = cloneNode($fisrt);
    $parent.append(second);
    inputs.push(second);
  }
}

function initValues(mode: Mode, values: HTMLInputElement[], defaultValue: string, defaultInterval?: [string, string] | IntervalData): void {
  if (mode === 'Single') {    
    values[0].value = defaultValue;
  } else {
    if (defaultInterval) {
      if (defaultInterval instanceof Array) {
        values[0].value = defaultInterval[0];
        values[1].value = defaultInterval[1];
      } else {
        values[defaultInterval.index].value = defaultInterval.value;
      } 
    }       
  }
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

function cloneNode($input: JQuery): HTMLInputElement {
  const clone = $input.clone()[0] as HTMLInputElement;
  clone.dataset.order = `${1}`;
  return clone;
}

function createElement(tag: string, className?: string | string[]): HTMLElement {
  const element: HTMLElement = document.createElement(tag);

  if (className && typeof className === 'string') element.classList.add(className);
  else if (className) element.classList.add(...className);

  return element;
}

function computeDuration(main: HTMLDivElement): boolean {

  const inputs = main.querySelectorAll('input');

  if (inputs.length > 1) {
    const correctInterval = (+inputs[1].value - +inputs[0].value) > 0;    
    return correctInterval;
  } else {
    return true;
  }
}

export { 
  createSettings, 
  findElements, 
  makeValuesOfMode, 
  initValues,   
  setNodeValue, 
  diversification,
  computeDuration,
  findInput
};

export {
  createElement,
  stepBalancing,
  calcDelta,
  convValueNumberToPixel,
  convStepNumberToPixel
}
