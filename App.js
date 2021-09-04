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
import Grades from './src/components/Grades';
import CreateClasswork from './src/components/CreateClasswork';
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
    {
      subject: 'Computational science',
      materials: ['CSEL 303 - Week 2.pptx'],
    },
    {
      subject: 'Natural language processing',
      materials: ['ISI 03 - Week 2.pptx'],
    },
    {
      subject: 'Culinary arts',
      materials: ['fried chicken habang medyo maulan.mp4'],
    },
    {
      subject: 'Software engineering',
      materials: ['435_Chapter1.pptx'],
    },
  ]);
  const [subjectName, setSubjectName] = useState('');
  useEffect(() => {
    // TO STOP THE BACK BUTTON FROM CLOSING APP
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
              subjects={subjects}
              setSubjectName={setSubjectName}
            />
          )}
        />
        <Route
          path="/Materials"
          component={() => (
            <Materials
              subjects={subjects}
              subjects={subjects}
              subjectName={subjectName}
            />
          )}
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
