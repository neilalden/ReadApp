import React, {useContext, useEffect} from 'react';
import {View, Text, Button, BackHandler, Alert, ScrollView} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Login from './Login';
import Nav from './Nav';
import {signOut} from '../context/AuthContext';

const Account = ({userInfo, setUserInfo}) => {
  useEffect(() => {
    if (Object.keys(userInfo).length === 0 && user) {
      fetchUser(user.displayName, setUserInfo);
    }
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  let {user} = useContext(AuthContext);

  return (
    <>
      {Object.keys(userInfo).length !== 0 && user ? (
        <>
          <ScrollView>
            <View>
              <Text>ID: {userInfo.id}</Text>
              <Text>Name: {userInfo.name}</Text>
              <Text>Phone Number: {userInfo.phoneNumber}</Text>
              <Text>
                Account tyype: {userInfo.isStudent ? 'Student' : 'Teacher'}
              </Text>
              <Text>Classes: {userInfo.classes.toString()}</Text>
              <Button
                title="Logout"
                onPress={() => {
                  signOut();
                }}
              />
            </View>
          </ScrollView>
          <Nav />
        </>
      ) : (
        <Login />
      )}
    </>
  );
};

const alert = (title = 'Error', msg) =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const fetchUser = (id, setUserInfo) => {
  firestore()
    .collection('users')
    .doc(id)
    .get()
    .then(res => {
      setUserInfo({
        classes: res.data().classes,
        id: res.data().id,
        isStudent: res.data().isStudent,
        phoneNumber: res.data().phoneNumber,
        name: res.data().name,
      });
    })
    .catch(e => alert(e));
};
export default Account;
