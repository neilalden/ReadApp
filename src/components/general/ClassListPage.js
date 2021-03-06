import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  BackHandler,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import RBSheet from 'react-native-raw-bottom-sheet';
import {useHistory} from 'react-router-native';
import {AuthContext, signOut} from '../../context/AuthContext';
import {ClassContext, fetchClassList} from '../../context/ClassContext';
import IconAddClass from '../../../assets/addClass.svg';
import IconLeave from '../../../assets/leave.svg';
import Nav from './Nav';

import StudentClassList from '../student/StudentClassList';
import TeacherClassList from '../teacher/TeacherClassList';
import AddClassForm from '../teacher/AddClassForm';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ClassListPage = ({userInfo, setUserInfo}) => {
  /***STATES***/
  const history = useHistory();
  const {classList, setClassList} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  const refRBSheet = useRef();
  // FOR THE TEXT INPUT OF CREATING A NEW CLASS
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  /***HOOKS***/
  useEffect(() => {
    if (!user) {
      // no user;
      history.push('/Login');
      setUserInfo({});
      setClassList([]);
    } else if (
      Object.keys(userInfo).length === 0 &&
      Object.keys(user).length !== 0
    ) {
      // user logged in but no information on them
      fetchUser(user.displayName);
    } else if (
      Object.keys(userInfo).length !== 0 &&
      user &&
      classList.length === 0
    ) {
      setClassList([]);
      fetchClassList(userInfo, setClassList);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  useEffect(() => {
    if (Object.keys(userInfo).length !== 0 && Object.keys(user).length !== 0) {
      if (userInfo.id == undefined) return;

      const subscriber = firestore()
        .collection('users')
        .doc(userInfo.id)
        .onSnapshot(snapshot => {
          if (snapshot == undefined) {
            return;
          }
          if (
            snapshot.data().classes &&
            userInfo.classes.length !== snapshot.data().classes.length
          ) {
            fetchClassList(snapshot.data(), setClassList);
            setUserInfo(snapshot.data());
          }
        });
      return () => subscriber();
    }
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser(user.displayName);
    setClassList([]);
    wait(1000).then(() => {
      fetchClassList(userInfo, setClassList);
      setRefreshing(false);
    });
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  /***FUNCTIONS***/
  const fetchUser = id => {
    NetInfo.fetch().then(state => {
      if (!state.isConnected) {
        getData('userInfo', setUserInfo);
      } else {
        firestore()
          .collection('users')
          .doc(id)
          .get()
          .then(res => {
            if (!res.data()) {
              // USER DOES NOT EXIST
              history.push('/Register');
            } else {
              setUserInfo(res.data());
              storeData('userInfo', {userInfo: res.data()});
            }
          })
          .catch(e => alert(e.message, e.code));
      }
    });
  };
  const storeData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (e) {
      // alert(e.message);
    }
  };
  const getData = async (key, setFunction) => {
    AsyncStorage.getItem(key)
      .then(jsonValue => {
        setFunction(JSON.parse(jsonValue).userInfo);
      })
      .catch(e => alert(e.message));
  };

  if (Object.keys(userInfo).length === 0 || Object.keys(user).length === 0) {
    return <></>;
  }

  return (
    <>
      <ScrollView
        style={{backgroundColor: '#fff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <ClassListPageHeader
          user={user}
          userInfo={userInfo}
          history={history}
          setUserInfo={setUserInfo}
        />
        <Segment userInfo={userInfo} refRBSheet={refRBSheet} />
        {userInfo.classes && userInfo.classes.length > 0 ? (
          userInfo.isStudent ? (
            <StudentClassList />
          ) : (
            <TeacherClassList />
          )
        ) : (
          <Text style={styles.itemSubtitle}>No classes yet</Text>
        )}
        <RBSheet
          ref={refRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={true}
          closeOnPressBack={true}
          animationType="slide"
          onClose={() => {
            setSection('');
            setSubject('');
          }}
          customStyles={{
            wrapper: {
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
            draggableIcon: {
              backgroundColor: '#000',
            },
            container: {
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            },
          }}>
          <AddClassForm
            user={user}
            subject={subject}
            setSubject={setSubject}
            section={section}
            setSection={setSection}
            userInfo={userInfo}
            classList={classList}
            setClassList={setClassList}
            refRBSheet={refRBSheet}
          />
        </RBSheet>
      </ScrollView>
      <Nav />
    </>
  );
};

const ClassListPageHeader = ({user, userInfo, history, setUserInfo}) => {
  const handleLogout = () => {
    Alert.alert('Logout?', `Are you sure you want to logout your account?`, [
      {
        text: 'Yes',
        onPress: () => {
          history.push('/Login');
          setUserInfo({});
          signOut();
        },
      },
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  };
  return (
    <View style={styles.classListPageHeader}>
      <View style={styles.profileDetailsContainer}>
        <View style={styles.imageContainer}>
          <View height={35} width={35}></View>
          <Image
            style={styles.profileImage}
            source={{
              uri: user.photoURL,
            }}
          />
          <TouchableOpacity
            style={styles.leaveIconContainer}
            onPress={handleLogout}>
            <IconLeave height={25} width={25} style={styles.leaveIcon} />
          </TouchableOpacity>
        </View>
        <View style={{alignItems: 'center'}}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{userInfo.name}</Text>
          </View>
          <Text style={styles.profileSubtitle}>
            {userInfo.isStudent ? 'Student ID : ' : 'Teacher ID : '}
            {userInfo.id}
          </Text>
        </View>
      </View>
    </View>
  );
};

const Segment = ({userInfo, refRBSheet}) => {
  return (
    <View style={{backgroundColor: '#ADD8E6'}}>
      <View style={styles.curvedSegment}>
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={() => {
            if (!userInfo.isStudent) refRBSheet.current.open();
          }}>
          {!userInfo.isStudent && (
            <IconAddClass height={30} width={30} style={styles.addIcon} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  classListPageHeader: {
    backgroundColor: '#ADD8E6',
    padding: 18,
  },
  profileDetailsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    borderRadius: 50,
    height: 100,
    width: 100,
    margin: 10,
  },
  profileNameContainer: {
    backgroundColor: '#3d3d3d',
    width: 'auto',
    marginHorizontal: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
    color: 'white',
    minWidth: '75%',
  },
  profileSubtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    marginTop: 5,
    color: '#000',
  },
  curvedSegment: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: 1,
  },
  settingsToggle: {
    marginVertical: 12,
    marginHorizontal: 13,
    backgroundColor: '#ADD8E6',
    borderRadius: 50,
  },
  addIcon: {
    color: '#fff',
  },
  leaveIcon: {
    color: '#ADD8E6',
  },
  imageContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leaveIconContainer: {
    borderRadius: 50,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    padding: 5,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
  },
});

const alert = (msg, title) => {
  if (title === 'Exit?') {
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
    Alert.alert(title, msg, [{text: 'OK', onPress: () => true}]);
  }
};

export default ClassListPage;
