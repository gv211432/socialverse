import { StatusBar } from 'expo-status-bar';
import { useCallback, useContext, useEffect, useState } from 'react';
import UserContext from './src/context/userContext';
import { config, library } from '@fortawesome/fontawesome-svg-core';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './src/screens/Home/Home';
import ReelsScreen from './src/screens/Reels/Reels';
import UserScreen from './src/screens/User/User';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { Animated, Button } from 'react-native';
import WelcomeScreen from './src/screens/Welcome/Welcome';
import { createStackNavigator } from '@react-navigation/stack';
import Reels from './src/screens/Reels/Reels';
import EventEmitter from "EventEmitter";
import axiosInstance from './src/helpers/axiosInstance';
import axios from 'axios';

// this code initializes the font awesome iocns
config.autoAddCss = false;
library.add(far, fas);

const Tab = createBottomTabNavigator();

export default function App() {
  const AppEvents = new EventEmitter();
  const [name, setName] = useState("");
  const [isWelcome, setIsWelcome] = useState(1);
  const [currentScreen, setCurrentScreen] = useState(null);
  const [homeData, setHomeData] = useState([]);
  const [isOpeningUserScreen, setIsOpeningUserScreen] = useState(false);

  // this function fetchs the api data for unique pages but randomly
  // it receives 5 reels per page
  const fetchData = useCallback(async () => {
    console.log("Fetching data..");
    const res = await axios.get("https://socialverse.surge.sh/data3.json");
    if (res.status == 200) {
      setHomeData(res?.data?.data);
      console.log("Fetched data..");
    }
  });

  useEffect(() => {
    fetchData();
    setTimeout(() => setIsWelcome(0), 2200);
  }, []);

  return (
    <UserContext.Provider
      value={{
        name, setName,
        currentScreen, setCurrentScreen,
        AppEvents,
        homeData, setHomeData,
        isOpeningUserScreen, setIsOpeningUserScreen,
      }}
    >
      {isWelcome == 1 && <WelcomeScreen />}
      <NavigationContainer
        onStateChange={(state) => {
          setCurrentScreen(state);
        }}
      >
        <Tab.Navigator
          initialRouteName='Reels'
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'Home') {
                iconName = focused
                  ? 'fa-solid fa-house'
                  : 'fa-solid fa-house';
              } else if (route.name === 'Reels') {
                iconName = focused
                  ? 'fa-solid fa-file-video'
                  : 'fa-regular fa-file-video';
              } else {
                iconName = focused
                  ? 'fa-solid fa-circle-user'
                  : 'fa-regular fa-circle-user';
              }

              // returning the actual icon
              return (
                <FontAwesomeIcon
                  size={30}
                  icon={iconName}
                  color={"#fff"}
                />
              );
            },
            tabBarActiveTintColor: '#fff',
            tabBarInactiveTintColor: 'lightgrey',
            tabBarStyle: {
              backgroundColor: 'purple',
            },
          
          })}
        >
          <Tab.Screen name="Home" component={HomeScreen}
            options={{ headerShown: false }}
            listeners={(nav, route) => ({
              tabPress: e => {
                if (currentScreen?.index == 0) {
                  // setName("Home");
                }
              }
            })}
          />
          <Tab.Screen name="Reels" component={Reels}
            options={{ headerShown: false }}
            listeners={(nav, route) => ({
              tabPress: e => {
                if (currentScreen?.index == 1) {
                  console.log("Pressed again..");
                  // setName("Reels");
                  AppEvents.emit("refresh_reels_screen");
                }
                AppEvents.emit("router_state_update", currentScreen);
              }
            })}
          />
          <Tab.Screen name="User"
            component={UserScreen}
            listeners={(nav, route) => ({
              tabPress: e => {
                e.preventDefault();
                setIsOpeningUserScreen(true);
                if (currentScreen?.index == 1) {
                  // setName("User");
                }
              }
            })}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </UserContext.Provider>
  );
}
