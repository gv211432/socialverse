import React, { useContext, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import UserContext from '../context/userContext';

const UserSignupPopup = () => {
  const { isOpeningUserScreen, setIsOpeningUserScreen } = useContext(UserContext);
  const userSignPopup = useSharedValue(0);

  useEffect(() => {
    if (isOpeningUserScreen) {
      userSignPopup.value = withTiming(250, { duration: 200 });
    } else {
      userSignPopup.value = withTiming(0, { duration: 200 });
    }
  }, [isOpeningUserScreen]);

  // reanimated animation with to handle gesture
  const animatedContainerStyle = useAnimatedStyle(() => ({
    height: userSignPopup.value,
  }));

  return (
    <Animated.View style={
      [{
        position: "absolute",
        bottom: -30,
        width: "100%",
        padding: 10,
        backgroundColor: "purple",
        borderTopRightRadius: 25,
        borderTopLeftRadius: 25,
        borderColor: "grey",
        borderWidth: 2
      }, animatedContainerStyle]} >
      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          fontWeight: 600,
          padding: 5,
          marginBottom: 6,
          color: "#fff"
        }}
      >Please Sign Up</Text>

      <TouchableOpacity
        title={"Close"}
        style={{
          margin: 3,
          marginBottom: 3,
          borderColor: "white",
          borderRadius: 5,
          height: 50,
          borderWidth: 1,
          justifyContent: "center",

        }}
        onPress={() => setIsOpeningUserScreen(false)}
      >
        <Text style={{
          fontSize: 20,
          textAlign: "center",
          color: "white"
        }}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity
        title={"Close"}
        style={{
          margin: 3,
          marginBottom: 3,
          borderColor: "white",
          borderRadius: 5,
          height: 50,
          borderWidth: 1,
          justifyContent: "center",

        }}
        onPress={() => setIsOpeningUserScreen(false)}
      >
        <Text style={{
          fontSize: 20,
          textAlign: "center",
          color: "white"
        }}>Close</Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 20,
          textAlign: "center",
          padding: 5,
          marginBottom: 6,
          color: "#fff",
          textDecorationLine: "underline"
        }}
      >Already registered? Sign In</Text>

    </Animated.View>
  );
};

export default UserSignupPopup;
