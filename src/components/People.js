import React, {useEffect, useRef, useState} from 'react';
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

const People = ({classroomId, courseCode}) => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [addType, setAddType] = useState('');
  const [idString, setIdString] = useState('');
  const refRBSheet = useRef();
  useEffect(() => {
    fetchPeople(classroomId, setStudents, setTeachers);
  }, []);
  return (
    <ScrollView>
      <ClassroomHeader
        classroomId={courseCode}
        backTo={'/Classroom'}
        isStudent={false}
      />
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Teachers</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setAddType('Teacher');
            refRBSheet.current.open();
          }}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {teachers &&
        teachers.map((item, index) => {
          return (
            <View style={styles.item} key={index}>
              <Text>{item}</Text>
            </View>
          );
        })}
      <View style={styles.itemSubtitleContainer}>
        <Text style={styles.header}>Students</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setAddType('Student');
            refRBSheet.current.open();
          }}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>
      {students &&
        students.map((item, index) => {
          return (
            <View style={styles.item} key={index}>
              <Text>{item}</Text>
            </View>
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
          addType={addType}
          idString={idString}
          setIdString={setIdString}
          classroomId={classroomId}
          setStudents={setStudents}
          setTeachers={setTeachers}
          refRBSheet={refRBSheet}
        />
      </RBSheet>
    </ScrollView>
  );
};

const AddPeople = ({
  addType,
  idString,
  setIdString,
  classroomId,
  setStudents,
  setTeachers,
  refRBSheet,
}) => {
  return (
    <View style={styles.addPeopleContainer}>
      <Text style={styles.header}>Add {addType}</Text>
      <TextInput
        placeholder="ID"
        keyboardType="numeric"
        value={idString}
        style={styles.addPeopleInput}
        onChangeText={text => setIdString(text)}
      />
      <TouchableOpacity
        style={styles.addPeopleButton}
        onPress={() => {
          addPersonToClass(
            addType,
            idString,
            classroomId,
            setStudents,
            setTeachers,
            setIdString,
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

const addPersonToClass = (
  accountType,
  accountId,
  classroomId,
  setStudents,
  setTeachers,
  setIdString,
  refRBSheet,
) => {
  let data = {};
  firestore()
    .collection(`classes`)
    .doc(classroomId)
    .get()
    .then(res => {
      if (accountType == 'Student') {
        data = {students: [...res.data().students, accountId]};
      } else {
        data = {teachers: [...res.data().teachers, accountId]};
      }
      firestore()
        .collection(`classes`)
        .doc(classroomId)
        .update(data)
        .then(() => {
          // Update person classes
          firestore()
            .collection(`users`)
            .doc(accountId)
            .get()
            .then(res => {
              let classes = res.data().classes;
              classes.push(classroomId);
              firestore()
                .collection(`users`)
                .doc(accountId)
                .update({classes: classes})
                .then(() => console.log('success updating users classes'))
                .catch(e => alert(e));
            })
            .catch(e => alert(e));

          fetchPeople(classroomId, setStudents, setTeachers);
          refRBSheet.current.close();
          setIdString('');
        })
        .catch(e => alert(e));
    })
    .catch(e => alert(e));
};

const fetchPeople = (classroomId, setStudents, setTeachers) => {
  // console.log(classroomId, '145');
  firestore()
    .collection(`classes`)
    .doc(classroomId)
    .get()
    .then(res => {
      console.log('People.js 150', res.data());
      setStudents(res.data().students);
      setTeachers(res.data().teachers);
    })
    .catch(e => alert(e));
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
    fontSize: 18,
    marginVertical: 14,
    marginHorizontal: 5,
  },
  itemSubtitle: {
    fontFamily: 'monospace',
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
    backgroundColor: '#ccc',
    alignContent: 'center',
    justifyContent: 'center',
    margin: 5,
    height: 40,
    width: 40,
    borderRadius: 50,
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
export default People;
