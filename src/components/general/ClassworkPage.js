import React, {useContext, useEffect} from 'react';
import {
  ScrollView,
  BackHandler,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useHistory} from 'react-router';

import {ClassContext} from '../../context/ClassContext';
import IconGoBack from '../../../assets/goback.svg';
import SubmissionList from '../teacher/SubmissionList';
import QuizSubmission from './QuizSubmission';
import ActivitySubmission from './ActivitySubmission';
import ClassroomNav from './ClassroomNav';

const ClassworkPage = ({userInfo}) => {
  const {classNumber, classworkNumber, classList} = useContext(ClassContext);
  const classwork = classList[classNumber].classworkList[classworkNumber];
  const history = useHistory();
  useEffect(() => {
    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Classroom');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        {!userInfo.isStudent ? (
          // if user is a teacher show component
          <SubmissionList userInfo={userInfo} />
        ) : classwork.isActivity ? (
          // if user is a student and the classwork is an activity show component
          <>
            <Segment history={history} />
            <ActivitySubmission userInfo={userInfo} />
          </>
        ) : (
          // if user is a student and the classwork is a quiz show component
          <>
            <Segment history={history} />
            <QuizSubmission userInfo={userInfo} />
          </>
        )}
      </ScrollView>
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};

const Segment = ({history}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => history.push('/Classroom')}
        style={styles.backIconContainer}>
        <IconGoBack height={30} width={30} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backIconContainer: {
    backgroundColor: '#ADD8E6',
    height: 40,
    width: 40,
    margin: 10,
    padding: 5,
    borderRadius: 50,
  },
  backIcon: {
    color: '#FFF',
    alignSelf: 'center',
  },
});
export default ClassworkPage;
