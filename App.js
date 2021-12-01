/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {NativeRouter, Route, Link} from 'react-router-native';
import {Alert, BackHandler, PermissionsAndroid} from 'react-native';
import AuthContextProvider from './src/context/AuthContext';
import ClassContextProvider from './src/context/ClassContext';
import Library from './src/components/Library';
import ClassList from './src/components/ClassList';
import Register from './src/components/Register';
import Login from './src/components/Login';
import Classwork from './src/components/Classwork';
import Account from './src/components/Account';
import Classroom from './src/components/Classroom';
import People from './src/components/People';
import Materials from './src/components/Materials';
import Grades from './src/components/Grades';
import CreateClasswork from './src/components/CreateClasswork';

const App = () => {
  const [userInfo, setUserInfo] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [currSubj, setCurrSubj] = useState({});
  const [libSvgRandNum, setLibSvgRandNum] = useState(1);

  useEffect(async () => {
    const libRandNum = Math.floor(Math.random() * 16) + 1;
    setLibSvgRandNum(libRandNum);
    // TO STOP THE BACK BUTTON FROM CLOSING APP
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'ReadApp Storage Permission',
          message:
            'ReadApp needs access to your storage ' +
            'so you can upload files from your storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    } catch (err) {
      alert('Error', `${err}`);
    }
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'ReadApp Storage Permission',
          message:
            'ReadApp needs access to your storage ' +
            'so you can save files to your storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    } catch (err) {
      alert('Error', `${err}`);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <NativeRouter>
      <AuthContextProvider>
        <Route
          exact
          path="/"
          component={() => (
            <Library
              subjects={subjects}
              setSubjects={setSubjects}
              setCurrSubj={setCurrSubj}
              libSvgRandNum={libSvgRandNum}
            />
          )}
        />
        <Route
          path="/Materials"
          component={() => <Materials currSubj={currSubj} />}
        />
        <Route path="/Register" component={Register} />
        <Route
          path="/Login"
          component={() => (
            <Login userInfo={userInfo} setUserInfo={setUserInfo} />
          )}
        />
        <ClassContextProvider>
          <Route
            path="/Account"
            component={() => (
              <Account userInfo={userInfo} setUserInfo={setUserInfo} />
            )}
          />
          <Route
            path="/ClassList"
            component={() => (
              <ClassList userInfo={userInfo} setUserInfo={setUserInfo} />
            )}
          />
          <Route
            path="/Classroom"
            component={() => <Classroom userInfo={userInfo} />}
          />
          <Route
            path="/CreateClasswork"
            component={() => <CreateClasswork userInfo={userInfo} />}
          />
          <Route
            path="/Classwork"
            component={() => <Classwork userInfo={userInfo} />}
          />
          <Route
            path="/Grades"
            component={() => <Grades userInfo={userInfo} />}
          />
          <Route
            path="/People"
            component={() => <People userInfo={userInfo} />}
          />
        </ClassContextProvider>
      </AuthContextProvider>
    </NativeRouter>
  );
};
const alert = (title = 'Error', msg) => {
  if (title == 'Exit') {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          return true;
        },
      },
    ]);
  } else {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => true},
    ]);
  }
};

export default App;
