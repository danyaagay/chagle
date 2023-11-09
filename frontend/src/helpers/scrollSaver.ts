import scrollRef from '../components/InfiniteBox4';
import { IS_SAFARI } from '../environment/userAgent';
import getVisibleRect from './dom/getVisibleRect';
import reflowScrollableElement from './dom/reflowScrollableElement';

let USE_REFLOW = false;

if (IS_SAFARI) {
  try {
    const match = navigator.userAgent.match(/Version\/(.+?) /);
    USE_REFLOW = +match[1] < 15.4;
  } catch (err) {
    USE_REFLOW = true;
  }
}

export default class ScrollSaver {
  private scrollHeight: number;
  private scrollHeightMinusTop: number;
  private scrollTop: number;
  private clientHeight: number;
  private elements: { element: HTMLElement; rect: DOMRect }[];

  constructor(
    private scrollable: Scrollable,
    private query: string,
    private reverse: boolean
  ) {}

  private get container() {
    return this.scrollable.container;
  }

  public getSaved() {
    return {
      scrollHeight: this.scrollHeight,
      scrollTop: this.scrollTop,
      clientHeight: this.clientHeight,
    };
  }

  public findElements() {
    if (!this.query) return [];

    const { container } = this;
    const containerRect = container.getBoundingClientRect();
    const bubbles = Array.from(container.querySelectorAll(
      this.query,
    )) as HTMLElement[];
    const elements: ScrollSaver['elements'] = [];
    
    for (const bubble of bubbles) {
      const elementRect = bubble.getBoundingClientRect();
      const visibleRect = getVisibleRect(
        bubble,
        container,
        undefined,
        elementRect,
        containerRect,
      );
      
      if (visibleRect) {
        elements.push({ element: bubble, rect: elementRect });
        // break; // find first
      } else if (elements.length) { // find last
        break;
      }
    }

    if (!elements.length) {
      const bubble = bubbles[0];
      if (bubble) {
        elements.push({ element: bubble, rect: bubble.getBoundingClientRect() });
      }
    }

    return elements;
  }

  public replaceSaved(from: HTMLElement, to: HTMLElement) {
    if (!this.elements) {
      return;
    }

    const idx = this.elements.findIndex(({ element }) => from === element);
    if (idx !== -1) {
      this.elements[idx].element = to;
    }
  }

  public findAndSetElements() {
    this.elements = this.findElements();
  }

  public save() {
    this.findAndSetElements();
    this._save();
  }

  private _save() {
    const { scrollTop, scrollHeight, clientHeight } = this.container;
    
    this.scrollHeight = scrollHeight;
    this.scrollTop = scrollTop;
    this.clientHeight = clientHeight;
    this.scrollHeightMinusTop = this.reverse ? scrollHeight - scrollTop : scrollTop;
  }

  private onRestore(useReflow?: boolean) {
    if (USE_REFLOW && useReflow) {
      reflowScrollableElement(this.container);
    }

    this.scrollable.onSizeChange();
  }

  private setScrollTop(newScrollTop: number, useReflow?: boolean) {
    this.scrollable.setScrollPositionSilently(this.scrollTop = newScrollTop);
    this.onRestore(useReflow);
  }

  public restore(useReflow?: boolean) {
    const { scrollPosition: scrollTop, scrollSize: scrollHeight } = this.scrollable;
    this.scrollHeight = scrollHeight;

    if (!this.elements.length) {
      this.setScrollTop(0, useReflow);
      return;
    }

    let anchor: ScrollSaver['elements'][0];
    
    anchor = this.elements[this.elements.length - 1];
    
    if (!anchor?.element?.parentElement) {
      this.findAndSetElements();
      anchor = this.elements[this.elements.length - 1];
      
      if (!anchor) {
        this._restore(useReflow);
        return;
      }
    }

    const { element, rect } = anchor;
    const newRect = element.getBoundingClientRect();
    const diff = newRect.bottom - rect.bottom;
    this.setScrollTop(scrollTop + diff, useReflow);
  }

  public _restore(useReflow?: boolean) {
    const { scrollHeightMinusTop: previousScrollHeightMinusTop } = this;

    const scrollHeight = this.scrollHeight;

    const newScrollTop = this.reverse ? scrollHeight - previousScrollHeightMinusTop : previousScrollHeightMinusTop;

    this.setScrollTop(newScrollTop, useReflow);
  }
}
