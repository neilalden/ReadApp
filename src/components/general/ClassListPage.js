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
import {AuthContext} from '../../context/AuthContext';
import {ClassContext, fetchClassList} from '../../context/ClassContext';
import {signOut} from '../../context/AuthContext';
import IconAddClass from '../../../assets/addClass.svg';
import IconLeave from '../../../assets/leave.svg';
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

  if (!user) {
    return <></>;
  }

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <ClassListPageHeader
          user={user}
          userInfo={userInfo}
          history={history}
        />
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

const ClassListPageHeader = ({user, userInfo, history}) => {
  const handleLogout = () => {
    Alert.alert('Logout?', `Are you sure you want to logout your account?`, [
      {
        text: 'Yes',
        onPress: () => {
          history.push('/Login');
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
          <Text style={styles.itemSubtitle}>{userInfo.id}</Text>
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
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    marginTop: 5,
    color: '#000',
    textAlign: 'left',
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
