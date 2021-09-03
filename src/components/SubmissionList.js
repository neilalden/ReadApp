import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  BackHandler,
  TouchableOpacity,
} from 'react-native';
import {useHistory} from 'react-router';
import {ClassContext, fetchSubmissionList} from '../context/ClassContext';
import ActivitySubmission from './ActivitySubmission';
import QuizSubmission from './QuizSubmission';

const SubmissionList = ({userInfo}) => {
  const {
    classNumber,
    classworkNumber,
    classList,
    setClassList,
    setSubmissionListNumber,
  } = useContext(ClassContext);
  const history = useHistory();
  const [student, setStudent] = useState({});
  const [refresh, setRefresh] = useState(false);
  const classwork = classList[classNumber].classworkList[classworkNumber];
  useEffect(() => {
    if (
      !classList[classNumber].classworkList[classworkNumber].submissionList ||
      refresh
    ) {
      fetchSubmissionList(
        classNumber,
        classworkNumber,
        classList,
        setClassList,
      );
      if (refresh) setRefresh(false);
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Classroom');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [refresh]);
  return (
    <>
      {Object.keys(student).length !== 0 ? (
        classwork.isActivity ? (
          <ActivitySubmission
            userInfo={userInfo}
            student={student}
            setStudent={setStudent}
            setRefresh={setRefresh}
          />
        ) : (
          <QuizSubmission
            userInfo={userInfo}
            student={student}
            setStudent={setStudent}
          />
        )
      ) : (
        <ScrollView>
          <View style={styles.headerContainer}>
            <Text style={styles.header}>{classwork.title}</Text>
          </View>
          {classwork.submissionList &&
            classwork.submissionList.map((item, index) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.item}
                  onPress={() => {
                    setStudent(item.submittedBy);
                    setSubmissionListNumber(index);
                  }}>
                  <Text>{item.submittedBy.name}</Text>
                  <Text style={styles.itemSubtitle}>
                    {(item.work && item.work != '') ||
                    (item.files && item.files.length != 0)
                      ? 'Submitted'
                      : 'No submission'}
                  </Text>
                </TouchableOpacity>
              );
            })}
        </ScrollView>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginRight: 5,
    color: '#666',
  },
  header: {
    color: '#ededed',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
  },
  headerContainer: {
    backgroundColor: '#3d3d3d',
    justifyContent: 'center',
    width: 'auto',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
});
export default SubmissionList;
