import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, BackHandler} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import {Link, useHistory} from 'react-router-native';
import {ClassContext, fetchClassworkList} from '../context/ClassContext';

// CLASSROOM IS THE SAME FOR BOTH STUDENT AND TEACHER ACCOUNT TYPE

const Classroom = ({userInfo}) => {
  // CLASSNUMBER IS THE POSITION OF THE OPENNED CLASS IN THE CLASSLIST ARRAY
  const {classNumber, classList, setClassList, setClassworkNumber} =
    useContext(ClassContext);
  const history = useHistory();
  useEffect(() => {
    // FETCH CLASSWORKLIST OF THE OPENNED CLASS IF IT DOES NOT EXIST YET
    !classList[classNumber].classworkList &&
      fetchClassworkList(
        classNumber,
        classList,
        setClassList,
        setClassworkNumber,
      );

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () =>
      history.push('/ClassList'),
    );
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ClassroomHeader
        classCode={classList[classNumber].classCode}
        backTo={'/ClassList'}
        isStudent={userInfo.isStudent}
      />
      <ScrollView>
        {classList[classNumber].classworkList &&
          classList[classNumber].classworkList.map((item, index) => {
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
                  setClassworkNumber(index);
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
