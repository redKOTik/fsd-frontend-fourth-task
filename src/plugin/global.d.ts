type HandleOptions = {
    index: 0 | 1,
    shift: number,
    ownSpace: {
      start: number,
      end: number
    }
};

type HandleEvent = (options: HandleOptions, event: MouseEvent) => void;

type Unsubables = {
  unsubscribe: () => void 
};
type Observer = (data: {[key: string]: any}) => void;
type Emmiter = {
  [key: string]: Observer []
}