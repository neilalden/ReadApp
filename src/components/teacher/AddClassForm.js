import React from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  View,
  Text,
  Alert,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';

const AddClassForm = ({
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
    const classHeader = randomNumberGenerator();
    let classes = userInfo.classes;
    const data = {
      id: userInfo.id,
      name: userInfo.name,
      phoneNumber: userInfo.phoneNumber,
      photoUrl: user.photoURL,
    };

    classes.push(id);
    firestore()
      .collection('classes')
      .doc(id)
      .set({
        classId: id,
        subject: subject,
        section: section,
        classHeader: classHeader,
        teachers: [data],
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
          classHeader: classHeader,
          teachers: [data],
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
      <TextInput
        placeholder="Subject"
        value={subject}
        style={styles.addPeopleInput}
        onChangeText={text => setSubject(text)}
      />
      <TextInput
        placeholder="Grade - Section"
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
        <Text>Create class</Text>
      </TouchableOpacity>
    </View>
  );
};
const randomNumberGenerator = () => {
  return Math.floor(Math.random() * 16) + 1;
};
const styles = StyleSheet.create({
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    textAlign: 'left',
  },
  addPeopleContainer: {
    alignItems: 'center',
    marginVertical: 10,
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
});
export default AddClassForm;
