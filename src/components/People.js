import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  BackHandler,
  Image,
} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import firestore from '@react-native-firebase/firestore';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ClassContext} from '../context/ClassContext';
import IconAddClass from '../../assets/addClass.svg';
import IconRemove from '../../assets/x-circle.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useHistory} from 'react-router';

const People = ({userInfo}) => {
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const [isStudent, setIsStudent] = useState(true);
  const [accountId, setAccountId] = useState('');
  const refRBSheet = useRef();
  const history = useHistory();
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <ScrollView>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        isStudent={userInfo.isStudent}
      />
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Teachers</Text>
        {!userInfo.isStudent ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setIsStudent(false);
              refRBSheet.current.open();
            }}>
            <IconAddClass height={30} width={30} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
      {classList[classNumber].teachers &&
        classList[classNumber].teachers.map((item, index) => {
          if (item.id === userInfo.id || userInfo.isStudent) {
            return (
              <View
                style={[
                  styles.item,
                  {flexDirection: 'row', justifyContent: 'flex-start'},
                ]}
                key={index}>
                <Image
                  style={styles.itemPic}
                  source={{
                    uri: item.photoUrl,
                  }}
                />
                <View style={styles.deleteButton}>
                  <View>
                    <Text>{item.name}</Text>
                    <Text style={styles.subtitle}>{item.id}</Text>
                  </View>
                </View>
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                style={styles.item}
                key={index}
                onPress={() =>
                  deletePersonFromClass(
                    false,
                    item,
                    classNumber,
                    classList,
                    setClassList,
                    userInfo,
                  )
                }>
                <View style={styles.deleteButton}>
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      style={styles.itemPic}
                      source={{
                        uri: item.photoUrl,
                      }}
                    />
                    <View>
                      <Text>{item.name}</Text>
                      <Text style={styles.subtitle}>{item.id}</Text>
                    </View>
                  </View>
                  <IconRemove height={30} width={30} color={'red'} />
                </View>
              </TouchableOpacity>
            );
          }
        })}
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Students</Text>
        {!userInfo.isStudent ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setIsStudent(true);
              refRBSheet.current.open();
            }}>
            <IconAddClass height={30} width={30} color={Colors.black} />
          </TouchableOpacity>
        ) : (
          <></>
        )}
      </View>
      {classList[classNumber].students &&
        classList[classNumber].students.map((item, index) => {
          if (!userInfo.isStudent) {
            return (
              <TouchableOpacity
                style={styles.item}
                key={index}
                onPress={() =>
                  deletePersonFromClass(
                    true,
                    item,
                    classNumber,
                    classList,
                    setClassList,
                    userInfo,
                  )
                }>
                <View style={styles.deleteButton}>
                  <View style={{flexDirection: 'row'}}>
                    <Image
                      style={styles.itemPic}
                      source={{
                        uri: item.photoUrl,
                      }}
                    />
                    <View>
                      <Text>{item.name}</Text>
                      <Text style={styles.subtitle}>{item.id}</Text>
                    </View>
                  </View>
                  <IconRemove height={30} width={30} color={'red'} />
                </View>
              </TouchableOpacity>
            );
          } else {
            return (
              <View
                style={[
                  styles.item,
                  {flexDirection: 'row', justifyContent: 'flex-start'},
                ]}
                key={index}>
                <Image
                  style={styles.itemPic}
                  source={{
                    uri: item.photoUrl,
                  }}
                />
                <View>
                  <Text>{item.name}</Text>
                  <Text style={styles.subtitle}>{item.id}</Text>
                </View>
              </View>
            );
          }
        })}

      <RBSheet
        ref={refRBSheet}
        closeOnDragDown={true}
        closeOnPressMask={true}
        closeOnPressBack={true}
        animationType="slide"
        onClose={() => {
          setAccountId('');
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
        <AddPeople
          isStudent={isStudent}
          accountId={accountId}
          setAccountId={setAccountId}
          classNumber={classNumber}
          classList={classList}
          setClassList={setClassList}
          refRBSheet={refRBSheet}
          userInfo={userInfo}
        />
      </RBSheet>
    </ScrollView>
  );
};

const AddPeople = ({
  isStudent,
  accountId,
  setAccountId,
  classNumber,
  classList,
  setClassList,
  refRBSheet,
  userInfo,
}) => {
  return (
    <View style={styles.addPeopleContainer}>
      <Text style={styles.header}>Add {isStudent ? 'student' : 'seacher'}</Text>
      <TextInput
        placeholder="ID"
        keyboardType="numeric"
        value={accountId}
        style={styles.addPeopleInput}
        onChangeText={text => setAccountId(text)}
      />
      <TouchableOpacity
        style={styles.addPeopleButton}
        onPress={() => {
          if (accountId === '') {
            alert(
              'Error',
              `Please write the ID of the ${
                isStudent ? 'student' : 'teacher'
              } you want to add`,
            );
            return;
          }

          addPersonToClass(
            isStudent,
            accountId,
            classNumber,
            setAccountId,
            classList,
            setClassList,
            refRBSheet,
            userInfo,
          );
        }}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const alert = (title = 'Error', msg) => {
  Alert.alert(
    `${title ? title : 'Errpr'}`,
    `${msg ? msg : 'Fill up the form properly'}`,
    [{text: 'OK', onPress: () => true}],
  );
};

const deletePersonFromClass = (
  isStudent,
  account,
  classNumber,
  classList,
  setClassList,
  userInfo,
) => {
  if (userInfo.isStudent) {
    alert('Stop!', 'Teachers are only allowed to remove people from classes');
    return;
  }
  Alert.alert(
    'Are you sure?',
    `Remove ${account.name} from ${classList[classNumber].subject}`,
    [
      {
        text: 'Yes',
        onPress: () => {
          const classId = classList[classNumber].classId;
          let students = [...classList[classNumber].students];
          let teachers = [...classList[classNumber].teachers];
          // UPDATE CLASS COLLECTION
          if (isStudent) {
            for (const i in students) {
              if (students[i].id === account.id) {
                students.splice(i, 1);
              }
            }
          } else {
            for (const i in teachers) {
              if (teachers[i].id === account.id) {
                teachers.splice(i, 1);
              }
            }
          }
          let data = {};
          isStudent
            ? (data = {students: students})
            : (data = {teachers: teachers});
          // UPDATE THE CLASS COLLECTION WITH DELETE USER
          firestore()
            .collection(`classes`)
            .doc(classId)
            .update(data)
            .then(() => {
              let classListCopy = [...classList];
              if (isStudent) {
                classListCopy[classNumber].students = students;
              } else {
                classListCopy[classNumber].teachers = teachers;
              }
              setClassList(classListCopy);
              // FETCH AND UPDATE THE REMOVED USER'S CLASS
              firestore()
                .collection(`users`)
                .doc(account.id)
                .get()
                .then(res => {
                  let userClasses = res.data().classes;
                  for (const i in userClasses) {
                    if (userClasses[i] === classId) {
                      userClasses.splice(i, 1);
                    }
                  }
                  firestore()
                    .collection(`users`)
                    .doc(account.id)
                    .update({classes: userClasses})
                    .then(() => {})
                    .catch(e => {
                      alert('error in updating user classes', e);
                    });
                })
                .catch(e => {
                  alert('error in fetching removed user details', e);
                });
            })
            .catch(e => {
              alert('error in updating class', e);
            });
        },
      },
      {text: 'No', onPress: () => true},
    ],
  );
};

const addPersonToClass = (
  isStudent,
  accountId,
  classNumber,
  setAccountId,
  classList,
  setClassList,
  refRBSheet,
  userInfo,
) => {
  if (userInfo.isStudent) {
    alert('Stop!', 'Teachers are only allowed to add people to classes');
    return;
  }
  const classId = classList[classNumber].classId;
  const students = [...classList[classNumber].students];
  const teachers = [...classList[classNumber].teachers];
  // FIRST CHECK IF THE USER TO BE ADDED EXIST AND THAT THEY FIT THE ACCOUNT TYPE
  firestore()
    .collection(`users`)
    .doc(accountId)
    .get()
    .then(res => {
      if (!res.data()) {
        // USER DOES NOT EXIST
        alert('Error', 'user does not exist');
      } else if (res.data().isStudent !== isStudent) {
        // USER ACCOUNT TYPE DOES NOT MATCH
        alert(
          'Error',
          `${res.data().name} is not a ${isStudent ? 'student' : 'teacher'}`,
        );
      } else {
        // USER ALREADY IN CLASS
        if (res.data().isStudent) {
          for (const i in students) {
            if (students[i].id === accountId) {
              alert('Error', `${students[i].name} is already in class`);
              return;
            }
          }
        } else if (!res.data().isStudent) {
          for (const i in teachers) {
            if (teachers[i].id === accountId) {
              alert('Error', `${teachers[i].name} is already in class`);
              return;
            }
          }
        }
        // USER DOES EXIST, THEY FIT THE ACCOUNT TYPE, AND IS NOT YET IN CLASS
        // UPDATE THE CLASS COLLECTION WITH ADD USER
        Alert.alert(
          'Are you sure?',
          `Add ${res.data().name} as a ${
            isStudent ? 'student' : 'teacher'
          } to ${classList[classNumber].subject}`,
          [
            {
              text: 'Yes',
              onPress: () => {
                const photoUrl = res.data().photoUrl;
                const userClasses = res.data().classes
                  ? res.data().classes
                  : [];
                const userData = photoUrl
                  ? {id: accountId, name: res.data().name, photoUrl: photoUrl}
                  : {id: accountId, name: res.data().name};
                const data = isStudent
                  ? {
                      students: [...students, userData],
                    }
                  : {
                      teachers: [...teachers, userData],
                    };
                firestore()
                  .collection(`classes`)
                  .doc(classId)
                  .update(data)
                  .then(() => {
                    // NOW UPDATE THE PERSON'S CLASSES
                    firestore()
                      .collection(`users`)
                      .doc(accountId)
                      .update({classes: [...userClasses, classId]})
                      .then(() => {
                        // EVERYTHING WENT WELL
                        refRBSheet.current.close();
                        setAccountId('');

                        let classListCopy = [...classList];

                        if (isStudent) {
                          classListCopy[classNumber].students = [
                            ...students,
                            {id: accountId, name: res.data().name},
                          ];
                        } else {
                          classListCopy[classNumber].teachers = [
                            ...teachers,
                            {id: accountId, name: res.data().name},
                          ];
                        }
                        setClassList(classListCopy);
                      })
                      .catch(e => {
                        alert('error in updating user classes', e);
                        refRBSheet.current.close();
                        setAccountId('');
                      });
                  })
                  .catch(e => {
                    alert('error in updating class', e);
                    refRBSheet.current.close();
                    setAccountId('');
                  });
              },
            },
            {
              text: 'No',
              onPress: () => {
                true;
              },
            },
          ],
        );
      }
    })
    .catch(e => {
      alert('error in verifying the existance of the user', e);
      refRBSheet.current.close();
      setAccountId('');
    });
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginVertical: 3,
  },
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    margin: 15,
  },
  subtitle: {
    fontSize: 10,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginVertical: 15,
    marginHorizontal: 5,
  },
  itemSubtitleContainer: {
    marginHorizontal: 4,
    width: '98%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemPic: {
    marginRight: 10,
    borderRadius: 50,
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
  addButton: {
    alignContent: 'center',
    justifyContent: 'center',
    margin: 10,
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
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
export default People;
