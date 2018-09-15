import { Injectable, Output } from "@angular/core";
import { AVGService } from "../../common/avg-service";
import { EventEmitter } from "events";
import { Subject } from "rxjs/Subject";

import * as gsap from "gsap";
import { AnimationUtils } from "../../common/animations/animation-utils";

@Injectable()
export class TransitionLayerService extends AVGService {
  public static FullScreenClickListener: Subject<any> = new Subject<any>();
  private static _isLockPointerEvent = false;
  private static CONTAINER_ELEMENT = "#transition-container";

  @Output() change: EventEmitter = new EventEmitter();

  public static isLockPointerEvents(): boolean {
    return TransitionLayerService._isLockPointerEvent;
  }

  public static lockPointerEvents() {
    this._isLockPointerEvent = true;
    gsap.TweenLite.to("#avg-transition", 0, {
      pointerEvents: "none"
    });
  }

  public static releasePointerEvents() {
    this._isLockPointerEvent = false;
    gsap.TweenLite.to("#avg-transition", 0, {
      pointerEvents: "all"
    });
  }

  public static fadeTo(to: number = 1,
                       duration: number = 500,
                       complete?: () => void) {
    AnimationUtils.fadeTo("#transition-container", duration, to, complete);
  }

  public static transitionTo(color: string, opacity: number, duration: number) {
    return new Promise((resolve, reject) => {
      AnimationUtils.to("TransitionTo", TransitionLayerService.CONTAINER_ELEMENT, duration, {
        backgroundColor: color,
        opacity: opacity
      }, () => {
        resolve();
      });
    });
  }

  public static flashScreen(color: string,
                            opacity: number = 1,
                            duration: number = 10,
                            count = 1 // -1 is loop
  ) {
    if (count === 0) {
      return;
    }

    const play = () => {
      return new Promise((resolve, reject) => {
        gsap.TweenLite.to("#transition-container", duration, {
          backgroundColor: color,
          opacity: opacity,
          duration: duration / 2
        }).eventCallback("onComplete", () => {
          gsap.TweenLite.to("#transition-container", duration, {
            color: "#FFFFFF",
            opacity: 0,
            duration: duration / 2
          }).eventCallback("onComplete", () => {
            resolve();
          });
        });
      });
    };

    const f = async () => {
      await play().then(
        () => {
          if (count === -1) {
            f();
          } else {
            count--;
            if (count > 0) {
              f();
            }
          }
        },
        _ => {
        }
      );
    };

    f();
  }
}
