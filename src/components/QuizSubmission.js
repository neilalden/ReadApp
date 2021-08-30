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

const QuizSubmission = ({userInfo, student}) => {
  const {
    classNumber,
    classworkNumber,
    submissionListNumber,
    classList,
    setClassList,
  } = useContext(ClassContext);
  const history = useHistory();
  const [studentInfo, setStudentInfo] = useState({});
  const [userAnswers, setUserAnswers] = useState({});
  const [submission, setSubmission] = useState({});
  const [reload, setReload] = useState(false);

  const classwork = classList[classNumber].classworkList[classworkNumber];
  const classId = classList[classNumber].classId;
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
      setSubmission(
        classList[classNumber].classworkList[classworkNumber].submission,
      );
    }
    if (
      (userInfo.isStudent &&
        !classList[classNumber].classworkList[classworkNumber].submission) ||
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
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Classroom');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [reload]);
  return (
    <View>
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
          {student.name}
        </Text>
      </View>
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
      </View>

      {/* Student Quiz screen has two (2) states */}
      {/* > Student has taken the quiz */}
      {/* > Student has NOT taken the quiz */}

      {(() => {
        if (
          submission &&
          Object.keys(submission).length !== 0 &&
          (submission.work || submission.files)
        ) {
          // STUDENT HAS TAKEN THE QUIZ
          return (
            <ScrollView>
              {classwork.questions.map((item, index) => {
                return (
                  <View key={index} style={styles.questionContainer}>
                    <Text style={styles.header}>
                      Question number {index + 1}
                    </Text>
                    <Text style={styles.item}>{item[index + 1]}</Text>
                    <View>
                      <Text style={styles.header}>Correct answer</Text>
                      <Text style={styles.item}>{item['answer']}</Text>
                    </View>
                    <View>
                      <Text style={styles.header}>
                        {userInfo.isStudent ? 'Your' : `Student's `}
                        answer
                      </Text>
                      <Text
                        style={[
                          styles.item,
                          item['answer'] == submission.work[index]
                            ? {backgroundColor: 'forestgreen'}
                            : {backgroundColor: 'crimson'},
                        ]}>
                        {submission.work[index]}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>
          );
        } else {
          if (!userInfo.isStudent)
            return (
              <>
                <Text style={styles.subtitle}>No submission</Text>
              </>
            );
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
                      <Text style={styles.header}>
                        Question number {index + 1}
                      </Text>
                      <Text style={styles.item}>{item[index + 1]}</Text>
                      {options ? (
                        <View style={styles.optionsContainer}>
                          {options.map((itm, idx) => {
                            return (
                              <TouchableOpacity
                                key={idx}
                                style={[
                                  styles.item,
                                  userAnswers[index] &&
                                  userAnswers[index] == itm
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
                                    index,
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
                          style={styles.item}
                          value={userAnswers[index]}
                          onChangeText={text => {
                            handleAnswer(
                              userAnswers,
                              setUserAnswers,
                              text,
                              index,
                            );
                          }}
                        />
                      )}
                    </View>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() =>
                  handleFinishQuiz(
                    userInfo,
                    userAnswers,
                    classwork,
                    classId,
                    setReload,
                  )
                }>
                <Text>Finish</Text>
              </TouchableOpacity>
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
) => {
  if (!userInfo.isStudent) alert('You are not a student');
  // FIRST VERIFY IF EVERY QUESTION IS ANSWERED
  if (Object.keys(userAnswers).length !== classwork.questions.length) {
    alert('Please answer every question');
  } else {
    for (const [key, value] of Object.entries(userAnswers)) {
      if (value == '') {
        const qn = parseInt(key) + 1;
        alert(`You have'nt answered question number ${qn}`);
        return;
      }
    }
    // USER HAS ANSWERED EVERY QUESTION
    // SCORING USER
    let score = 0;
    for (const i in classwork.questions) {
      score =
        classwork.questions[i]['answer'] === userAnswers[i] ? score + 1 : score;
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
