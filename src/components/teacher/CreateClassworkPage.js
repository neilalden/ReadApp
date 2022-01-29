import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  ScrollView,
  TextInput,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from 'react-native';
import IconUpload from '../../../assets/uploadFile.svg';
import IconGoBack from '../../../assets/goback.svg';
import IconRemove from '../../../assets/x-circle.svg';
import {useHistory} from 'react-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  ClassContext,
  createClasswork,
  createLecture,
} from '../../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

const CreateClassworkPage = () => {
  const {classList, setClassList, classNumber, classworkNumber} =
    useContext(ClassContext);
  const history = useHistory();
  const [tab, setTab] = useState(0);
  //
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [closeOnDeadline, setCloseOnDeadline] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [pointsPerRight, setPointsPerRight] = useState(5);
  const [isPosting, setIsPosting] = useState(false);
  // Quiz specific states
  const [pointsPerWrong, setPointsPerWrong] = useState(0);
  const [quizItems, setQuizItems] = useState([]);
  const [question, setQuestion] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [isOptions, setIsOptions] = useState(true);
  const [options, setOptions] = useState([]);
  const [option, setOption] = useState('');
  // Activity specific states
  const [files, setFiles] = useState([]);
  // Lecture states
  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureInstruction, setLectureInstruction] = useState('');
  const [lecturefiles, setLecturefiles] = useState([]);

  const classId = classList[classNumber].classId;
  const filePath = `${classId}/classworks/`;

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      backAlert();
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  const backAlert = () => {
    if (
      title !== '' ||
      instruction !== '' ||
      question !== '' ||
      correctAnswer !== '' ||
      option !== '' ||
      files.length !== 0 ||
      quizItems.length !== 0 ||
      options.length !== 0
    ) {
      Alert.alert(
        'Are you sure?',
        'Leaving this page would discard all your progress',
        [
          {
            text: 'Yes',
            onPress: () => {
              history.push('/Classroom');
            },
          },
          {text: 'No', onPress: () => true},
        ],
      );
    } else {
      history.push('/Classroom');
    }
  };

  return (
    <ScrollView>
      <View style={styles.headerContainer}>
        <View style={styles.flexRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleLeft,
              tab === 0 ? styles.toggleHighlight : styles.toggleUnhighlight,
            ]}
            onPress={() => {
              setTab(0);
              setPointsPerRight(5);
            }}>
            <Text style={styles.buttonText}>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleMiddle,
              tab === 1 ? styles.toggleHighlight : styles.toggleUnhighlight,
            ]}
            onPress={() => {
              setTab(1);
              setPointsPerRight(100);
            }}>
            <Text style={styles.buttonText}>Activity</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleRight,
              tab === 2 ? styles.toggleHighlight : styles.toggleUnhighlight,
            ]}
            onPress={() => {
              setTab(2);
              setPointsPerRight(100);
            }}>
            <Text style={styles.buttonText}>Lectures</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.back} onPress={backAlert}>
          <IconGoBack height={30} width={30} style={styles.goback} />
        </TouchableOpacity>
      </View>
      {tab === 0 ? (
        <QuizWork
          classNumber={classNumber}
          classList={classList}
          setClassList={setClassList}
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          mode={mode}
          setMode={setMode}
          show={show}
          setShow={setShow}
          closeOnDeadline={closeOnDeadline}
          setCloseOnDeadline={setCloseOnDeadline}
          pointsPerRight={pointsPerRight}
          setPointsPerRight={setPointsPerRight}
          pointsPerWrong={pointsPerWrong}
          setPointsPerWrong={setPointsPerWrong}
          quizItems={quizItems}
          setQuizItems={setQuizItems}
          instruction={instruction}
          setInstruction={setInstruction}
          question={question}
          setQuestion={setQuestion}
          correctAnswer={correctAnswer}
          setCorrectAnswer={setCorrectAnswer}
          isOptions={isOptions}
          setIsOptions={setIsOptions}
          options={options}
          setOptions={setOptions}
          option={option}
          setOption={setOption}
          isPosting={isPosting}
          setIsPosting={setIsPosting}
        />
      ) : tab === 1 ? (
        <ActivityWork
          files={files}
          setFiles={setFiles}
          classNumber={classNumber}
          classList={classList}
          setClassList={setClassList}
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          mode={mode}
          setMode={setMode}
          show={show}
          setShow={setShow}
          closeOnDeadline={closeOnDeadline}
          setCloseOnDeadline={setCloseOnDeadline}
          instruction={instruction}
          setInstruction={setInstruction}
          pointsPerRight={pointsPerRight}
          setPointsPerRight={setPointsPerRight}
          filePath={filePath}
          isPosting={isPosting}
          setIsPosting={setIsPosting}
        />
      ) : (
        <Lecture
          lectureTitle={lectureTitle}
          setLectureTitle={setLectureTitle}
          lectureInstruction={lectureInstruction}
          setLectureInstruction={setLectureInstruction}
          lecturefiles={lecturefiles}
          setLecturefiles={setLecturefiles}
          isPosting={isPosting}
          setIsPosting={setIsPosting}
          classList={classList}
          setClassList={setClassList}
          classNumber={classNumber}
        />
      )}
    </ScrollView>
  );
};

const Lecture = ({
  lectureTitle,
  setLectureTitle,
  lectureInstruction,
  setLectureInstruction,
  lecturefiles,
  setLecturefiles,
  isPosting,
  setIsPosting,
  classList,
  setClassList,
  classNumber,
}) => {
  const openFile = () => {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    )
      .then(async response => {
        if (response) {
          DocumentPicker.pickMultiple({
            type: [DocumentPicker.types.allFiles],
            mode: 'open',
            copyTo: 'cachesDirectory',
          })
            .then(res => {
              setLecturefiles(prev => [
                ...prev,
                {fileName: res[0].name, uri: res[0].fileCopyUri},
              ]);
            })
            .catch(e => alert(`${e}`));
        } else {
          const permission = await requestStoragePermission();
          if (permission) {
            DocumentPicker.pickMultiple({
              type: [DocumentPicker.types.allFiles],
              mode: 'open',
              copyTo: 'cachesDirectory',
            })
              .then(res => {
                setLecturefiles(prev => [
                  ...prev,
                  {fileName: res[0].name, uri: res[0].fileCopyUri},
                ]);
              })
              .catch(e => alert(`${e}`));
          } else {
            alert('Alert', 'Unable to upload file');
          }
        }
      })
      .catch(e => alert('Alert', `${e}`));
  };

  const handleAddLecture = () => {
    setIsPosting(true);

    if (lectureTitle === '') {
      alert('Lecture title is not filled properly');
      setIsPosting(false);
      return;
    }
    const addLecture = async () => {
      ToastAndroid.show('Posting lecture...', ToastAndroid.SHORT);
      let urls = [];
      const filePath = `${classList[classNumber].classId}/lectures/`;
      if (lecturefiles.length !== 0) {
        for (const i in lecturefiles) {
          const reference = storage().ref(filePath + lecturefiles[i].fileName);
          reference
            .putFile(lecturefiles[i].uri)
            .then(() => {
              urls.push(filePath + lecturefiles[i].fileName);
              if (urls.length === lecturefiles.length) {
                let data = {
                  createdAt: firestore.Timestamp.fromDate(new Date()),
                  title: lectureTitle,
                  instruction: lectureInstruction,
                  files: urls,
                };
                createLecture(data, classList, classNumber);
                ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
                let copyClassList = [...classList];
                copyClassList[classNumber].lectures.push(data);
                setIsPosting(false);
                setClassList(copyClassList);
                setLectureTitle('');
                setLectureInstruction('');
                setLecturefiles([]);
                return;
              }
            })
            .catch(e => {
              alert(`${e}`);
              setIsPosting(false);
            });
        }
      } else {
        let data = {
          createdAt: firestore.Timestamp.fromDate(new Date()),
          title: lectureTitle,
          instruction: lectureInstruction,
        };
        createLecture(data, classList, classNumber);

        ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
        let copyClassList = [...classList];
        copyClassList[classNumber].lectures.push(data);
        setIsPosting(false);
        setClassList(copyClassList);
        setLectureTitle('');
        setLectureInstruction('');
        return;
      }
    };
    addLecture();
  };

  return (
    <ScrollView style={styles.workContainer}>
      <View
        style={[
          styles.card,
          {
            marginTop: 0,
          },
        ]}>
        <Text style={styles.header}>Lecture title</Text>
        <TextInput
          placeholder="Lecture 1"
          multiline={true}
          style={styles.item}
          value={lectureTitle}
          onChangeText={text => setLectureTitle(text)}
        />
        <Text style={styles.header}>Instruction</Text>
        <TextInput
          placeholder="Review the following..."
          multiline={true}
          style={styles.item}
          value={lectureInstruction}
          onChangeText={text => setLectureInstruction(text)}
        />
      </View>

      {lecturefiles.map((item, index) => {
        return (
          <TouchableOpacity
            style={styles.fileItem}
            key={index}
            onPress={() => {
              let lecturefilesCopy = [...lecturefiles];
              lecturefilesCopy.splice(index, 1);
              setLecturefiles(lecturefilesCopy);
            }}>
            <Text style={{maxWidth: '90%'}}>{item.fileName}</Text>
            <IconRemove height={30} width={30} color={'red'} />
          </TouchableOpacity>
        );
      })}
      <Text style={[styles.subtitle, {paddingHorizontal: 10}]}>
        Reminder: Most devices only support images, videos, text, and PDF files.
        Any other file types would require students to have the neccesarry
        application to open them
      </Text>
      <TouchableOpacity
        onPress={openFile}
        style={[
          styles.submitButton,
          {
            padding: 12,
            borderWidth: 3,
            borderColor: '#ADD8E6',
            backgroundColor: '#FFF',
            justifyContent: 'center',
            flexDirection: 'row',
          },
        ]}>
        <Text>Upload file</Text>
        <IconUpload style={styles.uploadIcon} />
      </TouchableOpacity>
      <View style={styles.marginBottom}>
        <TouchableOpacity
          disabled={isPosting}
          style={styles.submitButton}
          onPress={handleAddLecture}>
          <Text>Post Lecture</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const QuizWork = ({
  title,
  setTitle,
  classNumber,
  classList,
  setClassList,
  date,
  setDate,
  mode,
  setMode,
  show,
  setShow,
  closeOnDeadline,
  setCloseOnDeadline,
  pointsPerRight,
  setPointsPerRight,
  pointsPerWrong,
  setPointsPerWrong,
  quizItems,
  setQuizItems,
  instruction,
  setInstruction,
  question,
  setQuestion,
  correctAnswer,
  setCorrectAnswer,
  isOptions,
  setIsOptions,
  options,
  setOptions,
  option,
  setOption,
  isPosting,
  setIsPosting,
}) => {
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };
  const handleAddOption = () => {
    if (option === '') {
      alert('please write an option');
    } else {
      let copyOptions = [...options];
      copyOptions.push(option);
      setOptions(copyOptions);
      setOption('');
    }
  };
  const handleRemoveQuestion = index => {
    let copyQuizItems = [...quizItems];
    copyQuizItems.splice(index, 1);
    setQuizItems(copyQuizItems);
  };
  const handleAddQuestion = () => {
    let quizItem = {};
    if (question == '' || correctAnswer == '') {
      alert('A question and an answer is both needed for a quiz');
      return;
    }
    if (isOptions) {
      if (options.length == 0) {
        alert('Please place some options for students to choose from');
        return;
      }
      quizItem = {
        question: question,
        answer: correctAnswer,
        options: options,
      };
    } else {
      quizItem = {
        question: question,
        answer: correctAnswer,
      };
    }
    let copyQuizItems = [...quizItems];
    copyQuizItems.push(quizItem);
    setQuizItems(copyQuizItems);
    setQuestion('');
    setCorrectAnswer('');
    setOptions([]);
    setOption('');
  };
  const handleAddQuiz = () => {
    setIsPosting(true);
    const parsedPointsPerRight = parseInt(pointsPerRight);
    const parsedPointsPerWrong = parseInt(pointsPerWrong);
    if (title == '') {
      alert('Quiz title is not filled properly');

      setIsPosting(false);
      return;
    } else if (instruction === '') {
      alert('Quiz instruction is not filled properly');

      setIsPosting(false);
      return;
    } else if (isNaN(parsedPointsPerRight)) {
      alert('Points per right on this quiz is not filled properly');

      setIsPosting(false);
      return;
    } else if (isNaN(parsedPointsPerWrong)) {
      alert('Points per wrong on this quiz is not filled properly');

      setIsPosting(false);
      return;
    } else if (quizItems.length == 0) {
      alert('There are no questions for this quiz');

      setIsPosting(false);
      return;
    }
    const addQuiz = () => {
      ToastAndroid.show('Posting classwork...', ToastAndroid.SHORT);
      const points = quizItems.length * parsedPointsPerRight;
      var date_converted = firestore.Timestamp.fromDate(date);
      let data = {
        createdAt: firestore.Timestamp.fromDate(new Date()),
        title: title,
        deadline: date_converted,
        closeOnDeadline: closeOnDeadline,
        instruction: instruction,
        points: points,
        isActivity: false,
        questions: quizItems,
        pointsPerRight: parsedPointsPerRight,
        pointsPerWrong: parsedPointsPerWrong,
      };
      createClasswork(data, classList, classNumber);

      ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
      let copyClassList = [...classList];
      copyClassList[classNumber].classworkList.push(data);
      setClassList(copyClassList);
      setIsPosting(false);
      setTitle('');
      setInstruction('');
      setDate(new Date());
      setQuizItems([]);
      setPointsPerRight(5);
      setPointsPerWrong(0);

      return;
    };

    if (date.getDate() === new Date().getDate()) {
      Alert.alert('Are you sure?', 'Set the deadline today?', [
        {
          text: 'Yes',
          onPress: () => {
            addQuiz();
          },
        },
        {
          text: 'No',
          onPress: () => true,
        },
      ]);
    } else {
      addQuiz();
    }
  };
  return (
    <ScrollView style={styles.workContainer}>
      <View
        style={[
          styles.card,
          {
            marginTop: 0,
          },
        ]}>
        <Text style={styles.header}>Quiz title</Text>
        <TextInput
          placeholder="Quiz 1"
          multiline={true}
          style={styles.item}
          value={title}
          onChangeText={text => setTitle(text)}
        />
        <View style={{flexDirection: 'row'}}>
          <Text style={[styles.header, {textAlignVertical: 'center'}]}>
            Deadline
          </Text>
          <TouchableOpacity
            onPress={showDatepicker}
            style={[
              styles.button,
              {
                padding: 5,
                paddingBottom: 2,
                marginLeft: 0,
                backgroundColor: '#E8EAED',
              },
            ]}>
            <Text style={styles.subtitle}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showTimepicker}
            style={[
              styles.button,
              {
                padding: 5,
                paddingBottom: 2,
                marginLeft: 0,
                backgroundColor: '#E8EAED',
              },
            ]}>
            <Text style={styles.subtitle}>Time</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={false}
              display={'default'}
              onChange={onChange}
            />
          )}
        </View>
        <Text
          style={[
            styles.subtitle,
            {backgroundColor: '#ADD8E6'},
          ]}>{`${date}`}</Text>
        <Text style={styles.header}>Close on deadline </Text>
        <View style={styles.flexRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleLeft,
              {margin: 5, padding: 5, minWidth: 150},

              closeOnDeadline
                ? {backgroundColor: '#63b4cf'}
                : {
                    borderWidth: 3,
                    borderColor: '#E8EAED',
                    backgroundColor: '#E8EAED',
                  },
            ]}
            onPress={() => setCloseOnDeadline(true)}>
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleRight,
              {margin: 5, padding: 5, minWidth: 150},
              !closeOnDeadline
                ? styles.toggleHighlight
                : styles.toggleUnhighlight,
            ]}
            onPress={() => setCloseOnDeadline(false)}>
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Instruction </Text>
        <TextInput
          placeholder="Read each question carefully"
          multiline={true}
          style={styles.item}
          value={instruction}
          onChangeText={text => setInstruction(text)}
        />
        <View>
          <Text style={styles.header}>Points per ✔️</Text>
          <TextInput
            placeholder="5"
            keyboardType="number-pad"
            style={styles.item}
            value={pointsPerRight.toString()}
            onChangeText={text => setPointsPerRight(text)}
          />
          <Text style={styles.subtitle}>
            (points a student get every right answer)
          </Text>
        </View>
        <View>
          <Text style={styles.header}>Points per ✖️</Text>
          <TextInput
            placeholder="-5"
            keyboardType="number-pad"
            style={styles.item}
            value={pointsPerWrong.toString()}
            onChangeText={text => setPointsPerWrong(text)}
          />
          <Text style={styles.subtitle}>
            (place a negative value for deduction every wrong answer)
          </Text>
        </View>

        <Text style={styles.header}>
          Points for this quiz :{' '}
          <Text style={{fontWeight: 'bold'}}>
            {quizItems.length * pointsPerRight}
            &nbsp;points
          </Text>
        </Text>
        <Text style={styles.subtitle}>
          (number of questions * points per ✔️)
        </Text>
      </View>

      <View>
        <View style={styles.card}>
          <Text style={styles.header}>Question </Text>
          <TextInput
            placeholder="Write question here..."
            multiline={true}
            style={styles.item}
            value={question}
            onChangeText={text => setQuestion(text)}
          />

          <Text style={styles.header}>Answer type </Text>
          <View style={styles.flexRow}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.toggleLeft,
                {margin: 5, padding: 5, minWidth: 150},

                isOptions ? styles.toggleHighlight : styles.toggleUnhighlight,
              ]}
              onPress={() => setIsOptions(true)}>
              <Text style={styles.buttonText}>Options</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.toggleRight,
                {margin: 5, padding: 5, minWidth: 150},
                !isOptions
                  ? {backgroundColor: '#63b4cf'}
                  : {
                      borderWidth: 3,
                      borderColor: '#E8EAED',
                      backgroundColor: '#E8EAED',
                    },
              ]}
              onPress={() => setIsOptions(false)}>
              <Text style={styles.buttonText}>Write</Text>
            </TouchableOpacity>
          </View>

          {/* OPTION ANSWER TYPE */}
          {isOptions ? (
            <View>
              <Text style={styles.header}>Correct answer </Text>
              <View style={styles.flexRow}>
                <View style={styles.mark}></View>
                <TextInput
                  placeholder="Write the correct answer here..."
                  style={[styles.item, {width: '75%'}]}
                  value={correctAnswer}
                  onChangeText={text => setCorrectAnswer(text)}
                />
              </View>

              <Text style={styles.header}>Add option </Text>
              <View style={styles.flexRow}>
                <View style={styles.mark}></View>
                <TextInput
                  placeholder="Write an option here..."
                  style={[styles.item, {width: '75%'}]}
                  value={option}
                  onChangeText={text => setOption(text)}
                />
              </View>
              <TouchableOpacity
                style={[
                  styles.button,
                  {
                    backgroundColor: '#E8EAED',
                  },
                ]}
                onPress={handleAddOption}>
                <Text style={styles.subtitle}>+ Add option</Text>
              </TouchableOpacity>
              <Text style={styles.header}>Added options </Text>
              <View>
                {options.length == 0 ? (
                  <Text style={styles.subtitle}>No options added yet</Text>
                ) : (
                  options.map((item, index) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.flexRow}
                        onPress={() => {
                          let copyOptions = [...options];
                          copyOptions.splice(index, 1);
                          setOptions(copyOptions);
                        }}>
                        <View style={styles.mark}></View>
                        <Text style={[styles.item, {width: '75%'}]}>
                          {item}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>
          ) : (
            // WRITE ANSWER TYPE
            <View>
              <Text style={styles.header}>Correct answer </Text>
              <TextInput
                placeholder="Write the correct answer here..."
                style={styles.item}
                value={correctAnswer}
                onChangeText={text => setCorrectAnswer(text)}
              />
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            styles.marginBottom,
            {
              marginHorizontal: 10,
            },
          ]}
          onPress={handleAddQuestion}>
          <Text style={styles.subtitle}>+ Add question</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.marginBottom}>
        <Text style={styles.header}>Quiz items</Text>
        {quizItems.length === 0 ? (
          <Text style={styles.subtitle}>No items yet</Text>
        ) : (
          quizItems.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => handleRemoveQuestion(index)}>
                <View style={styles.headerContainer}>
                  <Text style={styles.header}>Question</Text>
                  <IconRemove height={30} width={30} color={'red'} />
                </View>
                <Text style={styles.item}>{item.question}</Text>

                <View>
                  <Text style={styles.header}>Correct answer</Text>
                  <Text style={styles.item}>{item.answer}</Text>
                </View>
                {item.options ? (
                  <Text style={styles.header}>Options</Text>
                ) : (
                  <></>
                )}
                {item.options &&
                  item.options.map((itm, idx) => {
                    return (
                      <Text style={styles.item} key={idx}>
                        {itm}
                      </Text>
                    );
                  })}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <View style={styles.marginBottom}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddQuiz}
          disabled={isPosting}>
          <Text>Post quiz</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};
const ActivityWork = ({
  files,
  setFiles,
  classNumber,
  classList,
  setClassList,
  title,
  setTitle,
  date,
  setDate,
  mode,
  setMode,
  show,
  setShow,
  closeOnDeadline,
  setCloseOnDeadline,
  instruction,
  setInstruction,
  pointsPerRight,
  setPointsPerRight,
  filePath,
  isPosting,
  setIsPosting,
}) => {
  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const openFile = () => {
    PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    )
      .then(async response => {
        if (response) {
          DocumentPicker.pickMultiple({
            type: [DocumentPicker.types.allFiles],
            mode: 'open',
            copyTo: 'cachesDirectory',
          })
            .then(res => {
              setFiles(prev => [
                ...prev,
                {fileName: res[0].name, uri: res[0].fileCopyUri},
              ]);
            })
            .catch(e => alert(`${e}`));
        } else {
          const permission = await requestStoragePermission();
          if (permission) {
            DocumentPicker.pickMultiple({
              type: [DocumentPicker.types.allFiles],
              mode: 'open',
              copyTo: 'cachesDirectory',
            })
              .then(res => {
                setFiles(prev => [
                  ...prev,
                  {fileName: res[0].name, uri: res[0].fileCopyUri},
                ]);
              })
              .catch(e => alert(`${e}`));
          } else {
            alert('Alert', 'Unable to upload file');
          }
        }
      })
      .catch(e => alert('Alert', `${e}`));
  };

  const requestStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'ReadApp Storage Permission',
          message:
            'ReadApp needs access to your storage ' +
            'so you can upload files from your storage',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      alert('Error', `${err}`);
    }
  };

  const getPathForFirebaseStorage = async uri => {
    if (Platform.OS === 'ios') {
      return uri;
    }
    try {
      const stat = await RNFetchBlob.fs.stat(uri);
      return stat.path;
    } catch (e) {
      alert(`${e}`, 'Move file to internal storage');
    }
  };

  const handleAddActivity = () => {
    setIsPosting(true);
    const parsedPointsPerRight = parseInt(pointsPerRight);

    if (title === '') {
      alert('Activity title is not filled properly');

      setIsPosting(false);
      return;
    } else if (instruction == '') {
      alert('Activity instruction is not filled properly');

      setIsPosting(false);
      return;
    } else if (isNaN(parsedPointsPerRight)) {
      alert('Points for this activity is not filled properly');

      setIsPosting(false);
      return;
    }
    const addActivity = async () => {
      ToastAndroid.show('Posting classwork...', ToastAndroid.SHORT);
      var date_converted = firestore.Timestamp.fromDate(date);
      let urls = [];
      if (files.length !== 0) {
        for (const i in files) {
          const reference = storage().ref(filePath + files[i].fileName);
          reference
            .putFile(files[i].uri)
            .then(() => {
              urls.push(filePath + files[i].fileName);
              if (urls.length === files.length) {
                let data = {
                  createdAt: firestore.Timestamp.fromDate(new Date()),
                  title: title,
                  deadline: date_converted,
                  closeOnDeadline: closeOnDeadline,
                  instruction: instruction,
                  points: parsedPointsPerRight,
                  isActivity: true,
                  files: urls,
                };
                createClasswork(data, classList, classNumber);
                ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
                let copyClassList = [...classList];
                copyClassList[classNumber].classworkList.push(data);
                setIsPosting(false);
                setClassList(copyClassList);
                setTitle('');
                setDate(new Date());
                setInstruction('');
                setPointsPerRight(100);
                setFiles([]);
                return;
              }
            })
            .catch(e => {
              alert(`${e}`);
            });
        }
      } else {
        let data = {
          createdAt: firestore.Timestamp.fromDate(new Date()),
          title: title,
          deadline: date_converted,
          closeOnDeadline: closeOnDeadline,
          instruction: instruction,
          points: parsedPointsPerRight,
          isActivity: true,
        };
        createClasswork(data, classList, classNumber);

        ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
        let copyClassList = [...classList];
        copyClassList[classNumber].classworkList.push(data);
        setIsPosting(false);
        setClassList(copyClassList);
        setTitle('');
        setDate(new Date());
        setInstruction('');
        setPointsPerRight(100);
        setFiles([]);
        return;
      }
    };

    if (date.getDate() === new Date().getDate()) {
      Alert.alert('Are you sure?', 'Set the deadline today?', [
        {
          text: 'Yes',
          onPress: () => {
            addActivity();
          },
        },
        {
          text: 'No',
          onPress: () => true,
        },
      ]);
    } else {
      addActivity();
    }
  };
  return (
    <ScrollView style={styles.workContainer}>
      <View
        style={[
          styles.card,
          {
            marginTop: 0,
          },
        ]}>
        <Text style={styles.header}>Activity title </Text>
        <TextInput
          placeholder="Performance task 1"
          multiline={true}
          style={styles.item}
          value={title}
          onChangeText={text => setTitle(text)}
        />
        <View style={{flexDirection: 'row'}}>
          <Text style={[styles.header, {textAlignVertical: 'center'}]}>
            Deadline
          </Text>
          <TouchableOpacity
            onPress={showDatepicker}
            style={[
              styles.button,
              {
                padding: 5,
                paddingBottom: 2,
                marginLeft: 0,
                backgroundColor: '#E8EAED',
              },
            ]}>
            <Text style={styles.subtitle}>Day</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={showTimepicker}
            style={[
              styles.button,
              {
                padding: 5,
                paddingBottom: 2,
                marginLeft: 0,
                backgroundColor: '#E8EAED',
              },
            ]}>
            <Text style={styles.subtitle}>Time</Text>
          </TouchableOpacity>
          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={false}
              display={'default'}
              onChange={onChange}
            />
          )}
        </View>
        <Text
          style={[
            styles.subtitle,
            {backgroundColor: '#ADD8E6'},
          ]}>{`${date}`}</Text>
        <Text style={styles.header}>Close on deadline </Text>
        <View style={styles.flexRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleLeft,
              {margin: 5, padding: 5, minWidth: 150},

              closeOnDeadline
                ? styles.toggleHighlight
                : styles.toggleUnhighlight,
            ]}
            onPress={() => setCloseOnDeadline(true)}>
            <Text style={styles.buttonText}>Yes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleRight,
              {margin: 5, padding: 5, minWidth: 150},
              !closeOnDeadline
                ? {backgroundColor: '#63b4cf'}
                : {
                    borderWidth: 3,
                    borderColor: '#E8EAED',
                    backgroundColor: '#E8EAED',
                  },
            ]}
            onPress={() => setCloseOnDeadline(false)}>
            <Text style={styles.buttonText}>No</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>Instruction </Text>
        <TextInput
          placeholder="Write an essay about the file below..."
          multiline={true}
          style={styles.item}
          value={instruction}
          onChangeText={text => setInstruction(text)}
        />
        <View>
          <Text style={styles.header}>Points for the activity</Text>
          <TextInput
            placeholder="100"
            keyboardType="number-pad"
            style={styles.item}
            value={pointsPerRight.toString()}
            onChangeText={text => setPointsPerRight(text)}
          />
        </View>
      </View>
      {files.map((item, index) => {
        return (
          <TouchableOpacity
            style={styles.fileItem}
            key={index}
            onPress={() => {
              let filesCopy = [...files];
              filesCopy.splice(index, 1);
              setFiles(filesCopy);
            }}>
            <Text style={{maxWidth: '90%'}}>{item.fileName}</Text>
            <IconRemove height={30} width={30} color={'red'} />
          </TouchableOpacity>
        );
      })}
      <Text style={[styles.subtitle, {paddingHorizontal: 10}]}>
        Reminder: Most devices only support images, videos, text, and PDF files.
        Any other file types would require students to have the neccesarry
        application to open them
      </Text>
      <TouchableOpacity
        onPress={openFile}
        style={[
          styles.submitButton,
          {
            padding: 12,
            borderWidth: 3,
            borderColor: '#ADD8E6',
            backgroundColor: '#FFF',
            justifyContent: 'center',
            flexDirection: 'row',
          },
        ]}>
        <Text>Upload file</Text>
        <IconUpload style={styles.uploadIcon} />
      </TouchableOpacity>
      <View style={styles.marginBottom}>
        <TouchableOpacity
          disabled={isPosting}
          style={styles.submitButton}
          onPress={handleAddActivity}>
          <Text>Post activity</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const alert = (message, title = 'Alert!') => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workContainer: {},
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 10,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    marginBottom: 5,
  },
  buttonText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ADD8E6',
    alignItems: 'center',
    minWidth: 90,
    padding: 10,
    margin: 10,
    borderRadius: 10,
  },
  submitButton: {
    marginVertical: 5,
    backgroundColor: '#ADD8E6',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleLeft: {
    borderTopEndRadius: 0,
    borderBottomEndRadius: 0,
    marginRight: 0,
  },
  toggleMiddle: {
    borderRadius: 0,
    marginHorizontal: 0,
  },
  toggleRight: {
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
    marginHorizontal: 0,
  },
  toggleHighlight: {backgroundColor: '#63b4cf'},
  toggleUnhighlight: {
    borderWidth: 3,
    borderColor: '#E8EAED',
    backgroundColor: '#E8EAED',
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  marginBottom: {
    marginBottom: 50,
  },
  iconContainer: {
    alignSelf: 'center',
    borderRadius: 50,
    padding: 5,
  },
  back: {
    borderRadius: 50,
    backgroundColor: '#ADD8E6',
    height: 40,
    width: 40,
    justifyContent: 'center', //Centered horizontally

    alignSelf: 'center',
    padding: 5,
    marginRight: 10,
  },
  goback: {
    color: '#fff',
    borderRadius: 50,
    alignSelf: 'center',
  },
  mark: {
    height: 25,
    width: 25,
    borderRadius: 10,
    borderColor: '#E8EAED',
    borderWidth: 3,
    backgroundColor: '#ADD8E6',
    alignSelf: 'center',
  },
  fileItem: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 3,
    padding: 15,
    borderRadius: 10,
  },
  uploadIcon: {
    color: '#000',
    height: 20,
    width: 20,
    marginLeft: 5,
  },
});

export default CreateClassworkPage;
