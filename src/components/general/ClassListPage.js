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
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {AuthContext} from '../../context/AuthContext';
import {ClassContext, fetchClassList} from '../../context/ClassContext';
import {signOut} from '../../context/AuthContext';
import IconAddClass from '../../../assets/addClass.svg';
import Nav from './Nav';

import StudentClassList from '../student/StudentClassList';
import TeacherClassList from '../teacher/TeacherClassList';
import AddClassForm from '../teacher/AddClassForm';

const ClassListPage = ({userInfo, setUserInfo}) => {
  /***STATES***/
  const history = useHistory();
  const refRBSheet = useRef();
  const {classList, setClassList, setClassNumber} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  // FOR THE TEXT INPUT OF CREATING A NEW CLASS
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');

  /***HOOKS***/
  useEffect(() => {
    if (!user) {
      // no user;
      setUserInfo({});
      setClassList([]);
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      // user logged in but no information on them

      fetchUser(user.displayName);
    } else if (userInfo && user && classList.length === 0) {
      // user logged in and has the information on them but classes is not loaded yet
      fetchClassList(userInfo, setClassList);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  /***FUNCTIONS***/
  const fetchUser = id => {
    firestore()
      .collection('users')
      .doc(id)
      .get()
      .then(res => {
        if (!res.data()) {
          // USER DOES NOT EXIST
          history.push('/Register');
        } else {
          setUserInfo({
            classes: res.data().classes,
            id: res.data().id,
            isStudent: res.data().isStudent,
            phoneNumber: res.data().phoneNumber,
            name: res.data().name,
          });
        }
      })
      .catch(e => alert(e.message, e.code));
  };

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <ClassListPageHeader user={user} userInfo={userInfo} />
        <Segment userInfo={userInfo} refRBSheet={refRBSheet} />
        {userInfo.isStudent ? <StudentClassList /> : <TeacherClassList />}
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

const ClassListPageHeader = ({user, userInfo}) => {
  return (
    <View style={styles.classListPageHeader}>
      <View style={styles.profileDetailsContainer}>
        <TouchableOpacity
          onPress={() => {
            alert(`Are you sure you want to logout your account?`, 'Logout?');
          }}>
          <Image
            style={styles.profileImage}
            source={{
              uri: user.photoURL,
            }}
          />
        </TouchableOpacity>
        <View style={{alignItems: 'center'}}>
          <View style={styles.profileNameContainer}>
            <Text style={styles.profileName}>{userInfo.name}</Text>
          </View>
          <Text style={[styles.itemSubtitle, {fontSize: 16}]}>
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
        <Text style={[styles.header]}>
          {!userInfo.isStudent ? (
            <TouchableOpacity
              style={styles.settingsToggle}
              onPress={() => {
                refRBSheet.current.open();
              }}>
              <IconAddClass height={30} width={30} style={styles.addIcon} />
            </TouchableOpacity>
          ) : (
            <></>
          )}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  classListPageHeader: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    padding: 15,
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
    alignSelf: 'center',
  },
  profileNameContainer: {
    backgroundColor: '#333333',
    width: 'auto',
    marginHorizontal: 20,
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
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 10,
    textAlign: 'left',
  },
  curvedSegment: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    justifyContent: 'flex-end',
  },
  settingsToggle: {
    margin: 5,
    padding: 10,
  },
  addIcon: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    borderRadius: 50,
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
  } else if (title === 'Logout?') {
    Alert.alert(title, msg, [
      {text: 'Yes', onPress: () => signOut()},
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
