import * as helper from '../plugin/utils/view.functions';

describe('Тестирование вспомогательных функций: ', () => {
    let options: ViewOptions;       
    
    beforeEach(() => {
        options = {
          minimumValue: '0',
          maximumValue: '100',
          defaultValue: '50',
          defaultInterval: ['25', '75'],
          showValue: false,
          showSettings: true,
          step: '5',
          orientation: 'Horizontal',
          mode: 'Single',
          onValueChanged: undefined,
          measurement: '₽',
          showScale: false
        };
    });

    // ViewOptions => number
    test('проверка функции calcDelta', () => {
        expect(helper.calcDelta(options)).toBe(100);
    });

    // (number, number, number) => number
    test('проверка функции stepBalancing', () => {
        const inputChange = 10;
        const inputStep = 10;

        expect(helper.stepBalancing(inputChange, inputStep)).toBe(10);
    });

    // (number, number) => number
    test('проверка функции convStepNumberToPixel', () => {
        const inputUnitMeasure = 20;
        const inputStep = 10;
        expect(helper.convStepNumberToPixel(inputStep, inputUnitMeasure)).toBe(200);
    });

    // (number, number, number) => number
    test('проверка функции convValueNumberToPixel', () => {
        const inputUnitMeasure = 20;
        const inputValue = 10;
        const inputMinimumValue = -20;
        expect(helper.convValueNumberToPixel(inputValue, inputUnitMeasure, inputMinimumValue )).toBe(600);
    });

    // (string, string | string[]) => HTMLElement
    test('проверка функции createElement', () => {
        const inputTagName = 'div';
        const inputClassName = 'slider';
        const outputElement = helper.createElement(inputTagName, inputClassName);

        expect(outputElement).toHaveClass(inputClassName);
        expect(outputElement.tagName).toEqual(inputTagName.toUpperCase());
    });
   
});