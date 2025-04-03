import { Injectable, OnInit } from '@angular/core';
import { CapacitorHttp } from '@capacitor/core';
import { LoadingController } from '@ionic/angular/standalone'
@Injectable({
    providedIn: 'root',
})
export class ApiService {


    constructor(private loadingCtrl: LoadingController) { }
    API_URL = "http://192.168.2.101:8081"



    async getProducts() {
        let congelados = await this.getCongelados();
        let secos = await this.getSecos();
        let refrigerados = await this.getRefrigerados();

        return [
            ...congelados.data.message.map((item: any) => ({
                producto: item.PRODUCTO,
                categoria: "CONGELADOS"
            })),
            ...secos.data.message.map((item: any) => ({
                producto: item.PRODUCTO,
                categoria: "SECOS"
            })),
            ...refrigerados.data.message.map((item: any) => ({
                producto: item.PRODUCTO,
                categoria: "REFRIGERADOS"
            }))
        ];
    }

    async getCongelados() {

        try {
            const options = {
                url: this.API_URL + '/congelados',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
            };

            const result: any = await CapacitorHttp.get(options);
            console.log(result)
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }

    async getSecos() {

        try {
            const options = {
                url: this.API_URL + '/secos',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
            };

            const result: any = await CapacitorHttp.get(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
    async getRefrigerados() {

        try {
            const options = {
                url: this.API_URL + '/refrigerados',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
            };

            const result: any = await CapacitorHttp.get(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
    async showLoading() {
        const loading = await this.loadingCtrl.create({
            message: 'Reconectando con el servidor...',
            duration: 3000,
        });

        loading.present();
    }
    async checkApiStatus() {

        try {
            const options = {
                url: this.API_URL + '/alive',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
            };

            const result = await CapacitorHttp.get(options);

            if (result.status >= 200 && result.status < 300) {
                return 'active';
            } else {
                this.showLoading()
                return 'inactive';
            }
        } catch (error) {
            this.showLoading()
            console.error('Error al verificar el estado de la API:', error);
            return error
        }
    }

    async previewDescongecion(producto: any, fc_envase: any) {

        try {
            const options = {
                url: this.API_URL + '/preview/congelados/descongelacion',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
                headers: {
                    'Content-Type': 'application/json', // <- Clave para raw JSON
                },
                data: JSON.stringify({ // Usa "data" en lugar de "body" (según la doc de Capacitor)
                    producto: producto,
                    fc_envase: fc_envase
                }),
            };

            const result: any = await CapacitorHttp.post(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
    async previewTupperCong(producto: any, fc_envase: any, descongelado: any) {

        try {
            const options = {
                url: this.API_URL + '/preview/congelados/tupper',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
                headers: {
                    'Content-Type': 'application/json', // <- Clave para raw JSON
                },
                data: JSON.stringify({ // Usa "data" en lugar de "body" (según la doc de Capacitor)
                    producto: producto,
                    fc_envase: fc_envase,
                    descongelado: descongelado
                }),
            };

            const result: any = await CapacitorHttp.post(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
    async previewMesaCong(producto: any, fc_envase: any, descongelado: any) {

        try {
            const options = {
                url: this.API_URL + '/preview/congelados/mesa',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
                headers: {
                    'Content-Type': 'application/json', // <- Clave para raw JSON
                },
                data: JSON.stringify({ // Usa "data" en lugar de "body" (según la doc de Capacitor)
                    producto: producto,
                    fc_envase: fc_envase,
                    descongelado: descongelado
                }),
            };

            const result: any = await CapacitorHttp.post(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
    async printDescongecion(producto: any, fc_envase: any) {
        try {
            const options = {
                url: this.API_URL + '/congelados/descongelacion',
                connectTimeout: 5000,  // 5 segundos de timeout
                readTimeout: 5000,     // 5 segundos para leer
                headers: {
                    'Content-Type': 'application/json', // <- Clave para raw JSON
                },
                data: JSON.stringify({ // Usa "data" en lugar de "body" (según la doc de Capacitor)
                    producto: producto,
                    fc_envase: fc_envase
                }),
            };

            const result: any = await CapacitorHttp.post(options);
            return result


        } catch (error) {
            console.error('Error al verificar el estado de la API:', error);
        }
    }
}
