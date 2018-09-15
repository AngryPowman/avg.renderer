import { ComponentRef, Injectable } from "@angular/core";

import * as avg from "avg-engine/engine";

import { AVGService } from "../../common/avg-service";
import { TextWidgetComponent } from "./widget-component/text-widget.component";
import { ImageWidgetComponent } from "./widget-component/image-widget.component";
import { ScreenWidgetComponent } from "./widget-component/screen-widget.component";

export class WidgetModel {
  public inAnimation: boolean = true;
  public shouldRemoveAfterShow = false;
  public shouldRemoveData: avg.ScreenWidget;

  public onShowAnimationFinished: () => void;
  public onRemoveAnimationFinished: () => void;
}

export class TextWidgetModel extends WidgetModel {
  public data: avg.Subtitle;
  public component: ComponentRef<TextWidgetComponent>;

  constructor(subtitle: avg.Subtitle,
              component: ComponentRef<TextWidgetComponent>) {
    super();
    this.data = subtitle;
    this.component = component;
  }
}

export class ImageWidgetModel extends WidgetModel {
  public data: avg.ScreenImage;
  public component: ComponentRef<ImageWidgetComponent>;

  constructor(image: avg.ScreenImage,
              component: ComponentRef<ImageWidgetComponent>) {
    super();
    this.data = image;
    this.component = component;
  }
}

@Injectable()
export class WidgetLayerService extends AVGService {
  public static textWidgets: TextWidgetModel[] = new Array<TextWidgetModel>();
  public static imageWdigets: ImageWidgetModel[] = new Array<ImageWidgetModel>();

  public static clearAllSubtitle() {
    WidgetLayerService.textWidgets.forEach(widget => {
      widget.component.destroy();
    });

    WidgetLayerService.textWidgets = [];
  }

  public static addWidget(data: avg.ScreenWidget,
                          component: ComponentRef<ScreenWidgetComponent>,
                          widgetType: avg.ScreenWidgetType = avg.ScreenWidgetType.Text,
                          isAsync: boolean = true) {

    const isTextWidgetExists = (id: string) => {
      this.textWidgets.forEach((v) => {
        if (v.data.id === data.id) {
          return true;
        }
      });

      return false;
    }

    const isImageWidgetExists = (id: string) => {
      this.imageWdigets.forEach((v) => {
        if (v.data.id === id) {
          return true;
        }
      });

      return false;
    }


    return new Promise((resolve, reject) => {
      let model: WidgetModel;

      if (widgetType === avg.ScreenWidgetType.Text) {
        const textWidgetComponent = <ComponentRef<TextWidgetComponent>>component;

        model = new TextWidgetModel(
          <avg.Subtitle>data,
          textWidgetComponent
        );

        component.instance.data = data;
        component.changeDetectorRef.detectChanges();

        WidgetLayerService.textWidgets.push(<TextWidgetModel>model);
      } else if (widgetType === avg.ScreenWidgetType.Image) {
        const imageWidgetComponent = <ComponentRef<ImageWidgetComponent>>component;

        model = new ImageWidgetModel(
          <avg.ScreenImage>data,
          imageWidgetComponent
        );

        component.instance.data = data;
        component.changeDetectorRef.detectChanges();

        WidgetLayerService.imageWdigets.push(<ImageWidgetModel>model);
      }

      component.instance.onShowAnimationCallback = () => {
        model.inAnimation = false;

        // Remove if call remove operation in async mode after show animation is done
        if (model.shouldRemoveAfterShow) {
          // Destroy component
          component.instance.onRemoveAnimationCallback = () => {
            component.destroy();
            component = null;

            resolve();
          };

          component.instance.hideWidget(model.shouldRemoveData);
        }


        if (!isAsync) {
          resolve();
        }
      };

      if (isAsync) {
        resolve();
      }
    });
  }

  public static updateSubtitle(id: string, text: string) {
    for (let i = 0; i < WidgetLayerService.textWidgets.length; ++i) {
      if (WidgetLayerService.textWidgets[i].data.id === id) {
        WidgetLayerService.textWidgets[i].data.text = text;
        WidgetLayerService.textWidgets[i].component.instance.update();
      }
    }
  }

  public static updateImage(id: string, file: string) {
    for (let i = 0; i < WidgetLayerService.textWidgets.length; ++i) {
      if (WidgetLayerService.imageWdigets[i].data.id === id) {
        WidgetLayerService.imageWdigets[i].data.file = avg.ResourceData.from(
          file
        );
        WidgetLayerService.imageWdigets[i].component.instance.update();
      }
    }
  }

  public static removeAllWidgets(widgetType: avg.ScreenWidgetType, isAsync: boolean = true) {
    if (widgetType === avg.ScreenWidgetType.Text) {
      for (let i = this.textWidgets.length - 1; i >= 0; i--) {
        this.removeWidget(this.textWidgets[i].data, widgetType, isAsync);
      }
    } else {
      for (let i = this.imageWdigets.length - 1; i >= 0; i--) {
        this.removeWidget(this.imageWdigets[i].data, widgetType, isAsync);
      }
    }
  }

  public static removeWidget(data: avg.ScreenWidget,
                             widgetType: avg.ScreenWidgetType = avg.ScreenWidgetType.Text,
                             isAsync: boolean = true) {
    return new Promise((resolve, reject) => {
      const widgetContainer =
        widgetType === avg.ScreenWidgetType.Text
          ? WidgetLayerService.textWidgets
          : WidgetLayerService.imageWdigets;

      for (let i = 0; i < widgetContainer.length; ++i) {
        const widget =
          widgetType === avg.ScreenWidgetType.Text
            ? <TextWidgetModel>widgetContainer[i]
            : <ImageWidgetModel>widgetContainer[i];

        if (widget.data.id === data.id) {
          let component = widget.component;

          // Destroy component
          component.instance.onRemoveAnimationCallback = () => {

            component.destroy();
            component = null;

            if (!isAsync) {
              resolve();
            }
          };

          if (widget.inAnimation) {
            widget.shouldRemoveAfterShow = true;
            widget.shouldRemoveData = data;
            resolve();
            return;
          }

          // Play hide animations
          if (widgetType === avg.ScreenWidgetType.Text) {
            component.instance.hideWidget(<avg.Subtitle>data);
            WidgetLayerService.textWidgets.splice(i, 1);
          } else {
            component.instance.hideWidget(<avg.ScreenImage>data);
            WidgetLayerService.imageWdigets.splice(i, 1);
          }
        }
      }

      if (isAsync) {
        resolve();
      }
    });
  }
}
