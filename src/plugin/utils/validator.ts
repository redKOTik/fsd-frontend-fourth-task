type validator = (value: string) => boolean;
type limitValidator = (limit: number) => validator;

type validatorFns = {
  required?: validator,
  max?: validator,
  min?: validator
}

type Field = {
  tag: string,
  validators: string[],
  validatorFns?: validatorFns
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

  wrapper: HTMLDivElement | null = null;

  constructor(public instructions: Instructions) {
    this.setFunctions(instructions);
  }

  setFunctions(instructions: Instructions): void {
    instructions.forEach(field => {

      if (field.validators.length > 0) {
        field.validatorFns = {} as validatorFns;
      }

      field.validators.forEach(validator => {
        if (validator === 'required') {
          if (field.validatorFns) {
            field.validatorFns.required = Validator.required;
          }
        }

        if (validator === 'max') {
          if (field.validatorFns) {
            field.validatorFns.max = Validator.max(2000);
          }
        }

        if (validator === 'min') {
          if (field.validatorFns) {
            field.validatorFns.min = Validator.min(-1000);
          }
        }
      });
    });
  }

  public validate(tag: string, element: HTMLInputElement): boolean {
    let accIsValid = true;
    const validators = this.instructions.find(field => field.tag === tag)?.validatorFns;
    
    if (validators) {
      const keys = Object.keys(validators) as Array<keyof validatorFns>;
      keys.forEach((key) => {
        const fn = validators[key];
        if (fn) {          
          if (!fn(element.value)) {
            accIsValid = false;
            this.errorHandler(element, key);
          }
        }
      });
    }

    return accIsValid;    
  }

  public errorHandler(field: HTMLInputElement, key: string): void {
    if (key === 'min') {
      this.showMessageTemporally(field, `значение ${field.value} выходит за установленные границы`, 'range', 4000);
    }
  }

  public showMessageTemporally(field: HTMLInputElement, message: string, dataType: string, hideTime: number): void {
    this.showMessage(field, message, dataType);
    setTimeout(this.hideMessage.bind(this, field, dataType), hideTime);
  }

  public hideMessage(field: HTMLInputElement, dataType: string): void {
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

  public showMessage(field: HTMLInputElement, message: string, dataType: string): void {
    console.log(this.wrapper);
    if (this.wrapper === null) {
      this.wrapper = this.createContainer();
    }

    document.body.insertAdjacentElement('beforeend', this.wrapper);

    const span = document.createElement('span');
    span.textContent = message;
    span.classList.add('warning', `${'default' || field.className}-${dataType.toLowerCase()}`);
    span.dataset.show = 'false';

    field.dataset.valid = 'false';

    this.wrapper?.appendChild(span);
    setTimeout(() => {
      span.dataset.show = 'true';
    }, 250)
  }

  public checkFields(element: HTMLInputElement): boolean {
    const onlyNumbersRegExp = /^[\d|-]\d*$/;
    return onlyNumbersRegExp.test(element.value);
  }

  public createContainer(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.classList.add('popup-container');
    return wrapper;
  }
}

export { Validator };