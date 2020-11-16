import $ from 'jquery';

import { View } from '../plugin/mvp/view';

describe('Тестирование Вида: ', () => {
    let options: ViewOptions;
    let view: View;

    beforeEach(() => {
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

        const wrapper: HTMLDivElement = document.createElement('div') as HTMLDivElement;
        view = new View($(wrapper), options);
    });

    test('вид должен существовать и быть типом function', () => {
      expect(View).toBeDefined();
      expect(typeof View).toBe('function');
    });

    test('экземпляр вида должен содержать метод обновления вида: updateView, свойства:', () => {
      expect(view.updateView).toBeDefined();
    });

    test('вид должен иметь элемент с классом slider:', () => {
      const slider = view.$view.find('.slider');      
      expect(slider).toBeDefined();
    });


});