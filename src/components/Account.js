import React, {useContext, useEffect} from 'react';
import {View, Text, Button, BackHandler, Alert, ScrollView} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Login from './Login';
import Nav from './Nav';
import {signOut} from '../context/AuthContext';
import {useHistory} from 'react-router';

const Account = ({userInfo, setUserInfo}) => {
  let {user} = useContext(AuthContext);
  let history = useHistory();
  useEffect(() => {
    if (!user) {
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      fetchUser(user.displayName, setUserInfo);
    }
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [user]);
  return (
    <>
      <ScrollView>
        <View>
          <Text>ID: {userInfo.id}</Text>
          <Text>Name: {userInfo.name}</Text>
          <Text>Phone Number: {userInfo.phoneNumber}</Text>
          <Text>
            Account tyype: {userInfo.isStudent ? 'Student' : 'Teacher'}
          </Text>
          <Text>
            Classes: {userInfo.classes ? userInfo.classes.toString() : ''}
          </Text>
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
        id: res.data().id,
        isStudent: res.data().isStudent,
        name: res.data().name,
        phoneNumber: res.data().phoneNumber,
        classes: res.data().classes,
      });
    })
    .catch(e => alert(e));
};
export default Account;
