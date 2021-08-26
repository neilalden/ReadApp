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

const QuizSubmission = ({userInfo}) => {
  const {classNumber, classworkNumber, classList, setClassList} =
    useContext(ClassContext);
  const [userAnswers, setUserAnswers] = useState({});
  const [reload, setReload] = useState(false);

  const classwork = classList[classNumber].classworkList[classworkNumber];
  const classId = classList[classNumber].classId;
  const submission = classwork.submission;
  useEffect(() => {
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
    }

    BackHandler.addEventListener('hardwareBackPress', () => true);
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [reload]);
  return (
    <View>
      <View style={styles.questionContainer}>
        <View>
          <Text style={styles.header}>Instruction</Text>
          <Text style={styles.item}>{classwork.instruction}</Text>
        </View>
        <View>
          <Text style={styles.header}>Score</Text>
          <Text style={styles.item}>
            {submission && submission.score
              ? `${submission.score}/${Object.keys(classwork.questions).length}`
              : 'no grades yet'}
          </Text>
        </View>
      </View>

      {/* Student Quiz screen has two (2) states */}
      {/* > Student has taken the quiz */}
      {/* > Student has NOT taken the quiz */}

      {(() => {
        if (submission && Object.keys(submission).length !== 0) {
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
                      <Text style={styles.header}>Your answer</Text>
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
    console.log('student has answered every question');
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
        console.log('success');

        setReload(true);
      })
      .catch(e => alert(e));
  }
};
const alert = e =>
  Alert.alert('Error', `${e ? e : 'Fill up the form properly'}`, [
    {text: 'OK', onPress: () => console.log('OK Pressed')},
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
