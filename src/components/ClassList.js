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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {AuthContext} from '../context/AuthContext';
import {ClassContext, fetchClassList} from '../context/ClassContext';
import {signOut} from '../context/AuthContext';
import firestore from '@react-native-firebase/firestore';
import {Link, useHistory} from 'react-router-native';
import Nav from './Nav';
import RBSheet from 'react-native-raw-bottom-sheet';
import IconAddClass from '../../assets/addClass.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
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
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setClassList([]);
    fetchClassList(userInfo, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };

  useEffect(() => {
    if (!user) {
      // no user;
      setUserInfo({});
      setClassList([]);
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      // user logged in but no information on them

      fetchUser(user.displayName, setUserInfo, history);
    } else if (userInfo && user && classList.length === 0) {
      // user logged in and has the information on them but classes is not loaded yet
      fetchClassList(userInfo, setClassList);
    }
    // TO STOP THE BACK BUTTON FROM CLOSING APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Exit', 'Do you want to leave?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  if (Object.keys(userInfo).length === 0 && classList.length === 0) {
    return (
      <View style={styles.textCenterContainer}>
        <Text>Loading...</Text>
      </View>
    );
  } else {
    return (
      <>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.classHeader}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Logout?',
                    `Are you sure you want to logout your account? `,
                    [
                      {text: 'Yes', onPress: () => signOut()},
                      {
                        text: 'No',
                        onPress: () => {
                          true;
                        },
                      },
                    ],
                  );
                }}>
                <Image
                  style={styles.profileImage}
                  source={
                    user
                      ? {
                          uri: user.photoURL,
                        }
                      : ''
                  }
                />
              </TouchableOpacity>
              <View style={{alignItems: 'center'}}>
                <View style={styles.accountContainer}>
                  <Text style={styles.accountType}>{userInfo.name}</Text>
                </View>
                <Text style={[styles.itemSubtitle, {fontSize: 16}]}>
                  {userInfo.id}
                </Text>
              </View>
            </View>
          </View>
          <View style={{backgroundColor: '#ADD8E6'}}>
            <View style={styles.backgroundView}>
              <Text
                style={[styles.header, {marginVertical: 15, marginLeft: 20}]}>
                Classes
              </Text>
              <Text
                style={[styles.header, {marginVertical: 15, marginRight: 20}]}>
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
              </Text>
            </View>
          </View>
          {userInfo.classes && userInfo.classes.length !== 0 ? (
            <ScrollView>
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
          ) : (
            <Text style={[styles.itemSubtitle, {textAlign: 'center'}]}>
              You are not in any classes
            </Text>
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
            <AddClass
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
  }
}
const StudentClasses = ({classList, setClassNumber}) => {
  return (
    <>
      {classList &&
        classList.map((item, index) => {
          const teachers = [];
          for (const i in item.teachers) {
            teachers.push(item.teachers[i].name);
          }
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
                  <Text style={styles.header}>{item.subject}</Text>
                  <View style={styles.teachersNameContainer}>
                    <Text style={styles.itemSubtitle}>
                      {teachers ? teachers.toString().replace(',', ', ') : ''}
                    </Text>
                  </View>
                </View>

                <Image
                  style={styles.itemPic}
                  source={{
                    uri: item.teachers[0].photoUrl,
                  }}
                />
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
                  <Text style={styles.header}>{item.subject}</Text>
                  <Text style={styles.itemSubtitle}>{item.section}</Text>
                </View>
                <Image
                  style={styles.itemPic}
                  source={{
                    uri: item.teachers[0].photoUrl,
                  }}
                />
              </>
            </Link>
          );
        })}
    </>
  );
};

const AddClass = ({
  user,
  userInfo,
  subject,
  section,
  classList,
  setClassList,
  setSubject,
  setSection,
  refRBSheet,
}) => {
  // CREATE CLASS COMPONENT (IT'S BETTER TO LEAVE THIS MF BE FOR NOW)
  const createClass = () => {
    if (userInfo.isStudent) {
      alert('Stop!', 'Teachers are only allowed to create classes');
      return;
    }
    const id = firestore().collection('classes').doc().id;
    let classes = userInfo.classes;

    classes.push(id);
    firestore()
      .collection('classes')
      .doc(id)
      .set({
        classId: id,
        subject: subject,
        section: section,
        teachers: [
          {id: userInfo.id, name: userInfo.name, photoUrl: user.photoURL},
        ],
        students: [],
        queues: [],
      })
      .then(() => {
        firestore()
          .collection(`users`)
          .doc(userInfo.id)
          .update({classes: classes})
          .then(() => {
            refRBSheet.current.close();
          })
          .catch(e => {
            alert('Error', e);
            refRBSheet.current.close();
          });
        let classListCopy = [...classList];
        classListCopy.push({
          classId: id,
          subject: subject,
          section: section,
          teachers: [
            {id: userInfo.id, name: userInfo.name, photoUrl: user.photoURL},
          ],
          students: [],
          queues: [],
        });
        setClassList(classListCopy);
      })
      .catch(e => {
        alert('Error', e);
      });
  };
  return (
    <View style={styles.addPeopleContainer}>
      <Text style={styles.header}>Create class</Text>
      <TextInput
        placeholder="Subject"
        value={subject}
        style={styles.addPeopleInput}
        onChangeText={text => setSubject(text)}
      />
      <TextInput
        placeholder="Grade and Section"
        value={section}
        style={styles.addPeopleInput}
        onChangeText={text => setSection(text)}
      />
      <TouchableOpacity
        style={styles.addPeopleButton}
        onPress={() => {
          if (subject === '' || section === '') {
            alert('Error', 'Subject and section of the class is required');
            return;
          }
          Alert.alert('Are you sure?', `Create ${subject} for ${section}?`, [
            {text: 'Yes', onPress: () => createClass()},
            {
              text: 'No',
              onPress: () => {
                return;
              },
            },
          ]);
        }}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const alert = (title = 'Error', msg) => {
  if (title == 'Exit') {
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
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'OK', onPress: () => true},
    ]);
  }
};

// USEFUL FUNCTIONS

const fetchUser = (id, setUserInfo, history) => {
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
    .catch(e => alert('Error', e));
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
    minWidth: 200,
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    padding: 0,
    width: 200,
    marginTop: 5,
  },
  addPeopleButton: {
    backgroundColor: '#ADD8E6',
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
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
  profileImage: {
    borderRadius: 50,
    height: 100,
    width: 100,
    margin: 10,
    alignSelf: 'center',
  },
  accountContainer: {
    backgroundColor: '#333333',
    width: 'auto',
    marginHorizontal: 20,
    justifyContent: 'center',
  },
  accountType: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    padding: 10,
    textAlign: 'center',
    color: 'white',
    minWidth: '75%',
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
    borderRadius: 50,
    height: 50,
    width: 50,
    alignSelf: 'center',
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
