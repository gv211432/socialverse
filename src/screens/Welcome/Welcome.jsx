import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import Assets from '../../lottie_assets/lottie_assets';
import { StatusBar } from 'expo-status-bar';

const Welcome = () => {
  return (
    <>
      <View style={styles.welcome}>
        <LottieView
          style={{ flex: 1 }}
          loop
          autoPlay
          source={require('./social.json')}
        />
        <Text>
          Socialverse
        </Text>
        <StatusBar style="dark" backgroundColor='pink' />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  welcome: {
    backgroundColor: "pink",
    alignItems: "center",
    alignContent: "center",
    justifyContent: "center",
    height: "100%"
  }
});

export default Welcome;
