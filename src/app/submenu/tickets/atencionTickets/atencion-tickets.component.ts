import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { IonDatetime, IonModal, IonSelect, Platform } from '@ionic/angular';
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { TicketsService } from 'src/app/service/tickets/tickets.service';
import { ToolsService } from 'src/app/service/tools.service';


@Component({
    selector: 'app-atencion-tickets',
    templateUrl: './atencion-tickets.component.html',
    styleUrls: ['./atencion-tickets.component.scss'],
})
export class AtencionTicketsComponent implements OnInit {

    scannedResult: string | null = 'true';
    isScanning = false;

    constructor(
        private platform: Platform,
        private toolsService: ToolsService,
        private ticketsService: TicketsService
    ) {
    }

    ngOnInit() {

    }


    async startScan() {
        if (!this.platform.is('capacitor')) {
            alert('El escáner solo está disponible en el dispositivo.');
            return;
        }

        const supported = await BarcodeScanner.isSupported();
        if (!supported.supported) {
            alert('El escáner no es compatible en este dispositivo.');
            return;
        }

        const permission = await BarcodeScanner.requestPermissions();
        if (permission.camera !== 'granted') {
            alert('Permiso de cámara denegado.');
            return;
        }

        this.isScanning = true;
        try {
            const { barcodes } = await BarcodeScanner.scan();
            // if (barcodes.length > 0) {
            //     const numero_ticket = barcodes[0].rawValue ?? '';
            //     this.scannedResult = numero_ticket;

            //     // 🟢 Llamar al servicio para registrar el ticket
            //     await this.registrarTicket(numero_ticket);
            // } else {
            //     alert('No se detectó ningún código QR.');
            // }

            if (barcodes.length > 0) {
                // 📏 Definir un área central reducida (coordenadas estimadas)
                const captureArea = {
                    x: 200,  // izquierda
                    y: 400,  // superior
                    width: 400,
                    height: 400
                };

                // 📦 Filtrar los códigos dentro del área de captura
                const filtered = barcodes.filter((b: any) =>
                    b.boundingBox &&
                    b.boundingBox.x >= captureArea.x &&
                    b.boundingBox.y >= captureArea.y &&
                    (b.boundingBox.x + b.boundingBox.width) <= (captureArea.x + captureArea.width) &&
                    (b.boundingBox.y + b.boundingBox.height) <= (captureArea.y + captureArea.height)
                );

                const detected = filtered.length > 0 ? filtered[0] : barcodes[0];
                const numero_ticket = detected.rawValue ?? '';

                this.scannedResult = numero_ticket;

                // 🟢 Llamar al servicio para registrar el ticket
                await this.registrarTicket(numero_ticket);
            } else {
                alert('No se detectó ningún código QR.');
            }

        } catch (error) {
            console.error(error);
            alert('Error al escanear el código.');
        } finally {
            this.isScanning = false;
        }
    }

    stopScan() {
        // this.registrarTicket('9999999903B0010000038536-0010');
        BarcodeScanner.stopScan();
        this.isScanning = false;
    }

    async registrarTicket(numero_ticket: string) {
        try {
            const response: any = await this.ticketsService.registrarTicket(numero_ticket);

            console.log('Respuesta del backend:', response);
            this.toolsService.mostrarAlerta(response.mensaje, response.estado == true ? 'success' : 'error', 4000)

        } catch (error) {
            console.error('Error al registrar ticket:', error);
            this.toolsService.mostrarAlerta('No se pudo registrar el ticket.', 'error', 4000)
        }
    }
}
