/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useEffect, useState} from 'react';
import {NativeRouter, Route, Link} from 'react-router-native';
import Library from './src/components/Library';
import ClassList from './src/components/ClassList';
import AuthContextProvider from './src/context/AuthContext';
import Register from './src/components/Register';
import Login from './src/components/Login';
import Classwork from './src/components/Classwork';
import Account from './src/components/Account';
import Classroom from './src/components/Classroom';
import People from './src/components/People';
import {BackHandler} from 'react-native';

const App = () => {
  const [classroomId, setClassroomId] = useState('');
  const [classList, setClassList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [classworkInfo, setClassworkInfo] = useState({});
  const [courseCode, setCourseCode] = useState('');
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <AuthContextProvider>
      <NativeRouter>
        <Route exact path="/" component={() => <Library />} />
        <Route
          exact
          path="/Account"
          component={() => (
            <Account userInfo={userInfo} setUserInfo={setUserInfo} />
          )}
        />
        <Route
          exact
          path="/ClassList"
          component={() => (
            <ClassList
              classList={classList}
              userInfo={userInfo}
              setClassList={setClassList}
              setUserInfo={setUserInfo}
              setClassroomId={setClassroomId}
              setCourseCode={setCourseCode}
            />
          )}
        />
        <Route
          exact
          path="/Classroom"
          component={() => (
            <Classroom
              classroomId={classroomId}
              userInfo={userInfo}
              setClassworkInfo={setClassworkInfo}
              courseCode={courseCode}
            />
          )}
        />

        <Route
          exact
          path="/Classwork"
          component={() => (
            <Classwork
              classroomId={classroomId}
              userInfo={userInfo}
              classworkInfo={classworkInfo}
              courseCode={courseCode}
            />
          )}
        />
        <Route
          exact
          path="/People"
          component={() => (
            <People classroomId={classroomId} courseCode={courseCode} />
          )}
        />

        <Route exact path="/Login" component={Login} />
        <Route
          exact
          path="/Register"
          component={() => (
            <Register isLoading={isLoading} setIsLoading={setIsLoading} />
          )}
        />
      </NativeRouter>
    </AuthContextProvider>
  );
};

export default App;
