import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import {
  Animated, Button, FlatList, ScrollView, StyleSheet,
  Text, TouchableOpacity, View
} from 'react-native';
import UserContext from '../../context/userContext';
import axiosInstance from '../../helpers/axiosInstance';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { cond, withTiming } from 'react-native-reanimated';

const Home = ({ navigation }) => {
  const { name, homeData, AppEvents, isOpeningUserScreen, setIsOpeningUserScreen, } = useContext(UserContext);
  const [data, setData] = useState(homeData.slice(0, 12));

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

  const UserNameItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        // activeOpacity={0}
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
      {data.length ? <FlatList
        style={{
          flex: 1,
          width: "97%",
          paddingTop: 10,
        }}
        // data={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
        // data={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]}
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
            paddingTop: 10,
            flex: 1,
            width: "97%"
          }}
          data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
          renderItem={PlaceholderItem}
          maxToRenderPerBatch={12}
        />}
      {/* <Text>Lorem ipsum dolor sit amet consectetur adipisicing elit. Reiciendis, veniam placeat ducimus soluta assumenda quos culpa fugiat necessitatibus reprehenderit voluptatum pariatur non deserunt. Quia, inventore ullam dolore tempora earum rerum?</Text> */}
      <StatusBar style="light" backgroundColor='purple' />
      {isOpeningUserScreen && <View style={{
        position: "absolute", bottom: 0,
        height: 150, width: "100%",
        backgroundColor: "white",
        borderTopRightRadius: 30,
        borderTopLeftRadius: 30
      }}>
        <Text>Gello</Text>
        <Button title={"Close"} onPress={() => setIsOpeningUserScreen(false)} />
      </View>}
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
