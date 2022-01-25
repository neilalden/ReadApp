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
import {
  ClassContext,
  fetchSubmissionList,
  addPersonToQueue,
} from '../../context/ClassContext';
import IconAddClass from '../../../assets/addClass.svg';
import IconRemove from '../../../assets/x-circle.svg';
import IconLeave from '../../../assets/leave.svg';
import IconGoBack from '../../../assets/goback.svg';
import {useHistory} from 'react-router';
import ClassroomNav from './ClassroomNav';

const PeoplePage = ({userInfo}) => {
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const [showWorks, setShowWorks] = useState(false);
  const [workBy, setWorkBy] = useState({});
  const [isStudent, setIsStudent] = useState(true);
  const [accountId, setAccountId] = useState('');
  const refRBSheet = useRef();
  const history = useHistory();
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (showWorks) {
        setShowWorks(false);
      } else {
        history.push('/ClassList');
      }
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [showWorks]);
  const showStudentWorks = student => {
    if (userInfo.isStudent) {
      alert('Stop!', 'Teachers are only allowed to add people to classes');
      return;
    }
    setShowWorks(true);
    setWorkBy(student);
    for (let i in classList[classNumber].classworkList) {
      fetchSubmissionList(classNumber, i, classList, setClassList);
    }
  };
  if (showWorks && !userInfo.isStudent) {
    return (
      <>
        <ScrollView>
          <View style={styles.headerContainer}>
            <TouchableOpacity
              onPress={() =>
                deletePersonFromClass(
                  true,
                  workBy,
                  classNumber,
                  classList,
                  setClassList,
                  userInfo,
                  setShowWorks,
                )
              }
              style={styles.iconContainer}>
              <IconLeave height={25} width={25} style={styles.leaveIcon} />
            </TouchableOpacity>
            <Text style={[styles.header, {color: 'white'}]}>{workBy.name}</Text>
            <TouchableOpacity
              onPress={() => setShowWorks(false)}
              style={styles.iconContainer}>
              <IconGoBack height={25} width={25} style={styles.backIcon} />
            </TouchableOpacity>
          </View>
          {classList[classNumber].classworkList &&
            classList[classNumber].classworkList.map((item, index) => {
              let submitted = false;
              let score = 0;
              const slist = item.submissionList;
              for (let i in slist) {
                if (
                  (slist[i].submittedBy.id == workBy.id &&
                    slist[i].work &&
                    slist[i].work !== '') ||
                  (slist[i].files && slist[i].files.length !== 0)
                ) {
                  submitted = true;
                  score = slist[i].score;
                }
              }
              return (
                <View key={index} style={[styles.item, {flexDirection: 'row'}]}>
                  <View>
                    <Text>{item.title}</Text>
                    <Text>{submitted ? 'Submitted' : 'Missing'}</Text>
                  </View>
                  <Text>{score}</Text>
                </View>
              );
            })}
        </ScrollView>
        <ClassroomNav isStudent={userInfo.isStudent} />
      </>
    );
  }
  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <ClassroomHeader
          subject={classList[classNumber].subject}
          section={classList[classNumber].section}
        />
        <View style={styles.itemSubtitleContainer}>
          <Text style={[styles.header, {padding: 13}]}>Teachers</Text>
          {!userInfo.isStudent && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsStudent(false);
                refRBSheet.current.open();
              }}>
              <IconAddClass height={30} width={30} style={styles.addIcon} />
            </TouchableOpacity>
          )}
        </View>
        {classList[classNumber].teachers &&
          classList[classNumber].teachers.map((item, index) => {
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
          })}
        <View style={styles.itemSubtitleContainer}>
          <Text style={[styles.header, {paddingVertical: 13}]}>Students</Text>
          {!userInfo.isStudent && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setIsStudent(true);
                refRBSheet.current.open();
              }}>
              <IconAddClass height={30} width={30} style={styles.addIcon} />
            </TouchableOpacity>
          )}
        </View>
        {/* STUDENTS MAP */}
        {classList[classNumber].students &&
          classList[classNumber].students.map((item, index) => {
            if (!userInfo.isStudent) {
              return (
                <TouchableOpacity
                  onPress={() => showStudentWorks(item)}
                  style={[styles.item, {flexDirection: 'row'}]}
                  key={index}>
                  <View style={styles.deleteButton}>
                    <View>
                      <Image
                        style={styles.itemPic}
                        source={{
                          uri: item.photoUrl,
                        }}
                      />
                    </View>
                    <View>
                      <Text>{item.name}</Text>
                      <Text style={styles.subtitle}>{item.id}</Text>
                    </View>
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
        {!userInfo.isStudent &&
        classList[classNumber].queues &&
        classList[classNumber].queues.length !== 0 ? (
          <ScrollView>
            <Text
              style={[
                styles.subtitle,
                {margin: 10, marginTop: 30, textAlign: 'center'},
              ]}>
              People to be added autmomatically after they create an account
            </Text>
            <ScrollView>
              {classList[classNumber].queues.map((item, index) => {
                return (
                  <View
                    key={index}
                    style={[styles.item, {flexDirection: 'row'}]}>
                    <View>
                      <Text>{item.id}</Text>
                      <Text style={styles.subtitle}>
                        {item.isStudent ? 'Student' : 'Teacher'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        deletePersonFromQueue(
                          item.id,
                          classList[classNumber].classId,
                          classList[classNumber].queues,
                          classNumber,
                          classList,
                          setClassList,
                          index,
                        );
                      }}>
                      <IconRemove height={30} width={30} color={'red'} />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </ScrollView>
        ) : (
          <></>
        )}

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
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
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
      <TextInput
        placeholder={`${isStudent ? 'Student' : 'Teacher'} ID`}
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
            setAccountId,
            classNumber,
            classList,
            setClassList,
            refRBSheet,
            userInfo,
          );
        }}>
        <Text>Add {isStudent ? 'student' : 'teacher'}</Text>
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

const deletePersonFromQueue = (
  id,
  classId,
  queues,
  classNumber,
  classList,
  setClassList,
  index,
) => {
  Alert.alert(`Alert`, `Are you sure you want to cancel queue for ${id}`, [
    {
      text: 'yes',
      onPress: () => {
        let copyQueues = [...queues];
        for (let i in copyQueues) {
          if (copyQueues[i].id == id) {
            copyQueues.splice(index, 1);
          }
        }
        firestore()
          .collection(`classes`)
          .doc(classId)
          .update({queues: copyQueues})
          .then(() => {
            let copyClassList = [...classList];
            copyClassList[classNumber].queues = copyQueues;
            setClassList(copyClassList);
            // update queued persons queue list
            firestore()
              .collection(`queues`)
              .doc(id)
              .get()
              .then(res => {
                let queuedClasses = res.data().classes;
                for (let i in queuedClasses) {
                  if (queuedClasses[i] == classId) {
                    queuedClasses.splice(i, 1);
                  }
                }

                firestore()
                  .collection(`queues`)
                  .doc(id)
                  .update({classes: queuedClasses})
                  .then()
                  .catch(e => alert(e));
              })
              .catch(e => alert(e));
          })
          .catch(e => alert(e));
      },
    },
    {text: 'no', onPress: () => true},
  ]);
};

const deletePersonFromClass = (
  toDeleteIsStudent,
  account,
  classNumber,
  classList,
  setClassList,
  userInfo,
  setShowWorks,
) => {
  if (userInfo.isStudent) {
    alert('Stop!', 'Teachers are only allowed to remove people from classes');
    return;
  }
  Alert.alert(
    'Are you sure?',
    `Remove ${account.name} from ${classList[classNumber].subject} class`,
    [
      {
        text: 'Yes',
        onPress: () => {
          const classId = classList[classNumber].classId;
          let students = [...classList[classNumber].students];
          let teachers = [...classList[classNumber].teachers];
          // UPDATE CLASS COLLECTION
          if (toDeleteIsStudent) {
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
          toDeleteIsStudent
            ? (data = {students: students})
            : (data = {teachers: teachers});
          // UPDATE THE CLASS COLLECTION WITH DELETE USER
          firestore()
            .collection(`classes`)
            .doc(classId)
            .update(data)
            .then(() => {
              let classListCopy = [...classList];
              if (toDeleteIsStudent) {
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
                    .then(() => {
                      setShowWorks(false);
                    })
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
  setAccountId,
  classNumber,
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
        // prompt the teacher to wheter to add them to queue
        Alert.alert(
          `${accountId} does not exist yet.`,
          `Do you want to add them to queue so that when they create an account they are autmomatically added in this class`,
          [
            {
              text: 'YES',
              onPress: () => {
                if (userInfo.isStudent) {
                  alert(
                    'Stop!',
                    'Teachers are only allowed to add people to queue',
                  );
                  return;
                }
                for (let i in classList[classNumber].queues) {
                  if (classList[classNumber].queues[i].id === accountId) {
                    // if user is already in queue
                    alert(
                      'Alert',
                      `${accountId} is already queued for this class`,
                    );
                    return;
                  }
                }
                const data = {
                  isStudent,
                  classes: [classId],
                  id: accountId,
                };
                let copyClassList = [...classList];
                copyClassList[classNumber].queues
                  ? copyClassList[classNumber].queues.push(data)
                  : (copyClassList[classNumber].queues = [data]);
                setClassList(copyClassList);
                const classQueues = copyClassList[classNumber].queues;
                addPersonToQueue(data, classQueues);
                refRBSheet.current.close();
              },
            },
            {text: 'NO', onPress: () => true},
          ],
        );
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
          } to ${classList[classNumber].subject} class`,
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
                            {
                              id: accountId,
                              name: res.data().name,
                              photoUrl: res.data().photoUrl,
                            },
                          ];
                        } else {
                          classListCopy[classNumber].teachers = [
                            ...teachers,
                            {
                              id: accountId,
                              name: res.data().name,
                              photoUrl: res.data().photoUrl,
                            },
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
    marginVertical: 5,
  },
  header: {
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
  },
  headerContainer: {
    backgroundColor: '#3d3d3d',
    justifyContent: 'space-between',
    width: 'auto',
    height: 60,
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: 'row',
  },
  subtitle: {
    fontFamily: 'Lato-Regular',
    color: '#000',
    fontSize: 12,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
  },
  itemSubtitleContainer: {
    marginHorizontal: 4,
    width: '99%',
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
  addPeopleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  addPeopleInput: {
    minWidth: 200,
    borderBottomColor: 'black',
    borderBottomWidth: 3,
    padding: 0,
    width: 200,
    marginVertical: 10,
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
  addIcon: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    borderRadius: 50,
  },
  backIcon: {
    color: '#ADD8E6',
  },
  leaveIcon: {
    color: 'red',
  },
  iconContainer: {
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 50,
    alignSelf: 'center',
    marginHorizontal: 5,
  },
});
export default PeoplePage;
