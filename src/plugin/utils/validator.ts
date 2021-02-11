import {
  computeDuration
} from '../utils/view.functions';

type validator = (value: string) => boolean;
type limitValidator = (limit: number) => validator;
type intervalValidator = (main: HTMLDivElement) => validator

type validatorFns = {
  required?: validator,
  max?: validator,
  min?: validator,
  interval?: validator
}

type errors = {
  [key: string]: boolean
}

type Field = {
  tag: string,
  validators: string[],
  validatorFns?: validatorFns,
  errors?: errors
}

type globalInstructions = {
  min: number,
  max: number
}

type Instructions = Field[];

/**
 * @class Validator
 *
 * Валидация полей с настройками
 */
class Validator {
  
  static required: validator = val => !!val;
  static max: limitValidator = maxNum => (val: string): boolean => +val <= maxNum;
  static min: limitValidator = minNum => (val: string): boolean => +val >= minNum;
  static interval: intervalValidator = main => (_: string): boolean => computeDuration(main);

  formIsValid = true;
  wrapper: HTMLDivElement | null = null;

  constructor(public main: HTMLDivElement, public instructions: Instructions, public globalInstructions: globalInstructions) {
    this.setFunctions(instructions);    
  }

  setFunctions(instructions: Instructions): void {
    instructions.forEach(field => {

      if (field.validators.length > 0) {
        field.validatorFns = {} as validatorFns;
        field.errors = {}
      }   

      field.validators.forEach(validator => {
        if (validator === 'required') {
          if (field.validatorFns) {
            field.validatorFns.required = Validator.required;
          }
        }

        if (validator === 'max') {
          if (field.validatorFns) {
            field.validatorFns.max = Validator.max(this.globalInstructions.max);
          }
        }

        if (validator === 'min') {
          if (field.validatorFns) {
            if (field.tag === 'step') {
              field.validatorFns.min = Validator.min(1);
            } else {
              field.validatorFns.min = Validator.min(this.globalInstructions.min);
            }            
          }
        }
        
        if (validator === 'interval') {
          if (field.validatorFns) {
            field.validatorFns.interval = Validator.interval(this.findInputsWrapper(field.tag));
          }
        } 
      });      
    });
  }

  findInputsWrapper(tag: string): HTMLDivElement {
    return this.main.querySelector(`.settings__${tag}`) as HTMLDivElement;
  } 

  validate(tag: string, element: HTMLInputElement): boolean {
    this.formatField(element);
    let accIsValid = true;
    const field = this.instructions.find(field => field.tag === tag);
    const validators = field?.validatorFns;
    const index = element.dataset.order ? '-' + element.dataset.order : '';
    
    if (field) {
      if (validators) {
        const keys = Object.keys(validators) as Array<keyof validatorFns>;
        keys.forEach(key => {
          const fn = validators[key];
          if (fn) {          
            if (!fn(element.value)) {
              if (field.errors) {
                field.errors[key+index] = true;
              }            
              accIsValid = false;
              this.errorHandler(element, key);
            } else {

              if (key === 'interval') {
                if (field.errors && field.errors[key+'-0']) {
                  delete field.errors[key+'-0'];
                }

                if (field.errors && field.errors[key+'-1']) {
                  delete field.errors[key+'-1'];
                }
              } else {
                if (field.errors && field.errors[key+index]) {
                  delete field.errors[key+index];
                }
              }              
            }
          }
        });
      }
    }

    accIsValid
      ? this.makeFieldIsValid(element) 
      : this.makeFieldNotValid(element);
      
    this.computeFormState(element);
    
    if (this.formIsValid) {
      const inputs = this.main.querySelectorAll('input[data-valid="false"]');
      if (inputs) {
        inputs.forEach(input => {
          if (input instanceof HTMLInputElement) {
            input.dataset.valid = 'true'
          }
        });
      }      
    }
    return this.formIsValid;    
  }

  computeFormState(field: HTMLInputElement): void {
    let accIsValid = true;

    this.instructions.forEach(field => { 
      if (field.errors) {
        const count = Object.keys(field.errors).length;
        if (count > 0) {
          accIsValid = false;
        }
      }     
      
    });

    this.formIsValid = accIsValid;    
    this.toggleSliderState(field);
    this.showValidatorState();
  }

  toggleSliderState(field: HTMLInputElement): void {
    const wrapper = field.closest('.settings')?.nextElementSibling;
    const slider = wrapper?.querySelector('.slider')
    slider?.classList.toggle('slider_disabled', !this.formIsValid);
  }

  makeFieldNotValid(field: HTMLInputElement): void  {
    field.dataset.valid = 'false';
  }

  makeFieldIsValid(field: HTMLInputElement): void  {
    field.dataset.valid = 'true';
  }

  makeMessage(value: string, type: string, key: string): string {
    let message = '';

    switch(type) {
      case 'minimum':
      case 'maximum':  
        message = `значение ${value} выходит за установленные границы (${key})`;
        return message;
      case 'values':
        message = `значение ${value} не допустимо (${key})`;
        return message;
      case 'step':
        message = `значение ${value} не допустимо (${key})`;
        return message;
      default:
        return message;    
    }
  }

  errorHandler(field: HTMLInputElement, key: string): void {

    const text = field.closest('fieldset')?.querySelector('legend')?.textContent;   

    switch(key) {
      case 'min': 
        this.showMessageTemporally(field, this.makeMessage(field.value, field.name, key), field.name, 4000);
        return;
      case 'max': 
        this.showMessageTemporally(field, this.makeMessage(field.value, field.name, key), field.name, 4000);
        return;  
      case 'required':        
        this.showMessageTemporally(field, `поле '${text as string}' является обязательным и должно быть заполнено`, field.name, 4000);
        return;
      case 'interval':        
      this.showMessageTemporally(field, this.makeMessage(field.value, field.name, key), field.name, 4000);
        return;  
    }

  }

  showMessageTemporally(field: HTMLInputElement, message: string, dataType: string, hideTime: number): void {
    const popup = this.showMessage(field, message, dataType);
    setTimeout(this.hideMessage.bind(this, popup), hideTime);
  }

  hideMessage(popup: HTMLSpanElement): void {
    if (this.wrapper?.querySelectorAll('[data-show="true"]').length === 1) {
      this.wrapper.remove();
      this.wrapper = null;
    } else {
      if (popup) {
        popup.dataset.show = 'false';
        setTimeout(() => {
          popup.remove();
        }, 1000);
      }
    }
  }

  showMessage(field: HTMLInputElement, message: string, dataType: string): HTMLSpanElement {
    console.log(this.wrapper);
    if (this.wrapper === null) {
      this.wrapper = this.createContainer();
    }

    document.body.insertAdjacentElement('beforeend', this.wrapper);

    const span = document.createElement('span');
    span.textContent = message;
    span.classList.add('warning', `${'default' || field.className}-${dataType.toLowerCase()}`);
    span.dataset.show = 'false';    

    this.wrapper?.appendChild(span);
    setTimeout(() => {
      span.dataset.show = 'true';
    }, 250)

    return span;
  }

  formatField(field: HTMLInputElement): void {
    //const onlyNumbersRegExp = /^[\d|-]\d*$/;
    const onlyNumbersRegExp = /[^0-9]/g;
    const specSymbolRegExp = /[^-]/g;

    const symbol = field.value.substring(0, 1);
    const value = field.value;

    field.value = (+(symbol.replace(specSymbolRegExp, '') + value.replace(onlyNumbersRegExp, ''))).toString();

  }

  createContainer(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('popup-container');
    return wrapper;
  }

  showValidatorState(): void {
    console.log('state', this.formIsValid, this.instructions);
  }
}

export { Validator };