import { Component, OnInit, AfterViewInit, ElementRef, ChangeDetectorRef } from "@angular/core";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AnimationUtils } from "app/common/animations/animation-utils";
import { InputData } from "engine/data/input-data";

@Component({
  selector: "variable-input-box",
  templateUrl: "./variable-input-box.component.html",
  styleUrls: ["./variable-input-box.component.scss"]
})
export class VariableInputComponent implements OnInit, AfterViewInit {
  inputData: InputData = undefined;
  inputValue: string | number;
  private _complete: (ok: boolean, value: string | number) => void;

  constructor(private changeDetector: ChangeDetectorRef) {}

  ngOnInit() {}

  ngAfterViewInit() {}

  public show(data: InputData, onCompleted: (ok: boolean, value: string | number) => void) {
    this.inputData = data;
    this._complete = onCompleted;

    this.changeDetector.detectChanges();

    AnimationUtils.fadeTo("#input-box-container", 300, 1);
  }

  private close() {
    AnimationUtils.fadeTo("#input-box-container", 100, 0, () => {
      this.inputData = undefined;
      this._complete = undefined;

      this.changeDetector.detectChanges();
    });
  }

  public onOk() {
    if (
      !this.inputValue ||
      this.inputValue.toString().length < this.inputData.minLength ||
      this.inputValue.toString().length > this.inputData.maxLength
    ) {
      return;
    }

    if (this._complete) {
      this._complete(true, this.inputValue);
    }
    this.close();
  }

  public onCancel() {
    if (this._complete) {
      this._complete(false, this.inputValue);
    }
    this.close();
  }
}
