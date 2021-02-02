import {
  computeDuration
} from '../utils/view.functions';

type validator = (value: string) => boolean;
type limitValidator = (limit: number) => validator;
type intervalValidator = (inputs: NodeListOf<HTMLInputElement>) => validator

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
  static interval: intervalValidator = inputs => (_: string): boolean => computeDuration(inputs) > 0;

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
            field.validatorFns.min = Validator.min(this.globalInstructions.min);
          }
        }
        
        if (validator === 'interval') {
          if (field.validatorFns) {
            field.validatorFns.interval = Validator.interval(this.findInputs(field.tag));
          }
        } 
      });      
    });
  }

  findInputs(tag: string): NodeListOf<HTMLInputElement> {
    return this.main.querySelectorAll(`.${tag}`) as NodeListOf<HTMLInputElement>;
  } 

  validate(tag: string, element: HTMLInputElement): boolean {
    this.formatField(element);
    let accIsValid = true;
    const field = this.instructions.find(field => field.tag === tag);
    const validators = field?.validatorFns;
    
    if (field) {
      if (validators) {
        const keys = Object.keys(validators) as Array<keyof validatorFns>;
        keys.forEach(key => {
          const fn = validators[key];
          if (fn) {          
            if (!fn(element.value)) {
              if (field.errors) {
                field.errors[key] = true;
              }            
              accIsValid = false;
              this.makeFieldNotValid(element);
              this.errorHandler(element, key);
            } else {
              if (field.errors && field.errors[key]) {
                delete field.errors[key];
                this.makeFieldIsValid(element);
              }
            }
          }
        });
      }
    }

    this.computeFormState(element);
    return accIsValid;    
  }

  computeFormState(field: HTMLInputElement): void {
    let accIsValid = true;

    this.instructions.forEach(field => {      
      const count = Object.keys(field.errors!).length;
      if (count > 0) {
        accIsValid = false;
      }
    });

    this.formIsValid = accIsValid;    
    this.toggleSliderState(field);
    this.showValidatorState();
  }

  toggleSliderState(field: HTMLInputElement) {
    const wrapper = field.closest('.settings')?.nextElementSibling;
    const slider = wrapper?.querySelector('.slider')
    slider?.classList.toggle('slider_disabled', !this.formIsValid);
  }

  makeFieldNotValid(field: HTMLInputElement) {
    field.dataset.valid = 'false';
  }

  makeFieldIsValid(field: HTMLInputElement) {
    field.dataset.valid = 'true';
  }

  makeMessage(value: string, type: string): string {
    let message = '';

    switch(type) {
      case 'minimum':
      case 'maximum':  
        message = `значение ${value} выходит за установленные границы`;
        return message;
      case 'values':
        message = `значение ${value} не допустимо`;
        return message;
      case 'step':
        message = `значение ${value} не допустимо`;
        return message;
      default:
        return message;    
    }
  }

  errorHandler(field: HTMLInputElement, key: string): void {

    const text = field.closest('fieldset')?.querySelector('legend')?.textContent;   

    switch(key) {
      case 'min': 
        this.showMessageTemporally(field, this.makeMessage(field.value, field.name), field.name, 4000);
        return;
      case 'max': 
        this.showMessageTemporally(field, this.makeMessage(field.value, field.name), field.name, 4000);
        return;  
      case 'required':        
        this.showMessageTemporally(field, `поле '${text}' является обязательным и должно быть заполнено`, field.name, 4000);
        return;
      case 'interval':        
      this.showMessageTemporally(field, this.makeMessage(field.value, field.name), field.name, 4000);
        return;  
    }

  }

  showMessageTemporally(field: HTMLInputElement, message: string, dataType: string, hideTime: number): void {
    this.showMessage(field, message, dataType);
    setTimeout(this.hideMessage.bind(this, field, dataType), hideTime);
  }

  hideMessage(field: HTMLInputElement, dataType: string): void {
    if (this.wrapper?.querySelectorAll('[data-show="true"]').length === 1) {
      this.wrapper.remove();
      this.wrapper = null;
    } else {
      const span: HTMLSpanElement = field.parentNode?.querySelector(`.${'default' || field.className}-${dataType.toLowerCase()}`) as HTMLSpanElement;
      if (span) {
        span.dataset.show = 'false';
        setTimeout(() => {
          span.remove();
        }, 1000);
      }
    }
  }

  showMessage(field: HTMLInputElement, message: string, dataType: string): void {
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

  showValidatorState() {
    console.log('state', this.formIsValid, this.instructions);
  }
}

export { Validator };