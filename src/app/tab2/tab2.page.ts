import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Torch } from '@capawesome/capacitor-torch';
import { CommonModule } from '@angular/common';
import { IonHeader, IonSelect, IonSelectOption, IonToolbar, IonTitle, IonContent, IonButton, IonLabel, IonButtons, IonCard, IonCardTitle, IonCardHeader, IonCardContent, IonCol, IonRow, IonItem, IonInput, IonBackButton } from '@ionic/angular/standalone';
import {
  BarcodeFormat,
  BarcodeScanner,
  LensFacing,
  StartScanOptions,
} from '@capacitor-mlkit/barcode-scanning';
import jsQR from 'jsqr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  standalone: true,
  styleUrls: ['tab2.page.scss'],
  imports: [CommonModule, IonBackButton, IonInput, IonItem, ReactiveFormsModule, IonSelect, IonSelectOption, IonRow, IonCol, IonCardContent, IonCardHeader, IonCardTitle, IonCard, IonButtons, IonLabel, IonButton, IonHeader, IonToolbar, IonTitle, IonContent]
})
export class Tab2Page implements OnInit {
  @ViewChild('video') videoElement: ElementRef<HTMLVideoElement> | undefined;
  @ViewChild('square') squareElement: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  formats: BarcodeFormat[] = [];
  isTorchAvailable: any;
  lensFacing: LensFacing = LensFacing.Back;
  minZoomRatio: number | undefined;
  maxZoomRatio: number | undefined;
  isWeb: boolean = false;
  scannedResult: string = '';
  hasScanned: boolean = false;
  isLoading: boolean = false;

  constructor(private ngZone: NgZone, private router: Router) { }

  public ngOnInit(): void {
    this.isWeb = Capacitor.getPlatform() === 'web';

    Torch.isAvailable().then((result) => {
      this.isTorchAvailable = result.available;
    });
  }

  async startScan(): Promise<void> {
    // Resetear resultado previo
    this.hasScanned = false;
    this.scannedResult = '';
    this.isLoading = true;

    // Hide everything behind the modal (see `src/theme/variables.scss`)
    document.querySelector('body')?.classList.add('barcode-scanning-active');

    if (this.isWeb) {
      // Para web, usamos el input de tipo file para acceder a la cámara
      this.fileInput?.nativeElement.click();
    } else {
      // Para dispositivos nativos, usamos el BarcodeScanner de Capacitor
      const options: StartScanOptions = {
        formats: this.formats,
        lensFacing: this.lensFacing,
        videoElement: this.isWeb ? this.videoElement?.nativeElement : undefined,
      };

      const squareElementBoundingClientRect =
        this.squareElement?.nativeElement.getBoundingClientRect();
      const scaledRect = squareElementBoundingClientRect
        ? {
          left: squareElementBoundingClientRect.left * window.devicePixelRatio,
          right: squareElementBoundingClientRect.right * window.devicePixelRatio,
          top: squareElementBoundingClientRect.top * window.devicePixelRatio,
          bottom: squareElementBoundingClientRect.bottom * window.devicePixelRatio,
          width: squareElementBoundingClientRect.width * window.devicePixelRatio,
          height: squareElementBoundingClientRect.height * window.devicePixelRatio,
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
              !this.isWeb
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

            // Guardar el resultado del escaneo
            this.scannedResult = firstBarcode.rawValue || 'No se pudo leer el código';
            this.hasScanned = true;
            this.isLoading = false;

            // Detener el escaneo
            this.stopScan();
            listener.remove();
          });
        },
      );
      await BarcodeScanner.startScan(options);
      if (!this.isWeb) {
        void BarcodeScanner.getMinZoomRatio().then((result) => {
          this.minZoomRatio = result.zoomRatio;
        });
        void BarcodeScanner.getMaxZoomRatio().then((result) => {
          this.maxZoomRatio = result.zoomRatio;
        });
      }
    }
  }

  handleFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // Procesar la imagen con jsQR
          this.processImageForBarcodes(img);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      // No se seleccionó ningún archivo
      this.isLoading = false;
      document.querySelector('body')?.classList.remove('barcode-scanning-active');
    }
  }

  processImageForBarcodes(img: HTMLImageElement): void {
    // Crear un canvas para procesar la imagen
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      this.handleScanError("Error al procesar la imagen");
      return;
    }

    try {
      // Determinar el tamaño óptimo para el procesamiento
      // Mantenemos la imagen lo suficientemente grande para el QR pero no demasiado para ralentizar el procesamiento
      let width = img.width;
      let height = img.height;

      // Si la imagen es muy grande, redimensionarla para un procesamiento más rápido
      const MAX_SIZE = 1000; // tamaño máximo en píxeles
      if (width > MAX_SIZE || height > MAX_SIZE) {
        if (width > height) {
          height = Math.floor(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        } else {
          width = Math.floor(width * (MAX_SIZE / height));
          height = MAX_SIZE;
        }
      }

      // Ajustar el tamaño del canvas a la imagen
      canvas.width = width;
      canvas.height = height;

      // Limpiar el canvas antes de dibujar
      context.fillStyle = 'white';
      context.fillRect(0, 0, width, height);

      // Dibujar la imagen en el canvas con el tamaño ajustado
      context.drawImage(img, 0, 0, width, height);

      // Obtener los datos de la imagen
      const imageData = context.getImageData(0, 0, width, height);

      // Intentar la decodificación normal
      let code = jsQR(imageData.data, width, height, {
        inversionAttempts: "attemptBoth" // Probar tanto la inversión como la no inversión
      });

      if (code) {
        this.handleScanSuccess(code.data);
        return;
      }

      // Si no funciona, intentar mejorar el contraste
      this.enhanceImageContrast(context, width, height);
      const enhancedImageData = context.getImageData(0, 0, width, height);

      code = jsQR(enhancedImageData.data, width, height, {
        inversionAttempts: "attemptBoth"
      });

      if (code) {
        this.handleScanSuccess(code.data);
        return;
      }

      // Si aún no funciona, intentar con diferentes orientaciones
      for (let rotation of [90, 180, 270]) {
        this.rotateCanvas(context, width, height, rotation);
        const rotatedImageData = context.getImageData(0, 0, width, height);

        code = jsQR(rotatedImageData.data, width, height, {
          inversionAttempts: "attemptBoth"
        });

        if (code) {
          this.handleScanSuccess(code.data);
          return;
        }
      }

      // Si ninguna técnica funcionó
      this.handleScanError("No se pudo detectar ningún código QR en la imagen");
    } catch (error) {
      console.error('Error al procesar QR:', error);
      this.handleScanError("Error al procesar la imagen: " + (error instanceof Error ? error.message : 'Desconocido'));
    }
  }

  // Método para mejorar el contraste de la imagen
  private enhanceImageContrast(context: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = context.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Aplicar un ajuste de contraste simple
    for (let i = 0; i < data.length; i += 4) {
      // Convertir a escala de grises para un mejor contraste
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;

      // Umbral para binarizar la imagen - esto puede ayudar con códigos QR
      const threshold = 128;
      const value = avg < threshold ? 0 : 255;

      data[i] = data[i + 1] = data[i + 2] = value;
    }

    context.putImageData(imageData, 0, 0);
  }

  // Método para rotar el canvas
  private rotateCanvas(context: CanvasRenderingContext2D, width: number, height: number, degrees: number): void {
    const imageData = context.getImageData(0, 0, width, height);

    context.clearRect(0, 0, width, height);

    // Guardar el estado actual
    context.save();

    // Mover al centro del canvas para rotar
    context.translate(width / 2, height / 2);

    // Rotar
    context.rotate((degrees * Math.PI) / 180);

    // Regresar al punto de origen
    context.translate(-width / 2, -height / 2);

    // Dibujar la imagen rotada
    context.putImageData(imageData, 0, 0);

    // Restaurar el estado
    context.restore();
  }

  // Método para manejar escaneo exitoso
  private handleScanSuccess(result: string): void {

    this.ngZone.run(() => {
      this.scannedResult = result;
      this.hasScanned = true;
      this.isLoading = false;
      let results = this.scannedResult.split("|")
      console.log(results)
      document.querySelector('body')?.classList.remove('barcode-scanning-active');
      if (results[0] == "1") {
        this.router.navigate(['/home/congelados/tupper'], { queryParams: { fc_envase: results[3], fc_descongelacion: results[2].replace(" ", "-").replace(":", "-"), producto: results[1] } })
      }
      if (results[0] == "2") {
        this.router.navigate(['/home/congelados/mesa'], { queryParams: { fc_envase: results[3], fc_descongelacion: results[2].replace(" ", "-").replace(":", "-"), producto: results[1] } })
      }
      this.resetScan()
    });
  }

  // Método para manejar errores en el escaneo
  private handleScanError(message: string): void {
    this.ngZone.run(() => {
      this.scannedResult = message;
      this.hasScanned = true;
      this.isLoading = false;
      document.querySelector('body')?.classList.remove('barcode-scanning-active');
    });
  }

  private async stopScan(): Promise<void> {
    // Show everything behind the modal again
    this.isLoading = false;
    document.querySelector('body')?.classList.remove('barcode-scanning-active');


    if (!this.isWeb) {
      await BarcodeScanner.stopScan();
    }
  }

  public async toggleTorch(): Promise<void> {
    await Torch.toggle();
  }

  // Método para escanear de nuevo
  public resetScan(): void {
    this.hasScanned = false;
    this.scannedResult = '';
    this.isLoading = false;
    this.fileInput.nativeElement.value = '';
  }
}