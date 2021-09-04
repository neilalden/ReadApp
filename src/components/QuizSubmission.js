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
} from 'react-native';
import {ClassContext, fetchSubmision} from '../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';

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
  useEffect(() => {
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
    if (new Date() > classwork.deadline.toDate() && classwork.closeOnDeadline) {
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
            {submission && submission.score
              ? `${submission.score}/${classwork.points}`
              : 'no grades yet'}
          </Text>
        </View>

        {submission.submittedAt &&
        classwork &&
        submission.submittedAt.toDate() > classwork.deadline.toDate() ? (
          <Text style={[styles.subtitle, {color: '#666'}]}>
            Late submission
          </Text>
        ) : (
          <></>
        )}
      </View>

      {/* Student Quiz screen has two (2) states */}
      {/* > Student has taken the quiz */}
      {/* > Student has NOT taken the quiz */}

      {(() => {
        if (isClosed && studentInfo.isStudent) {
          return (
            <View style={styles.questionContainer}>
              <Text style={[styles.subtitle, {color: '#666'}]}>
                Quiz is close
              </Text>
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
                    <Text style={styles.header}>Question</Text>
                    <Text style={styles.item}>{item.question}</Text>
                    <View>
                      <Text style={styles.header}>Correct answer</Text>
                      <Text style={styles.item}>{item['answer']}</Text>
                    </View>
                    <View>
                      <Text style={styles.header}>
                        {userInfo.isStudent ? `Your ` : `Student's `}
                        answer
                      </Text>
                      <Text
                        style={[
                          styles.item,
                          item['answer'] == submission.work[item.question]
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
                      <Text style={styles.item}>{item.question}</Text>
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
                    )
                  }>
                  <Text>Finish</Text>
                </TouchableOpacity>
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
    // USER HAS ANSWERED EVERY QUESTION
    // SCORING USER
    let score = 0;
    for (const i in classwork.questions) {
      if (
        classwork.questions[i].answer ==
        userAnswers[classwork.questions[i].question]
      ) {
        score += pointsPerRight;
      } else {
        score += pointsPerWrong;
      }
    }
    // SAVE TO DB USER SUBMISSION
    firestore()
      .collection(`classes/${classId}/classworks/${classwork.id}/submissions`)
      .doc(userInfo.id)
      .set({
        work: userAnswers,
        score: score,
        submittedAt: firestore.FieldValue.serverTimestamp(),
      })
      .then(res => {
        setReload(true);
      })
      .catch(e => alert(e));
  }
};
const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
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
    color: '#ccc',
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
    marginTop: 5,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 15,
    alignItems: 'center',
  },
  optionsContainer: {
    padding: 0,
  },
});
export default QuizSubmission;
