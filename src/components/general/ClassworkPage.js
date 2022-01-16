import React, {useContext, useEffect} from 'react';
import {ScrollView, BackHandler} from 'react-native';
import {useHistory} from 'react-router';

import {ClassContext} from '../../context/ClassContext';
import ClassroomHeader from './ClassroomHeader';
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
        <ClassroomHeader
          subject={classList[classNumber].subject}
          section={classList[classNumber].section}
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
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};

export default ClassworkPage;
