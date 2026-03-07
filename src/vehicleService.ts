import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  deleteDoc,
} from "firebase/firestore";

const vehiclesCollection = collection(db, "vehicles");

export const vehicleService = {
  async getAll() {
    const snapshot = await getDocs(vehiclesCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  },

  async create(vehicle: any) {
    const docRef = await addDoc(vehiclesCollection, {
      ...vehicle,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return docRef.id;
  },

  async update(id: string, data: any) {
    const vehicleRef = doc(db, "vehicles", id);

    await updateDoc(vehicleRef, {
      ...data,
      updatedAt: new Date(),
    });
  },

  async remove(id: string) {
    const vehicleRef = doc(db, "vehicles", id);
    await deleteDoc(vehicleRef);
  },
};