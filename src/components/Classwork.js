import React, {useContext, useEffect, useState} from 'react';
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
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Classroom');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <ScrollView>
      <ClassroomHeader
        subject={classList[classNumber].subject}
        backTo={'/Classroom'}
        isStudent={userInfo.isStudent}
      />
      {!userInfo.isStudent ? (
        // if user is a teacher show component
        <SubmissionList userInfo={userInfo} />
      ) : classwork.isActivity ? (
        // if user is a student and the classwork is an activity show component
        <ActivitySubmission userInfo={userInfo} />
      ) : (
        // if user is a student and the classwork is a quiz show component
        <QuizSubmission userInfo={userInfo} />
      )}
    </ScrollView>
  );
};

export default Classwork;
