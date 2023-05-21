import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  TextInput,
  FlatList,
  Linking,
  Button,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Ionicons } from "@expo/vector-icons";
import SwipeCard from "./SwipeCard";
import data from "../person.json";
import { AntDesign } from "@expo/vector-icons";
import BottomNavigationCustomer from "./BottomNavigationCustomer";
import { getAuth } from "firebase/auth";
import OpenSwipeAnimation from "./OpenSwipeAnimation";
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
  onSnapshot,
} from "firebase/firestore";
import { db } from "../components/config";
import { useNavigation } from "@react-navigation/native";

export default function FilterScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState([]);
  const [dataJob, setDataJob] = useState([]);
  const [musicianJob, setMusicianJob] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [filterArr, setFilterArr] = useState([]);
  const [isPopupVisible, setPopupVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nameListing, setNameListing] = useState("");
  const [currentArtistID, setcurrentArtistID] = useState("");

  async function fetchSearchResults() {
    try {
      const docSnap = await getDocs(
        query(collection(db, "users"), where("username", "==", searchTerm))
      );

      let searchedUser = [];
      docSnap.forEach((doc) => {
        searchedUser.push({ ...doc.data(), id: doc.id });
      });

      setSearchResults(searchedUser);
      setFilterArr(searchedUser);

      console.log("filterArr", filterArr);

      if (searchedUser[0].isCustomer === 1) {
        setSearchResults([]);
        setFilterArr([]);
        return null;
      } else {
        setNameListing(searchedUser[0].nameSurname);
        setcurrentArtistID(searchedUser[0].id);
        return searchedUser[0].id;
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      return null;
    }
  }

  async function listingFetchs(userId) {
    try {
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "listings")
      );
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setData(docs);
      console.log("docsdocs", docs);
    } catch (error) {
      console.error("Error fetching listings:", error);
    }
  }

  async function listingJob(userId) {
    try {
      const querySnapshot = await getDocs(
        collection(db, "users", userId, "artistPreference")
      );
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      setDataJob(docs);
      //  console.log("docsdocs", docs);
      // console.log("SELAM", dataJob);
      if (docs[1].composer) {
        setMusicianJob("Composer");
      } else if (docs[1].engineer === 1) {
        setMusicianJob("Sound Engineer");
      } else if (docs[1].producer === 1) {
        setMusicianJob("Producer");
      } else if (docs[1].vocalist === 1) {
        setMusicianJob("Vocalist");
      } else {
        setMusicianJob("Painter");
      }
    } catch (error) {
      console.error("Error fetching artist preferences:", error);
    }
  }

  //console.log("datajob", dataJob);
  const sendFriendRequest = async () => {
    try {
      const senderRef = doc(db, "users", uid);
      const receiverRef = doc(db, "users", filterArr[0].id); // Replace with the actual receiver's user ID
      const senderSnap = await getDoc(senderRef);
      const receiverSnap = await getDoc(receiverRef);
      /* console.log(senderRef);
      console.log(receiverRef); */
      if (senderSnap.exists() && receiverSnap.exists()) {
        const sender = senderSnap.data();
        const receiver = receiverSnap.data();
        // Check if the friend request already exists
        const requestQuery = query(
          collection(db, "friendRequests"),
          where("senderId", "==", uid),
          where("receiverId", "==", filterArr[0].id) // Replace with the actual receiver's user ID
        );
        const requestSnap = await getDocs(requestQuery);

        if (requestSnap.empty) {
          // Create a new friend request
          await addDoc(collection(db, "friendRequests"), {
            senderId: uid,
            receiverId: filterArr[0].id, // Replace with the actual receiver's user ID
          });
          //console.log("Friend request sent.");
        } else {
          //  console.log("Friend request already sent.");
        }
      } else {
        //  console.log("Sender or receiver does not exist.");
      }
    } catch (error) {
      //  console.error("Error sending friend request:", error);
    }
  };

  const addToFavorites = async () => {
    try {
      const userRef = doc(db, "users", uid);
      const favoriteRef = doc(db, "favorites", filterArr[0].id);
      const userSnap = await getDoc(userRef);
      const favoriteSnap = await getDoc(favoriteRef);

      if (userSnap.exists() && favoriteSnap.exists()) {
        const user = userSnap.data();
        const favorite = favoriteSnap.data();
        // Check if the user is already in the favorite list
        if (!favorite.users.includes(uid)) {
          // Add the user to the favorite list
          await updateDoc(favoriteRef, {
            users: [...favorite.users, uid],
          });
          //console.log("User added to favorites.");
        } else {
          //    console.log("User is already in favorites.");
        }
      } else if (userSnap.exists() && !favoriteSnap.exists()) {
        // Create a new favorite list with the user
        await setDoc(favoriteRef, {
          users: [uid],
        });
        // console.log("Favorite list created with user added.");
      } else {
        // console.log("User or favorite list does not exist.");
      }
    } catch (error) {
      //  console.error("Error adding user to favorites:", error);
    }
  };

  async function handleSearch() {
    const userId = await fetchSearchResults(searchTerm);
    if (userId) {
      await listingFetchs(userId);
      await listingJob(userId);
    }
    setModalVisible(true);
  }
  const handleClose = () => {
    setModalVisible(false);
  };

  const viewImage = (uri) => {
    setSelectedImage(uri);
  };

  return (
    <View style={styles.cardContainer}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 10,
          paddingVertical: 30,
        }}
      >
        <Ionicons
          name="search"
          size={24}
          color="gray"
          style={{ marginRight: 5 }}
        />
        <TextInput
          style={styles.input}
          placeholder="Search Artist"
          placeholderTextColor="#ffff"
          value={searchTerm}
          onChangeText={(text) => setSearchTerm(text)}
          onSubmitEditing={handleSearch}
        />
      </View>
      <Text style={styles.name}>
        You can search artist from here by using username!
      </Text>
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={handleClose}
        style={styles.allModal}
        transparent={true} // Make the modal background transparent
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>

          <FlatList
            style={styles.flatlist}
            data={searchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => addToFavorites(item.id)}>
                <View style={styles.listItem}>
                  <Image
                    source={
                      item.photoURL
                        ? { uri: item.photoURL }
                        : { uri: "https://i.stack.imgur.com/dr5qp.jpg" }
                    }
                    style={styles.cardImage}
                  />
                 {/*   <TouchableOpacity onPress={() => viewImage(item.cv)}>
                    <Text style={styles.bio}>View CV</Text>
                  </TouchableOpacity> */}
                  <Text style={styles.name}>{item.nameSurname}</Text>

                  <Text style={styles.bio}>{item.bio}</Text>
                  <Text style={styles.info}>@{item.username}</Text>
                  <Text style={styles.info}>{item.email}</Text>
                  <Text style={styles.info}>{musicianJob}</Text>
                 
                {/*   <TouchableWithoutFeedback
                    onPress={() => setSelectedImage(null)}
                  >
                    <View style={styles.modalContainer}>
                      <Image
                        source={{ uri: selectedImage }}
                        style={styles.cardImage2}
                        resizeMode="contain"
                      />
                    </View>
                  </TouchableWithoutFeedback> */}
                  {/*       {item.cv && (
                    <Button
                      title="View CV"
                      onPress={() => Linking.openURL(item.cv)}
                    />
                  )} */}
                  <View style={styles.startFilter}>
                    {item.behance !== "" && (
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(item.behance)}
                        >
                          <Icon
                            style={styles.socialMediaIcon}
                            name="behance"
                            size={25}
                            color="#1769FF"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {item.twitter !== "" && (
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(item.twitter)}
                        >
                          <Icon
                            style={styles.socialMediaIcon}
                            name="twitter"
                            size={25}
                            color="#1DA1F2"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {item.instagram !== "" && (
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(item.instagram)}
                        >
                          <Icon
                            style={styles.socialMediaIcon}
                            name="instagram"
                            size={25}
                            color="#C13584"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                    {item.linkedin !== "" && (
                      <View style={styles.iconContainer}>
                        <TouchableOpacity
                          onPress={() => Linking.openURL(item.linkedin)}
                        >
                          <Icon
                            style={styles.socialMediaIcon}
                            name="linkedin"
                            size={25}
                            color="#0077B5"
                          />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                  <Text style={styles.listingName}>
                    {nameListing}'s listings
                  </Text>
                  {data.map((item) => (
                    <View style={styles.listingcontainer} key={item.id}>
                      <View style={styles.titleContainer}>
                        <Text style={styles.bio}>
                          Listing Title: {item.title}
                        </Text>
                        <View style={styles.iconsContainer}></View>
                        <Text style={styles.bio}>
                          Listing Desc: {item.desc}
                        </Text>

                        <View style={styles.allImage}>
                          <Text style={styles.bio}>Image Preview:</Text>
                          <Image
                            source={{ uri: item.image }}
                            style={{
                              width: 100,
                              height: 100,
                              marginLeft: "auto",
                              marginRight: "auto",
                              marginBottom: 30,
                            }}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
      <BottomNavigationCustomer
        style={styles.naviationContainer}
      ></BottomNavigationCustomer>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  listingcontainer: {
    margin: 10,
    borderWidth: 2,
    borderBottomColor: "white",
    textAlign: "center",
  },
  listingName: {
    fontSize: 24,
    color: "white",
    fontWeight: "bold",
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
  },
  cardImage2: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "white",
    backgroundColor: "white",
  },
  startFilter: {
    display: "flex",
    flexDirection: "row",
  },
  card: {
    flexDirection: "column",
    paddingHorizontal: 55,
    width: 400,
    alignItems: "center",
    justifyContent: "center",
  },
  card2: {
    flexDirection: "column",
    paddingHorizontal: 55,
    width: 400,
    height: 500,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  shown: {
    fontSize: 16,
    fontWeight: "thin",
    color: "white",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    top: 300,
    marginRight: "auto",
    marginLeft: "auto",
  },
  profession: {
    fontSize: 16,
    textAlign: "center",
    color: "white",
  },
  button: {
    width: 50,
    padding: 10,
    position: "absolute",
    left: "30%",
    backgroundColor: "red",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  button2: {
    width: 50,
    padding: 10,
    position: "absolute",
    right: "30%",
    backgroundColor: "green",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 5,
    color: "white",
  },
  flatlist: {
    flex: 1,
    borderColor: "gray",
    borderWidth: 1,
    padding: 5,
    color: "white",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background color
    borderColor: "gray",
    borderWidth: 1,
  },
  allModal: {},
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 10,
    zIndex: 1,
  },
  flatlist: {
    flex: 1,
    backgroundColor: "#000",
  },
  listItem: {
    flexDirection: "column",
    alignItems: "center",
    padding: 16,
  },
  startFilter: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  name: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    margin: 10,
    textAlign: "center",
  },
  bio: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  info: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  socialLinks: {
    flexDirection: "row",
  },
  iconContainer: {
    margin: 10,
  },
  socialMediaIcon: {
    width: 30,
    height: 25,
  },
});
