import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import firestore from '@react-native-firebase/firestore';
import RBSheet from 'react-native-raw-bottom-sheet';
import {ClassContext} from '../context/ClassContext';
import IconAddClass from '../../assets/addClass.svg';
import IconRemove from '../../assets/x-circle.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {red} from 'chalk';

const People = () => {
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const [isStudent, setIsStudent] = useState(true);
  const [accountId, setAccountId] = useState('');
  const refRBSheet = useRef();
  return (
    <ScrollView>
      <ClassroomHeader
        classCode={classList[classNumber].classCode}
        backTo={'/Classroom'}
        isStudent={false}
      />
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Teachers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setIsStudent(false);
            refRBSheet.current.open();
          }}>
          <IconAddClass height={30} width={30} color={Colors.black} />
        </TouchableOpacity>
      </View>
      {classList[classNumber].teachers &&
        classList[classNumber].teachers.map((item, index) => {
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
                )
              }>
              <View style={styles.deleteButton}>
                <Text>{item}</Text>
                <IconRemove height={30} width={30} color={'red'} />
              </View>
            </TouchableOpacity>
          );
        })}
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Students</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setIsStudent(true);
            refRBSheet.current.open();
          }}>
          <IconAddClass height={30} width={30} color={Colors.black} />
        </TouchableOpacity>
      </View>
      {classList[classNumber].students &&
        classList[classNumber].students.map((item, index) => {
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
                )
              }>
              <View style={styles.deleteButton}>
                <Text>{item}</Text>
                <IconRemove height={30} width={30} color={'red'} />
              </View>
            </TouchableOpacity>
          );
        })}

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
        <AddPeople
          isStudent={isStudent}
          accountId={accountId}
          setAccountId={setAccountId}
          classNumber={classNumber}
          classList={classList}
          setClassList={setClassList}
          refRBSheet={refRBSheet}
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
}) => {
  return (
    <View style={styles.addPeopleContainer}>
      <Text style={styles.header}>Add {isStudent ? 'Student' : 'Teacher'}</Text>
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
          addPersonToClass(
            isStudent,
            accountId,
            classNumber,
            setAccountId,
            classList,
            setClassList,
            refRBSheet,
          );
        }}>
        <Text>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const deletePersonFromClass = (
  isStudent,
  accountId,
  classNumber,
  classList,
  setClassList,
) => {
  const classId = classList[classNumber].classId;
  let students = [...classList[classNumber].students];
  let teachers = [...classList[classNumber].teachers];
  // UPDATE CLASS COLLECTION
  if (isStudent) {
    for (const i in students) {
      if (students[i] === accountId) {
        students.splice(i, 1);
      }
    }
  } else {
    for (const i in teachers) {
      if (teachers[i] === accountId) {
        teachers.splice(i, 1);
      }
    }
  }
  let data = {};
  isStudent ? (data = {students: students}) : (data = {teachers: teachers});
  // UPDATE THE CLASS COLLECTION WITH DELETE USER
  firestore()
    .collection(`classes`)
    .doc(classId)
    .update(data)
    .then(() => {
      console.log('CLASS UPDATED');
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
        .doc(accountId)
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
            .doc(accountId)
            .update({classes: userClasses})
            .then(() => {
              console.log('USER CLASSES UPDATED');
            })
            .catch(e => {
              console.error('error in updating user classes', e);
            });
        })
        .catch(e => {
          console.log('error in fetching removed user details', e);
        });
    })
    .catch(e => {
      console.error('error in updating class', e);
    });
};

const addPersonToClass = (
  isStudent,
  accountId,
  classNumber,
  setAccountId,
  classList,
  setClassList,
  refRBSheet,
) => {
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
        alert('user does not exist');
      } else if (res.data().isStudent !== isStudent) {
        alert(
          `${res.data().name} is not a ${isStudent ? 'Student' : 'Teacher'}`,
        );
      } else {
        // USER DOES EXIST AND THEY FIT THE ACCOUNT TYPE
        // UPDATE THE CLASS COLLECTION WITH ADD USER
        const userClasses = res.data().classes ? res.data().classes : [];
        const data = isStudent
          ? {students: [...students, accountId]}
          : {teachers: [...teachers, accountId]};
        firestore()
          .collection(`classes`)
          .doc(classId)
          .update(data)
          .then(() => {
            console.log('CLASS UPDATED!');
            // NOW UPDATE THE PERSON'S CLASSES
            firestore()
              .collection(`users`)
              .doc(accountId)
              .update({classes: [...userClasses, classId]})
              .then(() => {
                // EVERYTHING WENT WELL
                console.log('USER CLASSES UPDATE');
                refRBSheet.current.close();
                setAccountId('');

                let classListCopy = [...classList];

                if (isStudent) {
                  classListCopy[classNumber].students = [
                    ...students,
                    accountId,
                  ];
                } else {
                  classListCopy[classNumber].teachers = [
                    ...teachers,
                    accountId,
                  ];
                }
                setClassList(classListCopy);
              })
              .catch(e => {
                console.error('error in updating user classes', e);
                refRBSheet.current.close();
                setAccountId('');
              });
          })
          .catch(e => {
            console.log('error in updating class', e);
            refRBSheet.current.close();
            setAccountId('');
          });
      }
    })
    .catch(e => {
      console.error('error in verifying the existance of the user', e);
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
  deleteButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
export default People;
