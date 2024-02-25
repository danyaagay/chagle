import { useCallback, useRef, useState } from "react";

interface LongPressOptions {
    shouldPreventDefault?: boolean;
    delay?: number;
}

const useLongPress = (
    onLongPress: (event: TouchEvent) => void,
    onClick: (event: TouchEvent) => void,
    { shouldPreventDefault = false, delay = 300 }: LongPressOptions = {}
) => {
    const [longPressTriggered, setLongPressTriggered] = useState(false);
    const timeout = useRef<number | undefined>();
    const target = useRef<EventTarget | null>(null);

    const start = useCallback(
        (event: TouchEvent) => {
            if (shouldPreventDefault && event.target) {
                (event.target as HTMLElement).addEventListener("touchend", (event: Event) => {
                    event.preventDefault();
                }, {
                    passive: false
                } as AddEventListenerOptions);
                target.current = event.target as HTMLElement;
            }
            timeout.current = window.setTimeout(() => {
                onLongPress(event);
                setLongPressTriggered(true);
            }, delay);
        },
        [onLongPress, delay, shouldPreventDefault]
    );

    const clear = useCallback(
        (event: TouchEvent, shouldTriggerClick = true) => {
            timeout.current && window.clearTimeout(timeout.current);
            shouldTriggerClick && !longPressTriggered && onClick(event);
            setLongPressTriggered(false);
            if (shouldPreventDefault && target.current) {
                target.current.removeEventListener("touchend", (event: Event) => {
                    event.preventDefault();
                });
            }
        },
        [shouldPreventDefault, onClick, longPressTriggered]
    );

    return {
        onMouseDown: (e: TouchEvent) => start(e),
        onTouchStart: (e: TouchEvent) => start(e),
        onMouseUp: (e: TouchEvent) => clear(e),
        onMouseLeave: (e: TouchEvent) => clear(e, false),
        onTouchEnd: (e: TouchEvent) => clear(e, false),
        onTouchMove: (e: TouchEvent) => clear(e, false), // Do not trigger click here
    };
};

const isTouchEvent = (event: Event): event is TouchEvent => {
    return "touches" in event;
};

const preventDefault = (event: TouchEvent) => {
    if (!isTouchEvent(event)) return;

    if (event.touches.length < 2 && event.preventDefault) {
        event.preventDefault();
    }
};

export default useLongPress;
