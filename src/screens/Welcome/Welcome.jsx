import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, Animated, Easing } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import Assets from '../../lottie_assets/lottie_assets';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const Welcome = () => {
  const [progress] = useState(() => new Animated.Value(0));
  useEffect(
    () => {
      Animated.timing(
        progress,
        { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: Platform.OS !== "web" },
      ).start();
    },
    [progress],
  );

  return (
    <>
      <View style={styles.welcome}>
        <LinearGradient
          style={{
            flex: 1, height: "100%", width: "100%",
          }}
          colors={['pink', 'pink', '#3b5998', 'purple']}
        >
          <LottieView
            style={{ flex: 1, top: 180 }}
            source={Assets.lottieFiles.welcome}
            progress={progress}
          />
          <Text style={{
            flex: 1,
            fontSize: 48,
            width: "100%",
            textAlign: "center",
            fontWeight: 500,
            color: "white",
            position: "absolute",
            bottom: 80
          }}>
            Socialverse
          </Text>
        </LinearGradient>
        <StatusBar style="dark" backgroundColor='pink' />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  welcome: {
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    height: "100%"
  }
});

export default Welcome;
