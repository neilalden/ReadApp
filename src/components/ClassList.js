import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Login from './Login';
import {AuthContext} from '../context/AuthContext';
import {ClassContext, fetchClassList} from '../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import {Link, useHistory} from 'react-router-native';
import Nav from './Nav';
import RBSheet from 'react-native-raw-bottom-sheet';

// STUDENT ACCOUNT TYPE SEES: TEACHER NAME IN THE SUBJECT
// TEACHER ACCOUNT TYPE SEES: SECTION NAME IN THE SUBJECT
//                          : BUTTON TO SHOW ADD CLASS COMPONENT
//                          : ADD CLASS COMPONENT (REACT BOTTOM SHEET)

export default function ClassList({userInfo, setUserInfo}) {
  const history = useHistory();
  const refRBSheet = useRef();
  const {user} = useContext(AuthContext);
  const {classList, setClassList, setClassNumber} = useContext(ClassContext);

  // FOR THE TEXT INPUT
  const [subject, setSubject] = useState('');
  const [section, setSection] = useState('');

  // TO REFETCH CLASSES AFTER ADDING A NEW ONE
  const [reload, setReload] = useState(false);

  useEffect(() => {
    if (!user) {
      setClassList([]);
      history.push('/Login');
    } else if (Object.keys(userInfo).length === 0 && user) {
      fetchUser(user.displayName, setUserInfo);
    } else {
      if (userInfo && classList.length === 0) {
        fetchClassList(userInfo, setClassList);
      }
    }
    // TO STOP THE BACK BUTTON FROM CLOSING APP
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [userInfo, user, reload]);

  return (
    <>
      <View style={styles.addButtonContainer}></View>
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
          />
        )}
      </ScrollView>
      {!userInfo.isStudent ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            refRBSheet.current.open();
          }}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      ) : (
        <></>
      )}
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
          userInfo={userInfo}
          refRBSheet={refRBSheet}
          subject={subject}
          setSubject={setSubject}
          section={section}
          setSection={setSection}
          reload={reload}
          setReload={setReload}
        />
      </RBSheet>
      <Nav />
    </>
  );
}

const StudentClasses = ({classList, setClassNumber}) => {
  return (
    <>
      {classList &&
        classList.map((item, index) => {
          console.log(item.teachers);
          return (
            <Link
              to="/Classroom"
              underlayColor="#f0f4f7"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <Text style={styles.header}>{item.classCode}</Text>
                {item.teachers.length > 1 ? (
                  <View style={styles.teachersNameContainer}>
                    {item.teachers.map((itm, idx) => {
                      if (idx == item.teachers.length - 1) {
                        return (
                          <Text style={styles.itemSubtitle} key={idx}>
                            {itm}
                          </Text>
                        );
                      } else {
                        return (
                          <Text style={styles.itemSubtitle} key={idx}>
                            {itm},
                          </Text>
                        );
                      }
                    })}
                  </View>
                ) : (
                  <Text style={styles.itemSubtitle}>{item.teachers[0]}</Text>
                )}
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
              underlayColor="#f0f4f7"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <Text style={styles.header}>{item.classCode}</Text>
                <Text style={styles.itemSubtitle}>{item.section}</Text>
              </>
            </Link>
          );
        })}
    </>
  );
};

const AddClass = ({
  userInfo,
  refRBSheet,
  subject,
  setSubject,
  section,
  setSection,
  reload,
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
        setReload(!reload);
        setSubject('');
        setSection('');
        refRBSheet.current.close();
      })
      .catch(e => {
        refRBSheet.current.close();
        setReload(!reload);
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
    backgroundColor: '#E8EAED',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 3,
  },
  header: {
    fontFamily: 'monospace',
    fontWeight: 'bold',
    fontSize: 20,
  },
  itemSubtitle: {
    fontFamily: 'monospace',
    marginRight: 5,
    color: '#666',
  },
  teachersNameContainer: {
    flexDirection: 'row',
  },
  addButtonContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#ccc',
    alignContent: 'center',
    justifyContent: 'center',
    margin: 5,
    height: 40,
    width: 40,
    borderRadius: 50,
    position: 'absolute',
    bottom: 70,
    right: 10,
  },
  addIcon: {
    marginLeft: 14.5,
    marginBottom: 1,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#fff',
  },
  addPeopleContainer: {
    alignItems: 'center',
  },
  addPeopleInput: {
    minWidth: 200,
    borderBottomColor: 'teal',
    borderBottomWidth: 3,
    padding: 0,
  },
  addPeopleButton: {
    backgroundColor: 'teal',
    marginTop: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
});
