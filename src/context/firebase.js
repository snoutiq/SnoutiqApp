import { initializeApp } from "firebase/app";
import { getDatabase, push, ref } from "firebase/database";

const firebaseConfig = {

};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
