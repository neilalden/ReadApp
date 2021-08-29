import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  Button,
  BackHandler,
  Alert,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import Nav from './Nav';
import {signOut} from '../context/AuthContext';
import {useHistory} from 'react-router';
import {ClassContext, fetchClassList} from '../context/ClassContext';
import IconProfile from '../../assets/profile.svg';
const Account = ({userInfo, setUserInfo}) => {
  let history = useHistory();
  let {user} = useContext(AuthContext);
  const {classList, setClassList} = useContext(ClassContext);
  const [subjects, setSubjects] = useState([]);
  useEffect(() => {
    if (!user) {
      setUserInfo({});
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      fetchUser(user.displayName, setUserInfo);
    } else if (userInfo && classList.length === 0) {
      fetchClassList(userInfo, setClassList);
    }
    if (classList) {
      setSubjects([]);
      for (const i in classList) {
        setSubjects(prev => [...prev, classList[i].subject]);
      }
    }

    // TO STOP THE BACK BUTTON FROM CLOSING APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Exit', 'Do you want to leave?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [user, userInfo, classList]);

  if (classList.length === 0) {
    return (
      <View style={styles.textCenterContainer}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <>
        <ScrollView style={styles.scrollView}>
          <View style={styles.iconContainer}>
            <IconProfile style={styles.icon} height={150} width={150} />
          </View>
          <View style={styles.accountContainer}>
            <Text style={styles.accountType}>
              {userInfo.isStudent ? 'Student' : 'Teacher'}
            </Text>
          </View>
          <Text style={styles.accountName}>{userInfo.name}</Text>

          <View style={styles.accountInfoContainer}>
            <View style={styles.accountInfo}>
              <Text style={styles.accountText}>ID:</Text>
              <Text style={styles.accountText}>{userInfo.id}</Text>
            </View>
            <View style={styles.accountInfo}>
              <Text style={styles.accountText}>Phone Number:</Text>
              <Text style={styles.accountText}>{userInfo.phoneNumber}</Text>
            </View>
          </View>

          <View style={styles.accountInfoContainer2}>
            <Text style={styles.classesText}>Classes</Text>
            <Text style={styles.accountText}>
              {subjects ? subjects.toString().replace(',', ', ') : ''}
            </Text>
          </View>

          <View style={styles.buttonView}>
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
  }
};

const alert = (title = 'Error', msg) => {
  if (title == 'Exit') {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  } else {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => true},
    ]);
  }
};

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
    .catch(e => alert('error', e));
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#ADD8E6',
  },
  iconContainer: {
    padding: 15,
  },
  icon: {
    alignSelf: 'center',
  },
  accountContainer: {
    backgroundColor: '#333333',
    width: 'auto',
    marginHorizontal: 90,
    justifyContent: 'center',
  },
  accountType: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
    color: 'white',
  },
  accountName: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    padding: 15,
    textAlign: 'center',
  },
  accountInfoContainer: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  accountInfoContainer2: {
    marginTop: 5,
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  accountInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontFamily: 'Lato-Regular',
  },
  accountText: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    marginVertical: 10,
  },
  buttonView: {
    padding: 15,
    borderRadius: 10,
  },
  classesText: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
  },
  textCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default Account;
