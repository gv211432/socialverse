import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, PanGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedGestureHandler, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import axiosInstance from '../../helpers/axiosInstance';
import { Video, AVPlaybackStatus } from 'expo-av';
import Example from './Ball';

function worklet() {
  'worklet';
  console.log("Hello");
}

const Reels = () => {
  const [data, setData] = useState([]);
  const dataLength = useSharedValue(0);
  const apiCallCounter = useSharedValue(1);
  const { height: SCREEN_HIGHT } = useWindowDimensions();
  const y = useSharedValue(0);
  const yCopy = useSharedValue(0);
  const preserveY = useSharedValue(0);
  const swipeCount = useSharedValue(0);
  const [swipeCountState, setSwipeCountState] = useState(0);
  const [reelCount, setReelCount] = useState(0);
  const animatedContainerRef = useRef();
  const height = SCREEN_HIGHT;
  const counterRef = useRef(0);
  const [mainHeight, setMainHeight] = useState(null);
  // const height = Dimensions.get(window).height;


  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{
      translateY: withTiming(y.value, { duration: 100, easing: Easing.linear })
    }]
  }));

  function fetchData() {
    console.log("fetching..");
    const result = axiosInstance.get(`/feed?page=${apiCallCounter.value}`);
    result.then(res => {
      apiCallCounter.value = apiCallCounter.value + 1;
      if (res.status == 200) {
        setData(p => [...p, ...res?.data?.posts]);
        dataLength.value = dataLength.value + res?.data?.page_size;
      }
    });
  };

  useEffect(() => {
    fetchData();
    const fetchDataInterval = setInterval(() => {
      console.log("COmpare", swipeCount.value, dataLength.value);
      if (swipeCount.value > (dataLength.value - 3)) {
        fetchData();
      }
    }, 2000);
    return () => clearInterval(fetchDataInterval);
  }, []);

  useEffect(() => {

  }, [swipeCountState]);


  const unlockGestureHandler = useAnimatedGestureHandler({
    onStart: (e) => {
      preserveY.value = y.value;
    },
    onActive: (e) => {
      yCopy.value = e.translationY + yCopy.value;
      y.value = e.translationY + preserveY.value;
    },
    onEnd: (e) => {
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
        } else if ((e.velocityY > 0 && (valYCopy > (valY + (height / 3)))) || e.velocityY > 700) {
          y.value = withTiming(-(valY - height), { duration: 100 });
          swipeCount.value = swipeCount.value - 1;
          runOnJS(setSwipeCountState)(swipeCount.value);
        }
      }
    },
  });


  return (<GestureHandlerRootView
    ref={animatedContainerRef}
    onLayout={e => {
      let { height } = e.nativeEvent.layout;
      setMainHeight(height);
    }}
    style={[styles.container, { backgroundColor: "purple", paddingTop: 15 }]}>
    <View style={{ flex: 0.6 }}><Text>Hi</Text></View>
    {data?.map((d, i) => {
      return (<Animated.View
        key={i}
        style={[styles.containerForAnimation, animatedContainerStyle, { backgroundColor: "cyan" }]}
      >
        <View style={{
          flex: 1,
          height: "100%",
          justifyContent: "center"
        }}>
          {/* <Image
            style={styles.image}
            source={d?.thumbnail_url}
          /> */}
          <Video
            style={styles.video}
            // source={{
            //   uri: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
            // }}
            source={{
              uri: d?.video_link,
            }}
            useNativeControls
            resizeMode="contain"
            isLooping
            shouldPlay={swipeCount.value == i}
          // onPlaybackStatusUpdate={() => ({ isPlaying: "Play" })}
          />
        </View>
      </Animated.View>);
    })}
    <PanGestureHandler onGestureEvent={unlockGestureHandler}>
      <Animated.View
        style={styles.gestureHandler}
      />
    </PanGestureHandler>
    <StatusBar style='light' backgroundColor='purple' />
  </GestureHandlerRootView>);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    height: "100%",
    // transform: [{ translateY: -100 }]
  },
  containerForAnimation: {
    flex: 0,
    backgroundColor: '#fff',
    height: "101%",
    // borderWidth: 5,
    marginVertical: 3,
    // marginTop: 10,
    // borderColor: "black",
    // borderRadius: 10,

    // transform: [{ translateY: -100 }]
  },
  image: {
    flex: 1,
    width: '100%',
    height: "100%",
    // width: "500",
    // height: "500",
    backgroundColor: 'grey',
  },
  gestureHandler: {
    position: "absolute",
    width: "100%",
    height: "90%",
    backgroundColor: "#00000000",
    bottom: 0,
    left: 0
  },
  video: {
    alignSelf: 'center',
    width: "100%",
    height: "100%",
  },
});


export default Reels;
