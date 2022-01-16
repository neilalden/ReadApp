import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {ClassContext, fetchSubmision} from '../../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QuizSubmission = ({userInfo, student, setStudent}) => {
  const {
    classNumber,
    classworkNumber,
    submissionListNumber,
    classList,
    setClassList,
  } = useContext(ClassContext);
  const [studentInfo, setStudentInfo] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [submission, setSubmission] = useState({});
  const [isClosed, setIsClosed] = useState(false);
  const [reload, setReload] = useState(false);
  const history = useHistory();

  const classId = classList[classNumber].classId;
  const classwork = classList[classNumber].classworkList[classworkNumber];
  const pointsPerRight =
    classList[classNumber].classworkList[classworkNumber].pointsPerRight;
  const pointsPerWrong =
    classList[classNumber].classworkList[classworkNumber].pointsPerWrong;
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    if (!userInfo.isStudent) {
      setStudentInfo(student);
      setSubmission(
        classList[classNumber].classworkList[classworkNumber].submissionList[
          submissionListNumber
        ],
      );
    } else {
      setStudentInfo(userInfo);
      if (
        !classList[classNumber].classworkList[classworkNumber].submission ||
        reload
      ) {
        fetchSubmision(
          classNumber,
          classworkNumber,
          classList,
          setClassList,
          userInfo,
        );
        setReload(false);
      } else {
        setSubmission(
          classList[classNumber].classworkList[classworkNumber].submission,
        );
      }
    }
    if (
      new Date() >
        new Date(
          classwork.deadline.toDate
            ? classwork.deadline.toDate()
            : classwork.deadline.seconds * 1000,
        ) &&
      classwork.closeOnDeadline
    ) {
      setIsClosed(true);
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (!userInfo.isStudent) {
        setStudent({});
      } else {
        history.push('/Classroom');
      }
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [reload, classList]);
  if (Object.keys(studentInfo).length === 0 || submission === {}) {
    return (
      <View>
        <Text style={styles.subtitle}>Loading...</Text>
      </View>
    );
  }
  return (
    <View>
      {!studentInfo.isStudent ? (
        <View style={styles.headerContainer}>
          <Text
            style={[
              styles.header,
              {
                color: '#ededed',
                textAlign: 'center',
                padding: 15,
              },
            ]}>
            {studentInfo.name}
          </Text>
        </View>
      ) : (
        <></>
      )}
      <View style={styles.questionContainer}>
        <View>
          <Text style={styles.header}>Instruction</Text>
          <Text style={styles.item}>{classwork.instruction}</Text>
        </View>
        <View>
          <Text style={styles.header}>Score</Text>
          <Text style={styles.item}>
            {submission && (submission.score || submission.score === 0)
              ? `${submission.score}/${classwork.points}`
              : 'no grades yet'}
          </Text>
        </View>

        {submission.submittedAt &&
        classwork &&
        new Date(
          submission.submittedAt.toDate
            ? submission.submittedAt.toDate()
            : submission.submittedAt.seconds * 1000,
        ) >
          new Date(
            classwork.deadline.toDate
              ? classwork.deadline.toDate()
              : classwork.deadline.seconds * 1000,
          ) ? (
          <Text style={styles.subtitle}>Late submission</Text>
        ) : (
          <></>
        )}
      </View>

      {/* Student Quiz screen has two (2) states */}
      {/* > Student has taken the quiz */}
      {/* > Student has NOT taken the quiz */}

      {(() => {
        if (
          isClosed &&
          studentInfo.isStudent &&
          (!submission.work || Object.keys(submission.work).length === 0)
        ) {
          return (
            <View style={styles.questionContainer}>
              <Text style={styles.subtitle}>Quiz is close</Text>
            </View>
          );
        } else if (
          submission.work &&
          Object.keys(submission.work).length !== 0
        ) {
          // STUDENT HAS TAKEN THE QUIZ
          return (
            <ScrollView>
              {classwork.questions.map((item, index) => {
                return (
                  <View key={index} style={styles.questionContainer}>
                    <Text style={styles.header}>{item.question}</Text>
                    <View>
                      <Text
                        style={[
                          styles.item,
                          item['answer'].toLowerCase() ==
                          submission.work[item.question].toLowerCase()
                            ? {backgroundColor: 'forestgreen'}
                            : {backgroundColor: 'crimson'},
                        ]}>
                        {submission.work[item.question]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          );
        } else {
          // STUDENT HAS NOT TAKEN THE QUIZ YET
          return (
            <>
              <ScrollView>
                {classwork.questions.map((item, index) => {
                  let options = item.options
                    ? [...item.options, item.answer]
                    : undefined;
                  if (options) options.sort();
                  return (
                    <View key={index} style={styles.questionContainer}>
                      <Text style={styles.header}>{item.question}</Text>
                      {options ? (
                        <View style={styles.optionsContainer}>
                          {options.map((itm, idx) => {
                            return (
                              <TouchableOpacity
                                key={idx}
                                disabled={!userInfo.isStudent || isClosed}
                                style={[
                                  styles.item,
                                  userAnswers[item.question] &&
                                  userAnswers[item.question] == itm
                                    ? {
                                        borderColor: '#3ca1c3',
                                        borderWidth: 3,
                                        padding: 12,
                                      }
                                    : {},
                                ]}
                                onPress={() =>
                                  handleAnswer(
                                    userAnswers,
                                    setUserAnswers,
                                    itm,
                                    item.question,
                                  )
                                }>
                                <Text>{itm}</Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      ) : (
                        <TextInput
                          placeholder="Write your answers here.."
                          editable={userInfo.isStudent && !isClosed}
                          style={styles.item}
                          value={userAnswers[item.question]}
                          onChangeText={text => {
                            handleAnswer(
                              userAnswers,
                              setUserAnswers,
                              text,
                              item.question,
                            );
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              {userInfo.isStudent ? (
                <>
                  {isConnected && (
                    <TouchableOpacity
                      style={styles.submitButton}
                      disabled={!userInfo.isStudent || isClosed}
                      onPress={() =>
                        handleFinishQuiz(
                          userInfo,
                          userAnswers,
                          classwork,
                          classId,
                          setReload,
                          pointsPerRight,
                          pointsPerWrong,
                          isClosed,
                          isConnected,
                          setUserAnswers,
                        )
                      }>
                      <Text>Finish</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() =>
                      saveToDrafts(
                        userInfo,
                        userAnswers,
                        classwork,
                        classId,
                        setReload,
                        pointsPerRight,
                        pointsPerWrong,
                        setUserAnswers,
                      )
                    }>
                    <Text>Save to drafts</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <></>
              )}
            </>
          );
        }
      })()}
    </View>
  );
};

const saveToDrafts = (
  userInfo,
  userAnswers,
  classwork,
  classId,
  setReload,
  pointsPerRight,
  pointsPerWrong,
  setUserAnswers,
) => {
  // fetch asynch storage
  // get existing drafts
  // push new draft
  if (Object.keys(userAnswers).length !== classwork.questions.length) {
    ToastAndroid.showWithGravity(
      'Please answer every question first',
      ToastAndroid.LONG,
      ToastAndroid.CENTER,
    );
    return;
  }
  AsyncStorage.getItem(`drafts-${classId}`)
    .then(jsonValue => {
      let draftsArr = JSON.parse(jsonValue) ? JSON.parse(jsonValue).drafts : [];
      for (let i in draftsArr) {
        if (draftsArr[i].title == classwork.title) {
          draftsArr.splice(i, 1);
        }
      }
      let score = 0;
      for (const i in classwork.questions) {
        if (
          classwork.questions[i].answer.toLowerCase() ==
          userAnswers[classwork.questions[i].question].toLowerCase()
        ) {
          score += pointsPerRight;
        } else {
          score += pointsPerWrong;
        }
      }
      let work = {};
      for (let i in classwork.questions) {
        work[classwork.questions[i].question] = classwork.questions[i].answer;
      }
      draftsArr.push({
        work: work,
        score: score,
        path: `classes/${classId}/classworks/${classwork.id}/submissions`,
        title: classwork.title,
        id: userInfo.id,
        isActivity: false,
      });
      AsyncStorage.setItem(
        `drafts-${classId}`,
        JSON.stringify({drafts: draftsArr}),
      )
        .then(() => {
          ToastAndroid.showWithGravity(
            'Classwork saved!',
            ToastAndroid.LONG,
            ToastAndroid.CENTER,
          );
          setUserAnswers({});
          setReload(true);
        })
        .catch(e => alert(e.message));
    })
    .catch(e => alert(e.message));
  return;
};

const handleAnswer = (userAnswers, setUserAnswers, value, index) => {
  let copyOfUserAnswers = {...userAnswers};
  copyOfUserAnswers[index] = value;
  setUserAnswers(copyOfUserAnswers);
};
const handleFinishQuiz = (
  userInfo,
  userAnswers,
  classwork,
  classId,
  setReload,
  pointsPerRight,
  pointsPerWrong,
  isClosed,
  isConnected,
  setUserAnswers,
) => {
  if (isClosed) alert('This quiz is close');
  if (!userInfo.isStudent) alert('You are not a student');
  // FIRST VERIFY IF EVERY QUESTION IS ANSWERED
  if (Object.keys(userAnswers).length !== classwork.questions.length) {
    alert('Please answer every question');
  } else {
    for (const [key, value] of Object.entries(userAnswers)) {
      if (value == '') {
        alert(`Please answer every question`);
        return;
      }
    }
    if (!isConnected) {
      saveToDrafts(
        userInfo,
        userAnswers,
        classwork,
        classId,
        setReload,
        pointsPerRight,
        pointsPerWrong,
        setUserAnswers,
      );
    }

    // USER HAS ANSWERED EVERY QUESTION
    // SCORING USER
    let score = 0;
    for (const i in classwork.questions) {
      if (
        classwork.questions[i].answer.toLowerCase() ==
        userAnswers[classwork.questions[i].question].toLowerCase()
      ) {
        score += pointsPerRight;
      } else {
        score += pointsPerWrong;
      }
    }
    // SAVE TO DB USER SUBMISSION
    NetInfo.addEventListener(state => {
      if (state.type == 'wifi') {
        if (state.details.strength < 25) {
          alert(
            'Failed to submit quiz due to week internet connection.\n Try again later',
            'Unable to submit quiz',
          );
          return;
        }
      }
    });

    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({
        work: userAnswers,
        score: score,
        submittedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(() => {
        setReload(true);
      })
      .catch(e => alert(e));
  }
};
const alert = (e, title = `Alert`) =>
  Alert.alert(`${title}`, `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => true},
  ]);

const styles = StyleSheet.create({
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    fontSize: 15,
  },
  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    padding: 3,
  },
  headerContainer: {
    backgroundColor: '#3d3d3d',
    justifyContent: 'center',
    width: 'auto',
    marginHorizontal: 15,
    marginVertical: 10,
    borderRadius: 10,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#000',
  },
  questionContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 10,
  },
  submitButton: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 15,
    alignItems: 'center',
  },
  optionsContainer: {
    padding: 0,
  },
});
export default QuizSubmission;
