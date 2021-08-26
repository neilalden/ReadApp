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
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import {ClassContext, fetchClassList} from '../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import {Link, useHistory} from 'react-router-native';
import Nav from './Nav';
import RBSheet from 'react-native-raw-bottom-sheet';
import IconAddClass from '../../assets/addClass.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconProfile from '../../assets/profile.svg';
import IconClassPic from '../../assets/classpic.svg';
// STUDENT ACCOUNT TYPE SEES: TEACHER NAME IN THE SUBJECT
// TEACHER ACCOUNT TYPE SEES: SECTION NAME IN THE SUBJECT
//                          : BUTTON TO SHOW ADD CLASS COMPONENT
//                          : CREATE CLASS COMPONENT (REACT BOTTOM SHEET)

export default function ClassList({userInfo, setUserInfo}) {
  const history = useHistory();
  const refRBSheet = useRef();
  const {user} = useContext(AuthContext);
  const {classList, setClassList, setClassNumber} = useContext(ClassContext);

  // FOR THE TEXT INPUT OF CREATING A NEW CLASS
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');

  // TO REFETCH CLASSES AFTER ADDING A NEW ONE
  const [reload, setReload] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setClassList([]);
    fetchClassList(userInfo, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  useEffect(() => {
    if (!user) {
      setClassList([]);
      setUserInfo({});
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      fetchUser(user.displayName, setUserInfo);
    } else {
      if ((userInfo && classList.length === 0) || reload) {
        fetchClassList(userInfo, setClassList);
        setReload(false);
      }
    }
    // TO STOP THE BACK BUTTON FROM CLOSING APP
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [userInfo, user, reload]);
  if (classList.length === 0) {
    return (
      <View style={styles.textCenterContainer}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <>
        <View style={styles.classHeader}>
          <View style={styles.profileContainer}>
            <Link to="/Account" underlayColor="#ADD8E6">
              <IconProfile height={50} width={60} />
            </Link>
          </View>

          <Text style={styles.classHeaderText}>Welcome,</Text>
          <Text style={styles.classHeaderText}>{userInfo.name}</Text>
          <View style={styles.userID}>
            <Text style={styles.userText}>{userInfo.id}</Text>
            <Text style={styles.userText}>
              {userInfo.isStudent ? 'Student' : 'Teacher'}
            </Text>
          </View>
        </View>

        <View style={{backgroundColor: '#ADD8E6'}}>
          <View style={styles.backgroundView}>
            <Text style={[styles.header, {marginVertical: 15, marginLeft: 20}]}>
              Classes
            </Text>
            {!userInfo.isStudent ? (
              <TouchableOpacity
                style={{marginVertical: 10, marginRight: 20}}
                onPress={() => {
                  refRBSheet.current.open();
                }}>
                <IconAddClass height={30} width={30} color={Colors.black} />
              </TouchableOpacity>
            ) : (
              <></>
            )}
          </View>
        </View>
        <ScrollView
          style={{backgroundColor: '#fff'}}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {userInfo && userInfo.isStudent ? (
            <StudentClasses
              classList={classList}
              setClassNumber={setClassNumber}
            />
          ) : (
            <TeacherClasses
              classList={classList}
              setClassNumber={setClassNumber}
              setClassNumber={setClassNumber}
            />
          )}
        </ScrollView>

        <RBSheet
          ref={refRBSheet}
          closeOnDragDown={true}
          closeOnPressMask={true}
          animationType="slide"
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
          <AddClass
            subject={subject}
            setSubject={setSubject}
            section={section}
            setSection={setSection}
            userInfo={userInfo}
            refRBSheet={refRBSheet}
            reload={reload}
            setReload={setReload}
          />
        </RBSheet>
        <Nav />
      </>
    );
  }
}
const StudentClasses = ({classList, setClassNumber}) => {
  return (
    <>
      {classList &&
        classList.map((item, index) => {
          return (
            <Link
              to="/Classroom"
              underlayColor="#C1E1EC"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <View>
                  <Text style={styles.header}>{item.classCode}</Text>
                  <View style={styles.teachersNameContainer}>
                    <Text style={styles.itemSubtitle}>
                      {item.teachers ? item.teachers.toString() : ''}
                    </Text>
                  </View>
                </View>
                <IconClassPic style={styles.itemPic} height={50} width={60} />
              </>
            </Link>
          );
        })}
    </>
  );
};
const TeacherClasses = ({classList, setClassNumber}) => {
  return (
    <>
      {classList &&
        classList.map((item, index) => {
          return (
            <Link
              to="/Classroom"
              underlayColor="#C1E1EC"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <View>
                  <Text style={styles.header}>{item.classCode}</Text>
                  <Text style={styles.itemSubtitle}>{item.section}</Text>
                </View>
                <IconClassPic style={styles.itemPic} height={50} width={60} />
              </>
            </Link>
          );
        })}
    </>
  );
};

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const AddClass = ({
  userInfo,
  refRBSheet,
  subject,
  setSubject,
  section,
  setSection,
  setReload,
}) => {
  // CREATE CLASS COMPONENT (IT'S BETTER TO LEAVE THIS MF BE FOR NOW)

  const createClass = () => {
    const id = firestore().collection('classes').doc().id;
    let classes = userInfo.classes;
    classes.push(id);
    firestore()
      .collection('classes')
      .doc(id)
      .set({
        teachers: [userInfo.id],
        students: [],
        classCode: subject,
        classId: id,
        section: section,
      })
      .then(() => {
        firestore()
          .collection(`users`)
          .doc(userInfo.id)
          .update({classes: classes})
          .then(() => {})
          .catch(e => {
            console.log(e);
          });
        setReload(true);
        setSubject('');
        setSection('');
        refRBSheet.current.close();
      })
      .catch(e => {
        refRBSheet.current.close();
        setReload(true);
        setSubject('');
        setSection('');
        console.log(e);
      });
  };
  return (
    <View style={styles.addPeopleContainer}>
      <Text style={styles.header}>Create class</Text>
      <TextInput
        placeholder="Subject / Class code"
        value={subject}
        style={styles.addPeopleInput}
        onChangeText={text => setSubject(text)}
      />
      <TextInput
        placeholder="Section"
        value={section}
        style={styles.addPeopleInput}
        onChangeText={text => setSection(text)}
      />
      <TouchableOpacity
        style={styles.addPeopleButton}
        onPress={() => createClass()}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const alert = (title = 'Error', msg) =>
  Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
    {
      text: 'OK',
      onPress: () => {},
    },
  ]);

// USEFUL FUNCTIONS

const fetchUser = (id, setUserInfo) => {
  firestore()
    .collection('users')
    .doc(id)
    .get()
    .then(res => {
      setUserInfo({
        classes: res.data().classes,
        id: res.data().id,
        isStudent: res.data().isStudent,
        phoneNumber: res.data().phoneNumber,
        name: res.data().name,
      });
    })
    .catch(e => alert(e));
};

//  MAY OR MAY NOT USE IN THE FUTURE
const fetchClassTeachersInfo = (data, teachersArray, setClassList) => {
  let teachers = [];

  for (let i in teachersArray) {
    firestore()
      .collection('users')
      .doc(teachersArray[i])
      .get()
      .then(res => {
        teachers.push(res.data().name);
        if (teachers.length == teachersArray.length) {
          setClassList(prev => [
            ...prev,
            {
              classId: data.data().classId,
              classCode: data.data().classCode,
              subject: data.data().subject,
              section: data.data().section,
              students: data.data().students,
              teachers: teachers,
            },
          ]);
        }
      })
      .catch(e => alert(e));
  }
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 3,
  },
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    textAlign: 'left',
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 10,
    textAlign: 'left',
  },
  teachersNameContainer: {
    flexDirection: 'row',
  },
  addPeopleContainer: {
    alignItems: 'center',
  },
  addPeopleInput: {
    minWidth: 150,
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    padding: 0,
    width: 200,
    marginTop: 5,
  },
  addPeopleButton: {
    backgroundColor: '#ADD8E6',
    marginTop: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 45,
  },
  addText: {
    textAlign: 'center',
  },
  addHeader: {
    fontSize: 25,
    fontFamily: 'Lato-Regular',
    padding: 15,
  },
  classHeader: {
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    padding: 15,
  },
  classHeaderText: {
    fontSize: 25,
    fontFamily: 'Lato-Regular',
  },
  userID: {
    marginTop: 50,
    fontSize: 12,
  },
  classText: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
  },
  backgroundView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  userText: {
    fontSize: 12,
  },
  itemPic: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  textCenterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
