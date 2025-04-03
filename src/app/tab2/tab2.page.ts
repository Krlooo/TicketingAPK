import { Component, ElementRef, NgZone, OnInit } from '@angular/core';

import { ReactiveFormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Torch } from '@capawesome/capacitor-torch';

import { IonHeader, IonSelect, IonSelectOption, IonToolbar, IonTitle, IonContent, IonButton, IonLabel, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonCol, IonRow, IonItem, IonInput, IonBackButton } from '@ionic/angular/standalone';
import {
  Barcode,
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  standalone: true,
  styleUrls: ['tab2.page.scss'],
  imports: [IonBackButton, IonInput, IonItem, ReactiveFormsModule, IonSelect, IonSelectOption, IonRow, IonCol, IonCardContent, IonCardHeader, IonCardTitle, IonCard, IonButtons, IonLabel, IonButton, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class Tab2Page implements OnInit {
  formats: BarcodeFormat[] = [];
  isTorchAvailable: any
  lensFacing: LensFacing = LensFacing.Back;
  videoElement: ElementRef<HTMLVideoElement> | undefined;
  squareElement: ElementRef<HTMLDivElement> | undefined;
  minZoomRatio: number | undefined;
  maxZoomRatio: number | undefined;
  constructor(private ngZone: NgZone
  ) { }

  public ngOnInit(): void {
    Torch.isAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }

  async startScan(): Promise<void> {
    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    const options: StartScanOptions = {
      formats: this.formats,
      lensFacing: this.lensFacing,
      videoElement:
        Capacitor.getPlatform() === 'web'
          ? this.videoElement?.nativeElement
          : undefined,
    };

    const squareElementBoundingClientRect =
      this.squareElement?.nativeElement.getBoundingClientRect();
    const scaledRect = squareElementBoundingClientRect
      ? {
        left: squareElementBoundingClientRect.left * window.devicePixelRatio,
        right:
          squareElementBoundingClientRect.right * window.devicePixelRatio,
        top: squareElementBoundingClientRect.top * window.devicePixelRatio,
        bottom:
          squareElementBoundingClientRect.bottom * window.devicePixelRatio,
        width:
          squareElementBoundingClientRect.width * window.devicePixelRatio,
        height:
          squareElementBoundingClientRect.height * window.devicePixelRatio,
      }
      : undefined;
    const detectionCornerPoints = scaledRect
      ? [
        [scaledRect.left, scaledRect.top],
        [scaledRect.left + scaledRect.width, scaledRect.top],
        [
          scaledRect.left + scaledRect.width,
          scaledRect.top + scaledRect.height,
        ],
        [scaledRect.left, scaledRect.top + scaledRect.height],
      ]
      : undefined;
    const listener = await BarcodeScanner.addListener(
      'barcodesScanned',
      async (event) => {
        this.ngZone.run(() => {
          const firstBarcode = event.barcodes[0];
          if (!firstBarcode) {
            return;
          }
          const cornerPoints = firstBarcode.cornerPoints;
          if (
            detectionCornerPoints &&
            cornerPoints &&
            Capacitor.getPlatform() !== 'web'
          ) {
            if (
              detectionCornerPoints[0][0] > cornerPoints[0][0] ||
              detectionCornerPoints[0][1] > cornerPoints[0][1] ||
              detectionCornerPoints[1][0] < cornerPoints[1][0] ||
              detectionCornerPoints[1][1] > cornerPoints[1][1] ||
              detectionCornerPoints[2][0] < cornerPoints[2][0] ||
              detectionCornerPoints[2][1] < cornerPoints[2][1] ||
              detectionCornerPoints[3][0] > cornerPoints[3][0] ||
              detectionCornerPoints[3][1] < cornerPoints[3][1]
            ) {
              return;
            }
          }
          listener.remove();
        });
      },
    );
    await BarcodeScanner.startScan(options);
    if (Capacitor.getPlatform() !== 'web') {
      void BarcodeScanner.getMinZoomRatio().then((result) => {
        this.minZoomRatio = result.zoomRatio;
      });
      void BarcodeScanner.getMaxZoomRatio().then((result) => {
        this.maxZoomRatio = result.zoomRatio;
      });
    }
  }
  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    document.querySelector('body')?.classList.remove('barcode-scanning-active');

    await BarcodeScanner.stopScan();
  }
  public async toggleTorch(): Promise<void> {
    await Torch.toggle();
  }
}
