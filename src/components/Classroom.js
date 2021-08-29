import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  RefreshControl,
} from 'react-native';
import ClassroomHeader from './ClassroomHeader';
import {Link, useHistory} from 'react-router-native';
import {
  ClassContext,
  fetchClassworkList,
  fetchSubmissionList,
} from '../context/ClassContext';

// CLASSROOM IS THE SAME FOR BOTH STUDENT AND TEACHER ACCOUNT TYPE

const Classroom = ({userInfo}) => {
  // CLASSNUMBER IS THE POSITION OF THE OPENNED CLASS IN THE CLASSLIST ARRAY
  const {classNumber, classList, setClassList, setClassworkNumber} =
    useContext(ClassContext);
  const history = useHistory();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClassworkList(
      classNumber,
      classList,
      setClassList,
      setClassworkNumber,
    );
    wait(1000).then(() => setRefreshing(false));
  }, []);
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
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');

      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        isStudent={userInfo.isStudent}
      />
      {classList[classNumber].classworkList &&
      classList[classNumber].classworkList.length !== 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          {classList[classNumber].classworkList.map((item, index) => {
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
                underlayColor="#C1E1EC"
                key={index}
                style={styles.item}
                onPress={() => {
                  setClassworkNumber(index);
                }}>
                <View>
                  <Text style={styles.itemText}>{item.title}</Text>
                  <Text style={styles.itemTextSubs}>
                    Deadline: {MONTHS[month]}/{day}/{year}{' '}
                    {hour >= 12 ? hour - 12 : hour}:{minute} {ampm}
                  </Text>
                </View>
              </Link>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.subtitle}>No classworks yet</Text>
      )}
    </>
  );
};

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
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
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    paddingBottom: 3,
  },
  itemTextSubs: {
    fontFamily: 'Lato-Regular',
    paddingTop: 3,
    paddingBottom: 3,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#ccc',
  },
});
export default Classroom;
