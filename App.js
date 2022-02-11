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

import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

import AuthContextProvider from './src/context/AuthContext';
import ClassContextProvider from './src/context/ClassContext';

import LibraryPage from './src/components/general/LibraryPage';
import MaterialsPage from './src/components/general/MaterialsPage';
import LoginPage from './src/components/general/LoginPage';
import RegisterPage from './src/components/general/RegisterPage';
import ClassListPage from './src/components/general/ClassListPage';
import ClassroomPage from './src/components/general/ClassroomPage';
import ClassworkPage from './src/components/general/ClassworkPage';
import GradesPage from './src/components/teacher/GradesPage';
import PeoplePage from './src/components/general/PeoplePage';
import CreateClassworkPage from './src/components/teacher/CreateClassworkPage';
import CreatePostPage from './src/components/general/CreatePostPage';
import FeedPage from './src/components/general/FeedPage';

const App = () => {
  const [userInfo, setUserInfo] = useState({});
  const [currentFolder, setCurrentFolder] = useState({});
  const [headerImageRandNum, setHeaderImageRandNum] = useState(1);
  const [topics, setTopics] = useState([
    {
      name: 'English 1',
      files: ["The king lion's friend.mp4"],
    },
    {
      name: 'Filipino 1',
      files: [
        'Ang himutok ni Isay.mp4',
        'Ang puso ng mamang may higanteng mga paa.mp4',
      ],
    },
    {
      name: 'Science 1',
      files: [
        'Relate triangles to quadrilaterals and one quadrilateral to another quadrilateral.pptx',
        'Our journey to Sci-Math Museum.pptx',
      ],
    },
  ]);

  useEffect(async () => {
    const libRandNum = Math.floor(Math.random() * 16) + 1;
    setHeaderImageRandNum(libRandNum);
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

    const unsubscribe = messaging().onMessage(async remoteMessage => {
      PushNotification.localNotification({
        message: remoteMessage.notification.body,
        title: remoteMessage.notification.title,
        bigPictureUrl: remoteMessage.notification.android.imageUrl,
        smallIcon: remoteMessage.notification.android.imageUrl,
      });
    });
    return unsubscribe;
  }, []);

  return (
    <NativeRouter>
      <AuthContextProvider>
        <Route
          exact
          path="/"
          component={() => (
            <LibraryPage setCurrentFolder={setCurrentFolder} topics={topics} />
          )}
        />
        <Route
          path="/Materials"
          component={() => <MaterialsPage currentFolder={currentFolder} />}
        />
        <Route path="/Register" component={RegisterPage} />
        <Route path="/Login" component={() => <LoginPage />} />
        <ClassContextProvider>
          <Route
            path="/ClassList"
            component={() => (
              <ClassListPage userInfo={userInfo} setUserInfo={setUserInfo} />
            )}
          />
          <Route
            path="/Classroom"
            component={() => <ClassroomPage userInfo={userInfo} />}
          />
          <Route
            path="/CreateClasswork"
            component={() => <CreateClassworkPage userInfo={userInfo} />}
          />
          <Route
            path="/CreatePost"
            component={() => <CreatePostPage userInfo={userInfo} />}
          />
          <Route
            path="/Classwork"
            component={() => <ClassworkPage userInfo={userInfo} />}
          />
          <Route
            path="/Feed"
            component={() => <FeedPage userInfo={userInfo} />}
          />
          <Route
            path="/People"
            component={() => <PeoplePage userInfo={userInfo} />}
          />
          <Route
            path="/Grades"
            component={() => <GradesPage userInfo={userInfo} />}
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
