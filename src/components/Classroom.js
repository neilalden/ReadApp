import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  BackHandler,
} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import firestore from '@react-native-firebase/firestore';
import {Link} from 'react-router-native';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];
const Classroom = ({classroomId, userInfo, setClassworkInfo, courseCode}) => {
  const [classworkList, setClassworkList] = useState([]);

  useEffect(() => {
    setClassworkList([]);
    fetchClassworkList(classroomId, setClassworkList);
    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ClassroomHeader
        classroomId={courseCode}
        backTo={'/ClassList'}
        isStudent={userInfo.isStudent}
      />
      <View></View>
      <ScrollView>
        {classworkList &&
          classworkList.map((item, index) => {
            const dt = new Date(item.deadline.toDate());
            const day = dt.getDate();
            const month = dt.getMonth();
            const year = dt.getFullYear();
            const hour = dt.getHours();
            const minute = dt.getMinutes();
            const ampm = hour >= 12 ? 'pm' : 'am';
            return (
              <Link
                to="/Classwork"
                underlayColor="#f0f4f7"
                key={index}
                style={styles.item}
                onPress={() => {
                  setClassworkInfo({
                    id: item.id,
                    isActivity: item.isActivity,
                    instruction: item.instruction,
                    questions: item.questions,
                  });
                }}>
                <View>
                  <Text>{item.title}</Text>
                  <Text>
                    Deadline: {MONTHS[month]}/{day}/{year}{' '}
                    {hour >= 12 ? hour - 12 : hour}:{minute} {ampm}
                  </Text>
                </View>
              </Link>
            );
          })}
      </ScrollView>
    </>
  );
};

const fetchClassworkList = (classroomId, setClassworkList) => {
  firestore()
    .collection(`classes/${classroomId}/classworks`)
    .get()
    .then(documentSnapshot =>
      documentSnapshot.forEach(res => {
        console.log('classroom 93', res.data());
        setClassworkList(prev => [
          ...prev,
          {
            id: res.id,
            title: res.data().title,
            instruction: res.data().instruction,
            deadline: res.data().deadline,
            isActivity: res.data().isActivity,
            questions: res.data().questions,
          },
        ]);
      }),
    )
    .catch(e => alert(e));
};
const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
  ]);

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#E8EAED',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    fontFamily: 'monospace',
    marginHorizontal: 10,
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
export default Classroom;
