// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  erpSolutions: {
    // url :'http://localhost:5000/movil',
    // urlApi :'http://localhost:5000',
    // urlImagenes : 'http://localhost:5000/erp',
    // urlArchivos : 'http://localhost:5000/movil',

    url :'https://erp-solutionsperu.com/movil',
    urlApi :'https://erp-solutionsperu.com',
    urlImagenes : 'https://erp-solutionsperu.com/erp',
    urlArchivos : 'https://erp-solutionsperu.com/movil',
  },
  erpSystemsMype: {
    url :'https://erp-systemsperu-mype.com/movil',
    urlApi :'https://erp-systemsperu-mype.com',
    urlImagenes : 'https://erp-systemsperu-mype.com/erp',
    urlArchivos : 'https://erp-systemsperu-mype.com/movil',
  },
  erpSystemsSoft: {
    url :'https://erp-systemssoft.com/movil',
    urlApi :'https://erp-systemssoft.com',
    urlImagenes : 'https://erp-solutionsperu.com/erp',
    urlArchivos : 'https://erp-solutionsperu.com/movil', 
  },

  limiteArticulos: 30,
  limitePromocioes: 500,
  firebaseConfig: {
    apiKey: "AIzaSyA-DL3BO-rcHVUtryZzKe36TYDKiBUUewo",
    authDomain: "app-erpsoft.firebaseapp.com",
    projectId: "app-erpsoft",
    storageBucket: "app-erpsoft.firebasestorage.app",
    messagingSenderId: "1089528259760",
    appId: "1:1089528259760:web:260e953f6f699738154775",
    measurementId: "G-MC2V79Q3HF"
  }
};

export const rucSystemsMype = [
  '20601877717',
  '20485988468',
  '20501625672',
  '20602123112',
  '20515125290',
  '20511093172',
  '20605405526',
  '20538335861',
  '20508280000',
  '20600059794',
  '20565333209',
  '20609942941',
  '20419665992',
  '20600740955',
]

export const rucSystemsSoft = [
  '20612242501', //SCHUBERT CORP S.A.C.	
  '20603602723', //TEEN LIFE SAC.	
  '20609898411', //MIAMI TOP S.A.C.	
  '20613748823', //SCHUBERT S.A.C.	
  '20606477288', //Hardman
]
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.

// ionic cap copy
// ionic cap sync
// npm run ng build
