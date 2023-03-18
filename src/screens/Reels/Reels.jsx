import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler, TapGestureHandler, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import axiosInstance from '../../helpers/axiosInstance';
import { Video, AVPlaybackStatus, Audio } from 'expo-av';
import Example from './Ball';
import UserContext from '../../context/userContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Progress from 'react-native-progress';

const HeartComponent = ({ count = 0, liked = 0 }) => {
  const [on, setOn] = useState(liked ? 1 : 0);
  return (<TouchableWithoutFeedback
    onPress={() => {
      setOn(on ? 0 : 1);
    }}
    style={{ alignItems: "center" }}
  >
    <FontAwesomeIcon
      size={50}
      icon={on ? "fa-solid fa-heart" : "fa-regular fa-heart"}
      color={"#d24e59"}
    />
    <Text
      style={{ marginBottom: 20, color: "white", fontWeight: 100 }}
    >{count + on}</Text>
  </TouchableWithoutFeedback>);
};


const MsgComponent = ({ count = 0 }) => {
  const [on, setOn] = useState(0);
  return (<TouchableWithoutFeedback
    onPress={() => {
      setOn(on ? 0 : 1);
    }}
    style={{ alignItems: "center" }}
  >
    <FontAwesomeIcon
      size={50}
      icon={on ? "fa-solid fa-message" : "fa-regular fa-message"}
      color={"#42a0ee"}
    />
    <Text
      style={{ marginBottom: 20, color: "white", fontWeight: 100 }}
    >{count + on}</Text>
  </TouchableWithoutFeedback>);
};


const ShareComponent = ({ count = 0 }) => {
  const [on, setOn] = useState(0);
  return (<TouchableWithoutFeedback
    onPress={() => {
      setOn(on ? 0 : 1);
    }}
    style={{ alignItems: "center" }}
  >
    <FontAwesomeIcon
      size={50}
      icon={"fa-solid fa-share-nodes"}
      color={"#6dd381"}
    />
    <Text
      style={{ marginBottom: 20, color: "white", fontWeight: 100 }}
    >{count + on}</Text>
  </TouchableWithoutFeedback>);
};

const Reels = ({ navigation, route }) => {
  const { currentScreen, AppEvents } = useContext(UserContext);
  const { height: SCREEN_HIGHT } = useWindowDimensions();
  const height = SCREEN_HIGHT;
  const counterRef = useRef(0);
  const [data, setData] = useState([]);
  const dataLength = useSharedValue(0);
  const apiCallCounter = useSharedValue(1);
  const y = useSharedValue(0);
  const yCopy = useSharedValue(0);
  const preserveY = useSharedValue(0);
  const swipeCount = useSharedValue(0);
  const [swipeCountState, setSwipeCountState] = useState(0);
  const [reelCount, setReelCount] = useState(0);
  const addedReelPageNoRef = useRef(new Set());
  const animatedContainerRef = useRef();
  const [mainHeight, setMainHeight] = useState(null);
  const [mainWidth, setMainWidth] = useState(null);
  const [reelLoaded, setReelLoaded] = useState(false);
  const isThisATap = useSharedValue(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReelOpen, setIsReelOpen] = useState(false);
  // const height = Dimensions.get(window).height;

  // stop another sounds before playing reels
  const stopOtherSoundSource = async () => {
    const AUDIO = new Audio.Sound();
    await AUDIO.unloadAsync();
  };

  // attaching events on load and detaching on unload of screen
  useEffect(useCallback(() => {
    // this event just brings the reels to the top, but not reload reels
    AppEvents.on("refresh_reels_screen", (reload = false, firstDataToLoad = null) => {
      console.log("refresh_reels_screen");
      if (swipeCount.value > 10) {
        y.value = withTiming(0, { duration: 1000, easing: Easing.sin });
        swipeCount.value = 0;
        setTimeout(() => setSwipeCountState(0), 1000);
      } else if (swipeCount.value > 4) {
        y.value = withTiming(0, { duration: 500, easing: Easing.sin });
        swipeCount.value = 0;
        setTimeout(() => setSwipeCountState(0), 500);
      } else {
        y.value = withTiming(0, { duration: 300, easing: Easing.sin });
        swipeCount.value = 0;
        setSwipeCountState(0);
      }
      if (reload && firstDataToLoad) {
        console.warn("Reset and one reel load and more reels load");
        swipeCount.value = 0;
        dataLength.value = 1;
        setData([firstDataToLoad]);
        fetchData();
      }
    });
    return () => {
      AppEvents.off("refresh_reels_screen");
    };
  }));

  // will call on mounting of the screen component
  useEffect(() => {
    stopOtherSoundSource();
    console.log("Reels screen Loaded");
    fetchData(); // initial fetching of data
    const fetchDataInterval = setInterval(() => {
      console.log("COmpare", swipeCount.value, dataLength.value);
      if (swipeCount.value > (dataLength.value - 3)) {
        fetchData();
      }
    }, 2000);
    return () => {
      clearInterval(fetchDataInterval);
      console.log("Reels screen Unloaded");
    };
  }, []);

  // listening to ccurrentScreen state
  useEffect(() => {
    // console.log(currentScreen);
    if (currentScreen?.index != 1) {
      setIsPlaying(false);
      setIsReelOpen(true);
    } else {
      setIsPlaying(true);
      setIsReelOpen(false);
    }
  }, [currentScreen]);

  // reanimated animation with to handle gesture
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: withTiming(y.value, { duration: 100, easing: Easing.linear })
    }]
  }));

  const animatedSpinnerStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: withTiming(y.value / 30, { duration: 100, easing: Easing.linear })
    }]
  }));

  // generates random numbers between 1 to 79
  const genRandomNo_1_to_79 = () => {
    return Math.trunc(Math.random() * 79);
  };

  // this function fetchs the api data for unique pages but randomly
  // it receives 5 reels per page
  const fetchData = useCallback(async () => {
    while (1) { // keey trying untill unique random no is generated
      const pageNo = genRandomNo_1_to_79();
      if (addedReelPageNoRef.current.has(pageNo)) continue;
      console.log("fetching..");
      const res = await axiosInstance.get(`/feed?page=${pageNo}`);
      addedReelPageNoRef.current.add(pageNo);
      if (res.status == 200) {
        if (res?.data?.posts && res?.data?.posts?.length) {
          setData(p => [...p, ...res?.data?.posts]);
          dataLength.value = dataLength.value + res?.data?.posts?.length;
        } else {
          continue;
        }
        apiCallCounter.value = apiCallCounter.value + 1;
      }
      break;
    }
  });

  // useEffect(() => {

  // }, [swipeCountState]);

  // this handler handles the facilitates the swipe up and downs
  const unlockGestureHandler = useAnimatedGestureHandler({
    onFinish: (e) => {
      // console.log("Finished, Is this a tap", isThisATap.value);
      if (isThisATap.value) {
        runOnJS(setIsPlaying)(!isPlaying);
      }
    },
    onStart: (e) => {
      // console.log(e);
      isThisATap.value = true;
      preserveY.value = y.value;
    },
    onActive: (e) => {
      yCopy.value = e.translationY + yCopy.value;
      y.value = e.translationY + preserveY.value;
    },
    onEnd: (e) => {
      isThisATap.value = false;
      // const height = animatedContainerRef.clientHeight;
      const height = mainHeight;
      y.value = preserveY.value;
      // console.log("e.translationY", e.translationY);
      const valY = Math.abs(y.value);
      const valYCopy = Math.abs(yCopy.value);

      // console.log("y.value", "yCopy", "height / 3", "height", "e.velocityY");
      // console.log(valY, valYCopy, valY + (height / 3), height, e.velocityY);

      if ((swipeCount.value < dataLength.value && swipeCount.value > 0)
        || (swipeCount.value == dataLength.value && e.velocityY > 0)
        || (swipeCount.value == 0 && e.velocityY < 0)
      ) {
        if ((e.velocityY < 0 && (valYCopy > (valY + (height / 3)))) || e.velocityY < -700) {
          y.value = withTiming(-(valY + height), { duration: 100 });
          swipeCount.value = swipeCount.value + 1;
          runOnJS(setSwipeCountState)(swipeCount.value);
          runOnJS(setReelLoaded)(false);
        } else if ((e.velocityY > 0 && (valYCopy > (valY + (height / 3)))) || e.velocityY > 700) {
          y.value = withTiming(-(valY - height), { duration: 100 });
          swipeCount.value = swipeCount.value - 1;
          runOnJS(setSwipeCountState)(swipeCount.value);
          runOnJS(setReelLoaded)(false);
        }
      } else if (e.velocityY > 700) {
        if (swipeCount.value == 0) {
          dataLength.value = 0;
          swipeCount.value = 0;
          console.warn("Refresh");
          runOnJS(setData)([]);
          runOnJS(fetchData)();
        }
      }
    },
  });

  return (
    <GestureHandlerRootView
      ref={animatedContainerRef}
      onLayout={e => {
        let { height, width } = e.nativeEvent.layout;
        setMainHeight(height);
        setMainWidth(width);
      }}
      style={[styles.container,
      { backgroundColor: "black", paddingTop: 15 }
      ]}>
      <View style={{ flex: 0.6 }}><Text>Hi</Text></View>
      {/* <Animated.View style={[{
        position: "absolute",
        backgroundColor: "pink",
        height: 30, width: "100%",
        justifyContent: "center"
      }, animatedSpinnerStyle]}>
        <Text styl>Refresh</Text>
      </Animated.View> */}

      {data?.map((d, i) => {
        return (<Animated.View
          key={i}
          style={[styles.containerForAnimation,
            animatedContainerStyle,
          { backgroundColor: "black" }]}
        >
          <View style={{
            flex: 1,
            height: "100%",
            width: "100%",
            justifyContent: "center"
          }}>
            {((swipeCount.value == i || swipeCount.value == i - 1 || swipeCount.value == i + 1)
              && !reelLoaded) &&
              (
                <Image
                  style={[styles.image, { position: "absolute", width: "100%", height: "100%" }]}
                  source={d?.thumbnail_url}
                  contentFit={"fill"}
                />
              )}
            {(i <= swipeCount.value + 2 || i >= swipeCount.value - 2) && <Video
              style={[styles.video, {
                height: mainHeight,
                width: mainWidth,
              }]}
              source={{
                uri: d?.video_link,
              }}
              useNativeControls={false}
              resizeMode="cover"
              isLooping
              onLoad={(e) => {
                // setReelLoaded(true);
              }}
              shouldPlay={(swipeCount.value == i) && isPlaying}
            // onPlaybackStatusUpdate={() => ({ isPlaying: "Play" })}
            />}
          </View>
          {/*====================== pause icon for the reels ======================*/}
          {!isPlaying && <View
            style={{ position: "absolute", left: "48%", top: "50%", }}
          >
            <FontAwesomeIcon
              size={50}
              icon={"fa-solid fa-play"}
              color={"#fff"}
              style={{ marginBottom: 20, opacity: 0.8 }}
            />
          </View>}

          {/* ====================== some reel owners data ======================*/}
          {/* <View style={{
            height: "20%",
            width: "80%",
            left: 5,
            bottom: 0,
            position: "absolute"
          }}>
            <View
              style={{
                left: 5,
                bottom: 50,
                position: "absolute"
              }}
            >
              <View style={{ borderRadius: 25, flexDirection: "row", alignItems: "center" }}>
                <Image source={d?.picture_url}
                  style={{ height: 50, width: 50, borderRadius: 25, marginRight: 6 }}
                />
                <View>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, color: "#fff", fontWeight: 600, marginRight: 15 }}>{d?.first_name}</Text>
                    <Text style={{
                      borderWidth: 1,
                      borderColor: "white",
                      borderRadius: 4,
                      backgroundColor: "#ffffff00",
                      color: "white",
                      padding: 5
                    }}>Subscribe</Text>
                  </View>
                  <Text style={{ color: "#fff", textDecoration: "underline" }}>@{d?.username}</Text>
                </View>
              </View>
              <View>
                <Text style={{ color: "#fff", fontWeight: 40 }}>{d?.title}</Text>
              </View>
            </View>
          </View> */}

          {/*======= some reels controls for liking commenting sharing etc ======*/}
          {/* <View style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: 70,
            alignItems: 'center',
          }}>
            <HeartComponent count={d?.upvote_count} liked={d?.upvoted} />
            <MsgComponent count={d?.comment_count} />
            <ShareComponent count={d?.share_count} />

            <FontAwesomeIcon
              size={40}
              icon={"fa-solid fa-ellipsis"}
              color={"#fff"}
              style={{ marginBottom: 30 }}
            />
          </View> */}
        </Animated.View>);
      })}
      {/* {data?.length == 0 && <View style={{
        flex: 1, height: "100%", width: "100%"
      }}>
        <Progress.CircleSnail color={['red', 'green', 'blue']} />
      </View>} */}
      <PanGestureHandler onGestureEvent={unlockGestureHandler}
        style={{ backgroundColor: "pink" }}
      >
        <Animated.View
          style={styles.gestureHandler}
        >
        </Animated.View>
      </PanGestureHandler>
      <StatusBar style='light' backgroundColor='purple' />
    </GestureHandlerRootView>);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: "100%",
  },
  containerForAnimation: {
    flex: 0,
    // backgroundColor: '#fff',
    height: "101%",
    marginVertical: 3,
  },
  image: {
    flex: 1,
    width: '100%',
    height: "100%",
    backgroundColor: 'black',
    opacity: 0.5,
  },
  gestureHandler: {
    position: "absolute",
    width: "83%",
    height: "100%",
    // backgroundColor: "#ffffffa0",
    bottom: 0,
    left: 0
  },
  video: {
    alignSelf: 'center',
    width: "100%",
    height: "100%",
    // transform: [{ scaleX: 1.2 }]
  },
});


export default Reels;
