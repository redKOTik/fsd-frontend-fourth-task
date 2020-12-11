type StyleKeys = {
  offset: 'offsetWidth' | 'offsetHeight',
  position: 'left' | 'top',
  props: 'width' | 'height',
  client: 'clientX' | 'clientY'
}

class Component {
  styleKeys: StyleKeys;

  constructor(protected type: Orientation, protected mode: Mode) {
    this.styleKeys = this.denoteKeyValuesFromType();
  }

  isHorizontal(): boolean {
    return this.type === 'Horizontal';
  }

  isMultiple(): boolean {
    return this.mode === 'Multiple';
  }

  denoteKeyValuesFromType(): StyleKeys {
    if (this.isHorizontal())
      return {
        offset: 'offsetWidth',
        position: 'left',
        props: 'width',
        client: 'clientX'
      };
    return {
      offset: 'offsetHeight',
      position: 'top',
      props: 'height',
      client: 'clientY'
    };
  }

  getPropValueFromCoordinates(element: HTMLElement): number {
    const coordinates: JQuery.Coordinates | undefined = $(element).offset();
    return coordinates !== undefined 
      ? coordinates[this.styleKeys.position] 
      : 0;
  }

  correctValue(): number {
    return this.isHorizontal() ? 2 : 1;
  }
}

export default Component;