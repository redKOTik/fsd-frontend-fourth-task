// import '../styles/app.css';
import $ from 'jquery';

import { View } from '../plugin/mvp/view';

import * as helper from '../plugin/utils/view.functions';

describe('Тестирование вспомогательных функций: ', () => {
    let options: ViewOptions;       
    let view: View;

    const space = 240;

    const spyCreateSlider = jest.spyOn(helper, 'createSlider');   
     
    beforeEach(() => {
        jest.clearAllMocks();

        options = {
          minimumValue: '0',
          maximumValue: '100',
          defaultValue: '50',
          defaultInterval: ['25', '75'],
          showValue: false,
          showSettings: true,
          step: '5',
          orientation: 'Gorizontal',
          mode: 'Single',
          onValueChanged: undefined,
          measurement: '₽'
        };
        
        document.body.innerHTML = '<div data-testid="wrapper"></div>';
        const div: HTMLDivElement = document.querySelector('div') as HTMLDivElement;
        
        const $wrapper = $(div);        
        view = new View($wrapper, options);
    });

    afterEach(() => {
        spyCreateSlider.mockRestore();        
    });

    test('создание вида должно сопровождаться вызовом функции: createSlider', () => { 
       expect(spyCreateSlider).toBeCalledTimes(1);
       expect(view.$view.find('.slider')).toBeDefined();
       expect(document.querySelector('.slider')).toBeInTheDocument();
       expect(document.querySelector('.slider')).toHaveClass('slider');             
    });

    test('проверка функции: initOrientation', () => {
        const selector = options.orientation === 'Gorizontal' ? 'slider__gorizont' : 'slider__vertical';               
        expect(view.$view.find(selector)).toBeDefined();
    });

    test('проверка функции initMode в одиночном режиме', () => {
        expect(view.$view.find('.thumb')).toBeDefined();
    });

    test('проверка функции initMode во множественном режиме', () => {
        options.mode = 'Multiple';
        const selector = options.orientation === 'Gorizontal' ? 'interval__gorizontal' : 'interval__vertical';
        const $testWrapper = $(document.createElement('div') as HTMLDivElement);
        const testView = new View($testWrapper, options);

        expect(testView.$view.find('.interval')).toBeDefined();
        expect(testView.$view.find(selector)).toBeDefined();
        expect(testView.$view.find('.thumb__a')).toBeDefined();
        expect(testView.$view.find('.thumb__b')).toBeDefined();
    });

    test('проверка функции calcDelta', () => {
        expect(helper.calcDelta(options)).toBe(100);
    });

    test('проверка функции stepToPixel', () => {
        expect(helper.stepToPixel(space, helper.calcDelta(options), options)).toBe(12);
    });

    test('функция valueToPixel должна переводить значение метки слайдера из максимального-минимального диапазона в количество пикселей', () => {
        const value: number = helper.valueToPixel(+options.defaultValue, space, helper.calcDelta(options), options);
        expect(value).toEqual(120);
    });
});