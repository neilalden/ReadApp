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
import RNFS from 'react-native-fs';

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
import Messages from './src/components/general/Messages';
import ViewMessagePage from './src/components/general/ViewMessagePage';
import CreateMessage from './src/components/general/CreateMessage';

const App = () => {
  const [userInfo, setUserInfo] = useState({});
  const [currentFolder, setCurrentFolder] = useState({});
  const [topics, setTopics] = useState([
    {
      name: 'English 1',
      files: [{name: "The king lion's friend.mp4"}],
    },
    {
      name: 'Filipino 1',
      files: [
        {name: 'Ang himutok ni Isay.mp4'},
        {name: 'Ang puso ng mamang may higanteng mga paa.mp4'},
      ],
    },
    {
      name: 'Science 1',
      files: [
        {
          name: 'Relate triangles to quadrilaterals and one quadrilateral to another quadrilateral.pptx',
        },
        {name: 'Our journey to Sci-Math Museum.pptx'},
      ],
    },
  ]);

  useEffect(async () => {
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
    RNFS.readDir(RNFS.ExternalDirectoryPath)
      .then(subject => {
        for (const i in subject) {
          RNFS.readDir(`${RNFS.ExternalDirectoryPath}/${subject[i].name}`)
            .then(files => {
              let topic = {
                name: subject[i].name,
                files: [],
              };
              for (const j in files) {
                topic.files.push({name: files[j].name, isDownloaded: true});
              }
              for (const j in topics) {
                if (topics[j].name.toLowerCase() == topic.name.toLowerCase()) {
                  let topicsCopy = [...topics];
                  topicsCopy[j].files = topicsCopy[j].files.concat(topic.files);
                  setTopics(topicsCopy);
                  return;
                }

                if (topics.length - 1 == j) {
                  setTopics(prev => [...prev, topic]);
                }
              }
            })
            .catch(e => alert(e.message));
        }
      })
      .catch(e => alert(e.message));
    PushNotification.createChannel({
      channelId: 'channel-id', // (required)
      channelName: 'My channel', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: false, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: 4, // (optional) default: 4. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration patten if true.
    });
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
            path="/Messages"
            component={() => (
              <Messages userInfo={userInfo} setUserInfo={setUserInfo} />
            )}
          />
          <Route
            path="/ViewMessage"
            component={() => <ViewMessagePage userInfo={userInfo} />}
          />
          <Route
            path="/CreateMessage"
            component={() => <CreateMessage userInfo={userInfo} />}
          />
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
