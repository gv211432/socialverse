import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import {
  Button, FlatList, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, TextInput
} from 'react-native';
import UserContext from '../../context/userContext';
import axiosInstance from '../../helpers/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import UserSignupPopup from '../../components/UserSignupPopup';

const Home = ({ navigation }) => {
  const { homeData, AppEvents } = useContext(UserContext);
  //lading first 12 items in the list 
  const [data, setData] = useState(homeData.slice(0, 12));
  const [serachText, setSearchText] = useState("");

  // this code is called for extra data list data is loading
  const loadDataInBatch = () => {
    console.log("Loading more");
    const len = data.length;
    const lenDiff = homeData.length - data.length;
    const tem = homeData.slice(len, lenDiff >= 12 ? len + 12 : len + lenDiff);
    setData(p => [...p, ...tem]);
  };


  // adding event listner for router state updates
  useEffect(() => {
    AppEvents.on("router_state_update", (currentScreen) => {
      setData([]);
      if (currentScreen?.index == 0) loadDataInBatch();
    });
    return () => AppEvents.off("router_state_update");
  });

  // user items component
  const UserNameItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          flex: 1,
          height: 80,
          width: "100%",
          backgroundColor: "#ffffff30",
          borderRadius: 13,
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          margin: 4,
        }}
        onPress={() => {
          AppEvents.emit("refresh_reels_screen", true, item);
          navigation.navigate("Reels");
        }}
      >
        <View style={{ flexDirection: "row", position: "absolute", left: 3, padding: 5 }}>
          <Image
            style={{
              height: 70,
              width: 70,
              borderRadius: 35
            }}
            source={item?.thumbnail_url}
          />
          <View style={{ flexDirection: "column", justifyContent: "center", marginLeft: 5 }}>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 18 }}>{item?.first_name}{item?.last_name}</Text>
            <Text style={{ color: "#fff", fontWeight: 500, fontSize: 14 }}>{item?.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  // placeholder item component
  const PlaceholderItem = useCallback(() => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{
          flex: 1,
          height: 80,
          width: "100%",
          backgroundColor: "#ffffff30",
          borderRadius: 13,
          justifyContent: "center",
          alignItems: "center",
          alignContent: "center",
          margin: 4,
        }}
      >
        <View style={{
          flexDirection: "row",
          position: "absolute", left: 3,
          padding: 5
        }}>
          <View
            style={{
              height: 70,
              width: 70,
              borderRadius: 35,
              backgroundColor: "white",
            }}
          />
          <View style={{
            flexDirection: "column",
            justifyContent: "center",
            marginLeft: 5
          }}>
            <View style={{ backgroundColor: "#fff", height: 20, width: 70, marginBottom: 8 }} />
            <View style={{ backgroundColor: "#fff", height: 10, width: 140 }} />
          </View>
        </View>
      </TouchableOpacity>
    );
  });

  return (
    <View style={styles.container}>
      <View style={{
        flex: 1,
        position: "absolute",
        top: 30,
        width: "100%",
        height: 70,
        backgroundColor: "black",
        zIndex: 9,
        flexDirection: "row"
      }}>
        <TextInput
          style={{
            justifyContent: "center",
            height: 50,
            top: 10,
            left: 10,
            width: "60%",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#202124",
            color: "#fff",
            padding: 5,
            fontSize: 20
          }}
          onChangeText={setSearchText}
          value={serachText}
          placeholder="Search"
        />
        <TouchableOpacity
          style={{
            justifyContent: "center",
            height: 50,
            top: 10,
            left: 5,
            width: "15%",
            borderRadius: 10,
            borderWidth: 1,
            marginHorizontal: 10,
            marginLeft: 15,
            borderColor: "white",
            backgroundColor: "#202124",
            alignItems: "center"
          }}
        >
          <FontAwesomeIcon
            style={{ color: "white" }}
            size={30}
            icon={"fa-solid fa-table-cells-large"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            justifyContent: "center",
            height: 50,
            top: 10,
            left: 5,
            width: "15%",
            marginRight: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "white",
            backgroundColor: "#202124",
            alignItems: "center"
          }}
        >
          <FontAwesomeIcon
            style={{ color: "white" }}
            size={30}
            icon={"fa-solid fa-earth-europe"}
          />
        </TouchableOpacity>
      </View>
      {data.length ? <FlatList
        style={{
          flex: 1,
          width: "97%",
          paddingTop: 100,
        }}
        data={data}
        renderItem={UserNameItem}
        keyExtractor={item => item.key}
        // initialNumToRender={30}
        maxToRenderPerBatch={12}
        onEndReached={() => {
          loadDataInBatch();
        }}
      /> :
        <FlatList
          style={{
            paddingTop: 35,
            flex: 1,
            width: "97%"
          }}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          renderItem={PlaceholderItem}
          maxToRenderPerBatch={12}
        />}
      {/* <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, veniam placeat ducimus soluta assumenda quos culpa fugiat necessitatibus reprehenderit voluptatum pariatur non deserunt. Quia, inventore ullam dolore tempora earum rerum?</Text> */}

      <StatusBar style="light" backgroundColor='purple' />
      {/* user signup popup */}
      <UserSignupPopup />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    alignItems: 'center',
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#0553',
  },
});

export default Home;
