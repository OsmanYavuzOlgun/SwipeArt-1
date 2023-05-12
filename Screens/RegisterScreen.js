// eslint-disable-next-line no-use-before-define

// ios 810827365534-9osjht0huj7e8npec71frfm4bk6mnci8.apps.googleusercontent.com
// android 810827365534-8kedvth5h83vlurup31e9j40q73c1k7l.apps.googleusercontent.com
// web 810827365534-lim5le842bacbnr4pa0csp8urfdmjl1k.apps.googleusercontent.com
import React, { useState, useEffect } from "react";
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
  Button,
} from "react-native";
import normalize from "react-native-normalize";
import LoginScreen from "./LoginScreen";
import Icon from "react-native-vector-icons/FontAwesome5";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { LogBox } from "react-native";

import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
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
import ChooseScreenFirst from "./ChooseScreenFirst";
import "@react-navigation/native-stack";

WebBrowser.maybeCompleteAuthSession();
const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [toggleCheckBox, setToggleCheckBox] = useState(true);
  const [checkBoxMessage, setcheckBoxMessage] = useState();
  const [userMessage, setUserMessage] = useState();
  const [nameSurname, setNameSurname] = useState("");

  LogBox.ignoreAllLogs(); // to hide the warnings

  function create(userUID) {
    setDoc(doc(db, "users", userUID), {
      email: email,
      nameSurname: nameSurname,
      isArtist: 0,
      isCustomer: 0,
    })
      .then(() => {
        // Data saved successfully!
        console.log("data submitted");
      })
      .catch((error) => {
        // The write failed...
        console.log(error);
      });
  }

  const handleSignUp = () => {
    const auth = getAuth();
    const emailReg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^0-9a-zA-Z]).{8,12}$/;

    if (passwordRegex.test(password) === false) {
      console.log(
        "Please enter a password that contains one uppercase letter, one numeric character, one non-alphanumeric character, and is between 8 and 12 characters long."
      );
      setUserMessage(
        <Text style={styles.errorMessage2}>
          {" "}
          Please enter a password that contains one uppercase letter, one
          numeric character, one non-alphanumeric character, and is between 8
          and 12 characters long.{" "}
        </Text>
      );
      navigation.navigate(RegisterScreen);
    } else if (email === "") {
      setUserMessage(
        <Text style={styles.errorMessage2}> Please fill the E-mail box!</Text>
      );
    } else if (password === "") {
      setUserMessage(
        <Text style={styles.errorMessage2}> Please fill the Password box!</Text>
      );
    } else if (password === "" && email === "") {
      setUserMessage(
        <Text style={styles.errorMessage2}>
          {" "}
          Please fill E-mail and Password boxes!{" "}
        </Text>
      );
    } else if (emailReg.test(email) === false) {
      setUserMessage(
        <Text style={styles.errorMessage2}>
          {" "}
          Please fill valid Email address!
        </Text>
      );
    } else {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          var user = userCredential.user;
          create(user.uid);
          navigation.navigate(LoginScreen);
          setUserMessage(<Text> </Text>);
        })
        .catch((error) => {
          var errorCode = error.code;
          var errorMessage = error.message;
          console.log(errorCode, errorMessage);
          navigation.navigate(RegisterScreen);
          setUserMessage(
            <Text style={styles.errorMessage2}> E-mail is already in use!</Text>
          );
        });
    }
  };

  return (
    <ScrollView>
      <View style={styles.main}>
        <Text style={styles.bottomImage}>welcome to SwipeArt.</Text>

        <Text style={styles.header1}>Sign Up</Text>
        <Text style={styles.header2}>E-mail</Text>
        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#ffff"
          value={email}
          onChangeText={setEmail}
        />
        <Text style={[styles.header2, styles.passHead]}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          placeholderTextColor="#ffff"
          onChangeText={setPassword}
          secureTextEntry={true}
        />

        <Text style={[styles.header2, styles.passHead]}>Name & Surname</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={nameSurname}
          placeholderTextColor="#ffff"
          onChangeText={setNameSurname}
        />

        <TouchableHighlight
          style={styles.button}
          activeOpacity={0.6}
          underlayColor="#DDDDDD"
          onPress={() => {
            handleSignUp();
          }}
        >
          <Text style={styles.button1title}>Create My Account</Text>
        </TouchableHighlight>

        <Text style={styles.errorMessage2}>{userMessage}</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: "#000000",
    width: normalize(380, "width"),
    height: normalize(620, "height"),
    alignItems: "center",
    paddingTop: normalize(100),
  },
  input: {
    width: "80%",
    height: normalize(50),
    borderWidth: 1.1,
    borderRadius: normalize(10),
    marginTop: normalize(14),
    paddingHorizontal: normalize(10),
    borderColor: "#C3CAD8",
    color: "#fff",
  },
  googleIcon: {
    height: 24,
    width: 24,
    marginLeft: 10,
  },
  errorMessage2: {
    fontSize: normalize(13),
    color: "red",
    fontWeight: "600",
    width: normalize(220),
    marginTop: normalize(80),
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontWeight: "bold",
    color: "#ff0033",
  },
  button: {
    borderRadius: normalize(6),
    borderColor: "#000000",
    borderWidth: 1,
    backgroundColor: "#ffff",
    width: "70%",
    height: normalize(50),
    marginTop: normalize(20),
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  button1title: {
    textAlign: "center",
    color: "#000",
    fontWeight: "bold",
    fontSize: normalize(18),
    paddingTop: normalize(13),
  },
  button2: {
    paddingTop: normalize(25),
  },
  button2title: {
    color: "#2C3345",
    height: normalize(20),
  },
  header1: {
    marginBottom: normalize(25),
    fontSize: normalize(22),
    marginLeft: normalize(0),
    fontWeight: "bold",
    color: "white",
  },
  checkBoxTitle: {
    marginBottom: normalize(25),
    fontSize: normalize(12),
    alignItems: "center",
    fontWeight: "bold",
    color: "#ff0033",
  },
  header2: {
    marginTop: normalize(18),
    fontSize: normalize(17),
    marginLeft: normalize(40),
    color: "#FFFFFF",
    fontWeight: "600",
    marginRight: "auto",
  },
  bottomImage: {
    fontSize: normalize(20),
    color: "white",
    position: "absolute",
    marginTop: normalize(40),
  },
  termsText: {
    marginTop: normalize(10),
    paddingLeft: normalize(20),
    marginLeft: normalize(40),
    width: normalize(300, "width"),
    height: normalize(50, "height"),
    color: "black",
  },
  checkBoxStyle: {
    alignSelf: "center",
    borderColor: "#C3CAD8",
    borderWidth: 1.1,
    borderRadius: normalize(5),
    marginRight: normalize(270),
    transform: [{ translateY: normalize(33) }],
  },
});

export default RegisterScreen;
