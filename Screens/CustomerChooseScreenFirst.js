import React, { useState } from "react";
import Background from "../components/Background";
import {
  Text,
  StyleSheet,
  View,
  TextInput,
  ScrollView,
  Image,
  TouchableHighlight,
  Modal,
  AppRegistry,
  Linking,
  TouchableOpacity,
} from "react-native";
import ArtistMusician from "./ArtistMusician";
import CustomerChooseMusician from "./CustomerChooseMusician";
import CustomerChoosePainter from "./CustomerChoosePainter";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  where,
  query,
} from "firebase/firestore";
import { db } from "../components/config";
import ArtistPainter from "./ArtistPainter";
export default function CustomerChooseScreenFirst({ navigation }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;

  function setCustomerPreference(preference) {
    if (preference === 1) {
      setDoc(doc(db, "users", uid, "userPreference", "MusicianTypes"), {
        startingScore: 1,
      })
        .then(() => {
          // Data saved successfully!
          console.log("data submitted");
          navigation.navigate(CustomerChooseMusician);
        })
        .catch((error) => {
          // The write failed...
          console.log("error");
        });
    } else {
      setDoc(doc(db, "users", uid, "userPreference", "PainterTypes"), {
        startingScore: 1,
      })
        .then(() => {
          // Data saved successfully!
          console.log("data submitted, for the painter, collection created");
          navigation.navigate(CustomerChoosePainter);
        })
        .catch((error) => {
          // The write failed...
          console.log("error");
        });
    }
  }

  return (
    <Background>
      <Text style={[{ color: "white", marginBottom: 20, fontWeight: "bold" }]}>
        {" "}
        What kind of artist are you looking for?
      </Text>
      <TouchableHighlight onPress={() => setCustomerPreference(1)}>
        <View style={styles.button}>
          <Text style={styles.textButton}>Musician</Text>
        </View>
      </TouchableHighlight>

      <TouchableHighlight onPress={() => setCustomerPreference(0)}>
        <View style={styles.button}>
          <Text style={styles.textButton}>Painter</Text>
        </View>
      </TouchableHighlight>
    </Background>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 75,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  button: {
    width: 200,
    marginBottom: 20,
    marginTop: 20,
    padding: 10,
    backgroundColor: "#3451FF",
    borderRadius: 15,

    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 0,
    },

    shadowOpacity: 0.15,
    shadowRadius: 6.46,
    elevation: 9,
  },
  textButton: {
    color: "white",
  },
});
