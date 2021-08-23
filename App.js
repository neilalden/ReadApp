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
import {BackHandler} from 'react-native';

const App = () => {
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <NativeRouter>
      <AuthContextProvider>
        <Route exact path="/" component={() => <Library />} />
        <Route
          exact
          path="/Account"
          component={() => (
            <Account userInfo={userInfo} setUserInfo={setUserInfo} />
          )}
        />
        <Route exact path="/Login" component={Login} />
        <Route exact path="/Register" component={Register} />
        <ClassContextProvider>
          <Route
            exact
            path="/ClassList"
            component={() => (
              <ClassList userInfo={userInfo} setUserInfo={setUserInfo} />
            )}
          />
          <Route
            exact
            path="/Classroom"
            component={() => <Classroom userInfo={userInfo} />}
          />

          <Route
            exact
            path="/Classwork"
            component={() => <Classwork userInfo={userInfo} />}
          />
          <Route exact path="/People" component={() => <People />} />
        </ClassContextProvider>
      </AuthContextProvider>
    </NativeRouter>
  );
};

export default App;
