import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Loader } from '@googlemaps/js-api-loader';
import { PedidoCabecera } from 'src/app/interfaces/pedidoCabecera';
import { PedidosService } from 'src/app/service/tomadorPedidos/pedidos.service';

const apiKey = 'AIzaSyCrZ_hKSgj5NwR6b2LnxdR6SfBwqM0geT4';

const loader = new Loader({
  apiKey: apiKey,
  version: "weekly",
  libraries: ["places"]
});

@Component({
  selector: 'app-ver-mas',
  templateUrl: './ver-mas.component.html',
  styleUrls: ['./ver-mas.component.scss'],
})

export class VerMasComponent implements OnInit {

  @ViewChild('map')map: ElementRef<HTMLElement>;
  @ViewChild('directionsPanel')directionsPanel: ElementRef<HTMLElement>;

  public lat:number
  public lng:number

  private markador:google.maps.Marker
  private mapaG:google.maps.Map

  private direc:google.maps.DirectionsService

  constructor(
    private pedidoS:PedidosService,
    private router:Router,
    private route:ActivatedRoute
    ) { }

  ngOnInit() {
    this.route.params.subscribe(async (param)=>{
      this.verificarRutas()
      await this.coords()
      this.mapa()
    })
  }

  verificarRutas(){
    if (this.pedidoS.rutaClientes.length == 0) {
      this.router.navigate(['../../pedidos'],{relativeTo:this.route})
    }
  }

  direcciones(){
    let arrFiltrado :PedidoCabecera[]=[]
    for (const pedido of this.pedidoS.rutaClientes) {
      let existe:PedidoCabecera ={}
      existe = arrFiltrado.find((pedidoF)=> pedidoF.ccod_cliente == pedido.ccod_cliente )
      if(existe==undefined) arrFiltrado.push(pedido);
    }
    let arrGoogle:google.maps.DirectionsRequest = {
      origin:{},
      destination:{},
      waypoints:[],
      travelMode:google.maps.TravelMode.DRIVING
    }
    arrFiltrado=arrFiltrado.filter((pedido)=>{
      if (pedido.lat ==null ||pedido.lng== null) return false
      else return true
    })

    arrFiltrado.forEach((pedido,ind,arr)=>{         
      if (ind == 0) {
        arrGoogle.origin= pedido.punto_partida
      }
      
      if(ind == arr.length-1){
        arrGoogle.destination= {lat:pedido.lat,lng:pedido.lng}
      }
      else{
        arrGoogle.waypoints.push({
          location:{
            location:{
              lat: pedido.lat,
              lng: pedido.lng,
            }
          },
          stopover:true
        })        
      }
    })
    return arrGoogle;
  }


  async coords(){
    return new Promise((resolve,reject)=>{
      
    navigator.geolocation
    .getCurrentPosition((pos)=>{
      this.lat=pos.coords.latitude;
      this.lng=pos.coords.longitude;
      resolve(true)
    })
    })


   
  }

  async mapa(){
    const mapRef = this.map.nativeElement

    await loader
    .load()
    .then((google)=>{
      let Google = google.maps
      this.mapaG =new Google.Map(mapRef,{
        center: {
            lat: -12.089529686701699,
            lng: -77.08427480629884,
          },
          zoom: 15,
          
      })
    })

  //  this.markador = new google.maps.Marker({
  //       position: {
  //         lat: -12.089529686701699,
  //         lng: -77.08427480629884,
  //       },
  //       map: this.mapaG,
  //       draggable:true
  //   });
    
    // this.markador.addListener('dragend',(e)=>{
    //   this.lat = e.latLng.lat()
    //   this.lng=e.latLng.lng()      
    //   let datos:google.maps.LatLng = e.latLng
    //   this.mapaG.panTo(datos);
    // })

     // 1 -12.089529686701699 -77.08427480629884
    // 1 -12.083151150821156 -77.08072713696869
    // 1 -12.08578091580089 -77.07386068189057
    // 1 -12.062923473603606 -77.06338933789642
    
    let request:google.maps.DirectionsRequest = this.direcciones()
   
    let direccionesRend = new google.maps.DirectionsRenderer({
      map:this.mapaG,
      polylineOptions:{
        strokeColor:'#7d78fb',
        strokeWeight:7      
      },
      // suppressMarkers:true

    })

    direccionesRend.addListener("directions_changed", (e,a) => {     
    });

    this.direc=new google.maps.DirectionsService()
    this.direc.route(request,(goo)=>{
      // let i = 0
      // for (const ruta of goo.routes[0].legs) {
      //   if (i ==0) {
      //     new google.maps.Marker({
      //         position:ruta.start_location,
      //         map: this.mapaG,
      //         label:ruta.start_address,
      //     });
      //     new google.maps.Marker({
      //       position:ruta.end_location,
      //       map: this.mapaG,
      //       label:ruta.end_address,
      //     });
      //   }else{
      //     new google.maps.Marker({
      //       position:ruta.end_location,
      //       map: this.mapaG,
      //       label:ruta.end_address,
      //     });
      //   }
      //   i++
      // }
      
      direccionesRend.setDirections(goo)

      const route = goo.routes[0];

      let panelRef=this.directionsPanel.nativeElement

      const summaryPanel = document.getElementById(
        "directions-panel"
      ) as HTMLElement;

      panelRef.innerHTML = "";

      // For each route, display summary information.
      for (let i = 0; i < route.legs.length; i++) {
        const routeSegment = i + 1;

        panelRef.innerHTML +=
          "<b>Destino " + routeSegment + " :</b><br>";
        panelRef.innerHTML += route.legs[i].start_address + " a ";
        panelRef.innerHTML += route.legs[i].end_address +' | ';
        panelRef.innerHTML += route.legs[i].duration!.text +' '+route.legs[i].distance!.text+ "<br><br>";

        for (const leg of route.legs[i].steps) {
          panelRef.innerHTML += leg.instructions+`<br> (${leg.duration.text} | ${leg.distance.text})` + "<br><br>";
        }
      }


      
    })

  }

}
