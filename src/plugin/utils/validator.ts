/**
 * @class Validator
 *
 * Валидация полей с настройками
 */
class Validator {
  static REQUIRED = 'REQUIRED';
  static MAX_LENGTH = 'MAX_LENGTH';
  static MAX_VALUE = 'MAX_VALUE';
  static MIN_VALUE = 'MIN_VALUE';
  static ONLY_NUMBERS = 'ONLY_NUMBERS';
  static CORRECT_INTERVAL = 'CORRECT_INTERVAL';

  wrapper: HTMLDivElement | null = null;

  public validate(element: HTMLInputElement, flag: string, validatorValue?: string): boolean {

    const value = validatorValue ? +validatorValue : -1;

    const isLengthValid = element.value.trim().length <= value;
    const isRequired = element.value.trim().length > 0;
    const isMaxValid = +element.value.trim() <= value;
    const isMinValid = +element.value.trim() >= value;
    const isCorrect = value > 0

    switch (flag) {
      case Validator.MAX_LENGTH:
        return isLengthValid;
      case Validator.REQUIRED:

        return isRequired;
      case Validator.MAX_VALUE:

        return isMaxValid;
      case Validator.MIN_VALUE:

        return isMinValid;
      case Validator.ONLY_NUMBERS:
        return this.checkFields(element);
      case Validator.CORRECT_INTERVAL:
        return isCorrect;
      default:
        return false;
    }
  }

  public errorHandler($object: JQuery, field: HTMLInputElement | NodeListOf<HTMLInputElement>, message: string, type: string, value?: string): boolean {
    let isValid = true;
    const fieldsValid: Array<boolean> = [];

    if (field instanceof HTMLInputElement) {
      isValid = this.validate(field, type, value);
    } else {
      field.forEach((element) => {
        const valid = this.validate(element, type, value);
        if (!valid) {
          isValid = false;
        }
        fieldsValid.push(valid);
      });
    }



    if (!isValid) {
      if (type === Validator.REQUIRED) {
        $object.addClass('slider_disabled');
        if (field instanceof HTMLInputElement) {
          field.setAttribute('placeholder', message);
          field.dataset.valid = 'false';
        } else {
          fieldsValid.forEach((value, index) => {
            if (!value) {
              field[index].setAttribute('placeholder', message);
              field[index].dataset.valid = 'false';
            }
          });
        }

      } else if ([Validator.MAX_VALUE, Validator.MIN_VALUE, Validator.MAX_LENGTH, Validator.ONLY_NUMBERS, Validator.CORRECT_INTERVAL].includes(type)) {
        $object.addClass('slider_disabled');
        if (field instanceof HTMLInputElement) {
          this.showMessageTemporally($object, field, message, type, 4500);
        } else {
          fieldsValid.forEach((value, index) => {
            if (!value) {
              this.showMessageTemporally($object, field[index], message, type, 4500);
            }
          });
        }
      }
    } else {
      if (field instanceof HTMLInputElement) {
        field.dataset.valid = 'true';
      } else {
        fieldsValid.forEach((_, index) => {
          field[index].dataset.valid = 'true';
        });
      }

      if (type === Validator.CORRECT_INTERVAL && field instanceof HTMLInputElement) {
        field.parentNode?.childNodes.forEach((e: ChildNode) => {
          if (e instanceof HTMLInputElement) {
            e.dataset.valid = 'true';
          }
        });
      }
    }
    if ($object.parent().find('[data-valid="false"]').length === 0) {
      $object.removeClass('slider_disabled');
    }

    return isValid;
  }

  public showMessageTemporally($object: JQuery, field: HTMLInputElement, message: string, dataType: string, hideTime: number): void {
    this.showMessage($object, field, message, dataType);
    setTimeout(this.hideMessage.bind(this, $object, field, dataType), hideTime);
  }

  public hideMessage($object: JQuery, field: HTMLInputElement, dataType: string): void {
    if (this.wrapper?.querySelectorAll('[data-show="true"]').length === 1) {
      this.wrapper.remove();
      this.wrapper = null;
    } else {
      const span: HTMLSpanElement = $object[0].parentNode?.querySelector(`.${'default' || field.className}-${dataType.toLowerCase()}`) as HTMLSpanElement;
      if (span) {
        span.dataset.show = 'false';
        setTimeout(() => {
          span.remove();
        }, 1000);
      }
    }
  }

  public showMessage($object: JQuery, field: HTMLInputElement, message: string, dataType: string): void {
    console.log(this.wrapper);
    if (this.wrapper === null) {
      this.wrapper = this.createContainer();
    }

    $object[0].insertAdjacentElement('afterend', this.wrapper);

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