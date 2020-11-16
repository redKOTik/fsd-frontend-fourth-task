import $ from 'jquery';

import { Validator } from '../plugin/utils/validator';

describe('Тестирование Валидации: ', () => {

    const input: HTMLInputElement = document.createElement('input');
        
    let $object: JQuery;
    let validator: Validator;    

    beforeEach(() => {
        const div = document.createElement('div');
        $object = $(div);
        validator = new Validator();
    });

    afterEach(() => {
        jest.clearAllMocks();     
    });

    describe('Тестирование метода validate класса Validator', () => {
        test('Метод должен определять корректна ли длина значения поля ввода', () => {
            input.value = 'length';
            const isValid = validator.validate(input, Validator.MAX_LENGTH, '6');
            expect(isValid).toBeTruthy();
            
            input.value = 'circumference';
            const notIsValid = validator.validate(input, Validator.MAX_LENGTH, '6');
            expect(notIsValid).toBeFalsy();
        });

        test('Метод должен определять, что поле ввода не пустое', () => {
            input.value = '';
            const notIsValid = validator.validate(input, Validator.REQUIRED);
            expect(notIsValid).toBeFalsy();
            
            input.value = 'circumference';
            const isValid = validator.validate(input, Validator.REQUIRED);
            expect(isValid).toBeTruthy();
        });

        test('Метод должен определять, что значение в поле ввода не меньше установленного ограничения', () => {
            input.value = '9';
            const notIsValid = validator.validate(input, Validator.MIN_VALUE, '10');
            expect(notIsValid).toBeFalsy();
            
            input.value = '11';
            const isValid = validator.validate(input, Validator.MIN_VALUE, '10');
            expect(isValid).toBeTruthy();
        });

        test('Метод должен определять, что значение в поле ввода не больше установленного ограничения', () => {
            input.value = '11';
            const notIsValid = validator.validate(input, Validator.MAX_VALUE, '10');
            expect(notIsValid).toBeFalsy();
            
            input.value = '9';
            const isValid = validator.validate(input, Validator.MAX_VALUE, '10');
            expect(isValid).toBeTruthy();
        });

        test('Метод должен определять, что значение в поле ввода только число со знаком или без', () => {
            input.value = '11t';
            const notIsValid = validator.validate(input, Validator.ONLY_NUMBERS);
            expect(notIsValid).toBeFalsy();
            
            input.value = '9';
            let isValid = validator.validate(input, Validator.ONLY_NUMBERS);
            expect(isValid).toBeTruthy();

            input.value = '-15';
            isValid = validator.validate(input, Validator.ONLY_NUMBERS);
            expect(isValid).toBeTruthy();
        });

        test('Метод с аргументом flag в значение "ONLY_NUMBERS" должен вызывать фукнцию checkFields', () => {
            const spyCheckFields = jest.spyOn(validator, 'checkFields');
            input.value = '11t';
            validator.validate(input, Validator.ONLY_NUMBERS);
            expect(spyCheckFields).toHaveBeenCalled();
            expect(spyCheckFields).toHaveBeenCalledWith(input);
        });

        test('Метод должен определять, что значение установленного ограничения больше 0', () => {
            let notIsValid = validator.validate(input, Validator.CORRECT_INTERVAL, '-11');
            expect(notIsValid).toBeFalsy();

            notIsValid = validator.validate(input, Validator.CORRECT_INTERVAL, '0');
            expect(notIsValid).toBeFalsy();

            const isValid = validator.validate(input, Validator.CORRECT_INTERVAL, '11');
            expect(isValid).toBeTruthy();
        });

        test('Метод должен возвращать false, если переданный flag не определен в классе', () => {
            let notIsValid = validator.validate(input, 'test');
            expect(notIsValid).toBeFalsy();
        });
    });
    
    describe('Тестирование метода showMessage класса Validator', () => {
        test('Метод не должен создавать контейнер для сообщений, если он уже существует', () => {
            const spyCreateWrapper = jest.spyOn(validator, 'createContainer');
            validator.wrapper = validator.createContainer();
            const message: string = 'test';
            document.body.insertAdjacentElement('afterbegin', $object[0]);
            validator.showMessage($object, input, message, Validator.MIN_VALUE);
            expect(spyCreateWrapper).toHaveBeenCalledTimes(1);
            expect(document.body).toContainElement(validator.wrapper);
        });
        
        test('Метод должен создавать контейнер для сообщений с классом popup-container и сообщение с текстом ошибки.', () => {
            const spyCreateWrapper = jest.spyOn(validator, 'createContainer');
            const message: string = 'test';
            document.body.insertAdjacentElement('afterbegin', $object[0]);
            validator.showMessage($object, input, message, Validator.MIN_VALUE);
            const wrapper: HTMLDivElement = document.body.querySelector('.popup-container') as HTMLDivElement;
            expect(spyCreateWrapper).toHaveBeenCalled();        
            expect(wrapper).toBeDefined();
            expect(wrapper.querySelector('span')?.textContent).toEqual(message);                
        });        
    });

    describe('Тестирование метода hideMessage класса Validator', () => {
        test('Метод должен удалить контейнер с сообщением, если оно осталось одно', () => {
            validator.wrapper = validator.createContainer();
            const message: string = 'test';
            document.body.insertAdjacentElement('afterbegin', $object[0]);
            validator.showMessage($object, input, message, Validator.MIN_VALUE);
            expect(validator.wrapper.childNodes.length).toEqual(1);
            setTimeout(() => {
                validator.hideMessage($object, input, Validator.MIN_VALUE);
                expect(validator.wrapper).toBeNull();
            }, 300);
        });

        test('Метод должен удалить сообщение из контейнера, если их количество больше 1. Сообщение должно быть корректно удалено по типу проверки.', () => {
            validator.wrapper = validator.createContainer();
            const message: string = 'test';
            document.body.insertAdjacentElement('afterbegin', $object[0]);
            validator.showMessage($object, input, message, Validator.MIN_VALUE);
            validator.showMessage($object, input, message, Validator.MAX_VALUE);
            expect(validator.wrapper.childNodes.length).toEqual(2);
            setTimeout(() => {
                validator.hideMessage($object, input, Validator.MAX_VALUE);
                expect(validator.wrapper).toBeDefined();
                expect(validator.wrapper?.childNodes.length).toEqual(1);
                expect(validator.wrapper?.querySelector('.default-min-value')).toBeDefined();
            }, 300);
        });
    });

    describe('Тестирование метода errorHandler класса Validator', () => {
        test('Метод должен блокировать возможность изменять значение слайдера, при невалидном значении какого-либо параметра настроек', () => {
            input.value = '';
            $object.append(input);
            $(document.body).append($object);
            validator.errorHandler($object, input, 'test', Validator.REQUIRED);
            expect($object[0]).toHaveClass('slider_disabled');
        });
    });
});