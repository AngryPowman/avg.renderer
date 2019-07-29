import { AVGNativePath } from "./../../../engine/core/native-modules/avg-native-path";
import { GameResource } from "engine/core/resource";
import { DropFlakeParticle } from "./../../../engine/core/graphics/shaders/drop-flake/drop-flake";
import * as PIXI from "pixi.js";
import * as filters from "pixi-filters";

import { GameWorld } from "../../../engine/core/graphics/world";
import * as dat from "dat.gui";
import { Sprite, ResizeMode } from "../../../engine/core/graphics/sprite";

export class DebugPanel {
  private static gui = new dat.GUI({ name: "Debug", autoPlace: false });
  private static spriteFolder: dat.GUI;
  private static cameraFolder: dat.GUI;
  private static particlesFolder: dat.GUI;

  private static fpsElement: HTMLElement;

  private static cameraModel = {
    x: 0,
    y: 0,
    zoom: 1
  };

  private static particlesModel = {};

  public static init(parentElement?: HTMLElement) {
    if (!parentElement) {
      parentElement = <HTMLElement>document.getElementsByTagName("game").item(0);
    }

    this.gui.domElement.style.position = "absolute";
    this.gui.domElement.style.zIndex = "9999";
    this.gui.domElement.style.right = "2px";

    parentElement.appendChild(this.gui.domElement);

    this.initCameraPanel();
    this.initParticlesPanel();
  }

  public static initCameraPanel() {
    if (!this.cameraFolder) {
      this.cameraFolder = this.gui.addFolder("摄像机");
      this.cameraFolder.add(this.cameraModel, "x", -2000, 2000, 1).onChange((value: any) => {
        GameWorld.defaultScene.cameraMove(value, this.cameraModel.y, 2000);
      });
      this.cameraFolder.add(this.cameraModel, "y", -2000, 2000, 1).onChange((value: any) => {
        GameWorld.defaultScene.cameraMove(this.cameraModel.x, value, 2000);
      });
      this.cameraFolder.add(this.cameraModel, "zoom", -5000, 5000, 10).onChange((value: any) => {
        GameWorld.defaultScene.cameraZoom(this.cameraModel.zoom, 2000);
      });
    }
  }

  public static initParticlesPanel() {
    if (!this.particlesFolder) {
      this.particlesFolder = this.gui.addFolder("全屏粒子");

      this.particlesFolder
        .add({ 贴图: "" }, "贴图", {
          雨: AVGNativePath.join(GameResource.getDataRoot(), "effects/flake-texture/rain.png"),
          雪: AVGNativePath.join(GameResource.getDataRoot(), "effects/flake-texture/snow.png"),
          樱花: AVGNativePath.join(GameResource.getDataRoot(), "effects/flake-texture/sakura.png")
        })
        .onChange(async v => {
          await DropFlakeParticle.init(
            {
              count: 5000, // 粒子数量
              alpha: 0.6, // 透明系数
              depth: 60, // 镜头深度
              gravity: 60, // 下坠重力
              autoWind: true,
              wind: {
                force: 0.1, // 风力
                min: -0.2,
                max: 0.1,
                easing: 0.1
              }
            },
            v,
            "avg-particle-viewport-2"
          );
        });

      [
        this.particlesFolder.add(DropFlakeParticle.params, "count", 1, 40000, 1),
        this.particlesFolder.add(DropFlakeParticle.params, "alpha", 0, 1, 0.01),
        this.particlesFolder.add(DropFlakeParticle.params, "depth", -80, 80, 0.1),
        this.particlesFolder.add(DropFlakeParticle.params, "gravity", 0, 2000, 1)
      ].map(v => {
        v.onChange(value => {
          window.dispatchEvent(new Event("resize"));
        });
      });

      const windFolder = this.particlesFolder.addFolder("风力");

      [
        windFolder.add(DropFlakeParticle.params.wind, "force", -5, 5, 0.01),
        windFolder.add(DropFlakeParticle.params.wind, "easing", 0.01, 5, 0.01)
      ].map(v => {
        v.onChange(value => {
          window.dispatchEvent(new Event("resize"));
        });
      });
    }
  }

  public static setSpritePanel(sprite: Sprite) {
    if (this.spriteFolder) {
      this.gui.removeFolder(this.spriteFolder);
    }

    this.spriteFolder = this.gui.addFolder("精灵");

    this.spriteFolder.add(sprite, "name");

    this.spriteFolder.add(sprite, "x", -500, 2500);
    this.spriteFolder.add(sprite, "y", -500, 2500);
    this.spriteFolder.add(sprite, "width", 0, 6000);
    this.spriteFolder.add(sprite, "height", 0, 6000);
    this.spriteFolder.add(sprite, "rotation", 0, 360, 0.1);
    this.spriteFolder.add(sprite, "alpha", 0, 1, 0.01);

    this.spriteFolder.add(sprite, "distance", -5000, 5000);

    this.spriteFolder.add(sprite, "resizeMode", ["Default", "Stretch", "KeepRadio", "Custom"]).onChange(value => {
      switch (value) {
        case "Default":
          sprite.resizeMode = ResizeMode.Default;
          break;
        case "Stretch":
          sprite.resizeMode = ResizeMode.Stretch;
          break;
        case "KeepRadio":
          sprite.resizeMode = ResizeMode.KeepRadio;
          break;
        case "Custom":
          sprite.resizeMode = ResizeMode.Custom;
          break;
      }
    });
    this.spriteFolder.add(sprite, "center");
    this.spriteFolder.add(sprite, "isTilingMode");
    this.spriteFolder.add(sprite, "renderCameraDepth");
    this.spriteFolder.add(sprite, "renderInCamera");

    this.spriteFolder.open();
  }

  public static update() {
    this.gui.updateDisplay();
  }
}
