import React, {useContext, useEffect} from 'react';
import {ScrollView, BackHandler} from 'react-native';

import {ClassContext} from '../context/ClassContext';
import ClassroomHeader from './ClassroomHeader';
import SubmissionList from './SubmissionList';
import {useHistory} from 'react-router';
import QuizSubmission from './QuizSubmission';
import ActivitySubmission from './ActivitySubmission';
const Classwork = ({userInfo}) => {
  const {classNumber, classworkNumber, classList} = useContext(ClassContext);
  const classwork = classList[classNumber].classworkList[classworkNumber];
  const history = useHistory();
  useEffect(() => {
    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () =>
      history.push('/Classroom'),
    );
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <>
      <ClassroomHeader
        classCode={classList[classNumber].classCode}
        backTo={'/Classroom'}
        isStudent={userInfo.isStudent}
      />

      <ScrollView>
        {!userInfo.isStudent ? (
          // if user is a teacher show component
          <SubmissionList />
        ) : classwork.isActivity ? (
          // if user is a student and the classwork is an activity show component
          <ActivitySubmission userInfo={userInfo} />
        ) : (
          // if user is a student and the classwork is a quiz show component
          <QuizSubmission userInfo={userInfo} />
        )}
      </ScrollView>
    </>
  );
};

export default Classwork;
