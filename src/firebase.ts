import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Reemplazar este objeto con tus credenciales reales de la consola web de Firebase
const firebaseConfig = {
  apiKey: "TEMPORAL",
  authDomain: "TEMPORAL",
  projectId: "TEMPORAL",
  storageBucket: "TEMPORAL",
  messagingSenderId: "TEMPORAL",
  appId: "TEMPORAL"
};

// Inicializamos la aplicación conectándola con la nube
const app = initializeApp(firebaseConfig);

// Exportamos la base de datos 'db' para usarla en tus vistas del operador y del cliente
export const db = getFirestore(app);