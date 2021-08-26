/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {NativeRouter, Route, Link} from 'react-router-native';
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
import {Alert, BackHandler} from 'react-native';
import Materials from './src/components/Materials';

const App = () => {
  const [userInfo, setUserInfo] = useState({});

  const [subjects, setSubjects] = useState([
    {
      subject: 'Advance machine learning',
      materials: ['Module 1.pdf', 'Module 2.docx'],
    },
    {
      subject: 'Algorithms and complexity',
      materials: ['Spanning tree.pptx'],
    },
  ]);
  const [subjectNumber, setSubjectNumber] = useState(0);
  useEffect(() => {
    // TO STOP THE BACK BUTTON FROM CLOSING APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Exit', 'Do you want to leave?');
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
              subjectNumber={subjectNumber}
              setSubjectNumber={setSubjectNumber}
            />
          )}
        />
        <Route
          path="/Materials"
          component={() => (
            <Materials
              subjects={subjects}
              subjectNumber={subjectNumber}
              setSubjectNumber={setSubjectNumber}
            />
          )}
        />
        <Route path="/Login" component={Login} />
        <Route path="/Register" component={Register} />
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
            path="/Classwork"
            component={() => <Classwork userInfo={userInfo} />}
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
          console.log('No Presses');
        },
      },
    ]);
  } else {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => console.log('OK Pressed')},
    ]);
  }
};

export default App;
