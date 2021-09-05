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
} from 'react-native';
import IconUpload from '../../assets/uploadFile.svg';
import IconGoBack from '../../assets/goback.svg';
import IconRemove from '../../assets/x-circle.svg';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useHistory} from 'react-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {ClassContext, createClasswork} from '../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

const CreateClasswork = () => {
  const {classList, classNumber, classworkNumber} = useContext(ClassContext);
  const history = useHistory();
  const [isQuiz, setIsQuiz] = useState(true);
  //
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [closeOnDeadline, setCloseOnDeadline] = useState(false);
  const [instruction, setInstruction] = useState('');
  const [pointsPerRight, setPointsPerRight] = useState(5);
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
              isQuiz ? {backgroundColor: '#ADD8E6'} : {backgroundColor: '#CCC'},
            ]}
            onPress={() => {
              setIsQuiz(true);
              setPointsPerRight(5);
            }}>
            <Text style={styles.buttonText}>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleRight,
              isQuiz ? {backgroundColor: '#CCC'} : {backgroundColor: '#ADD8E6'},
            ]}
            onPress={() => {
              setIsQuiz(false);
              setPointsPerRight(100);
            }}>
            <Text style={styles.buttonText}>Activity</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.iconContainer} onPress={backAlert}>
          <IconGoBack height={40} width={80} color={Colors.black} />
        </TouchableOpacity>
      </View>
      {isQuiz ? (
        <QuizWork
          classNumber={classNumber}
          classList={classList}
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
        />
      ) : (
        <ActivityWork
          files={files}
          setFiles={setFiles}
          classNumber={classNumber}
          classList={classList}
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
        />
      )}
    </ScrollView>
  );
};

const QuizWork = ({
  title,
  setTitle,
  classNumber,
  classList,
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
    const parsedPointsPerRight = parseInt(pointsPerRight);
    const parsedPointsPerWrong = parseInt(pointsPerWrong);
    if (title == '') {
      alert('Quiz title is not filled properly');
      return;
    } else if (instruction === '') {
      alert('Quiz instruction is not filled properly');
      return;
    } else if (isNaN(parsedPointsPerRight)) {
      alert('Points per right on this quiz is not filled properly');
      return;
    } else if (isNaN(parsedPointsPerWrong)) {
      alert('Points per wrong on this quiz is not filled properly');
      return;
    } else if (quizItems.length == 0) {
      alert('There are no questions for this quiz');
      return;
    }
    const addQuiz = () => {
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
      setTitle('');
      setInstruction('');
      setDate(new Date());
      setQuizItems([]);
      setPointsPerRight(5);
      setPointsPerWrong(0);
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
        <Text style={styles.header}>Quiz title </Text>
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
        <Text style={styles.item}>{`${date}`}</Text>
        <Text style={styles.header}>Close on deadline </Text>
        <View style={styles.flexRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleLeft,
              {margin: 5, padding: 5, minWidth: 150},

              closeOnDeadline
                ? {backgroundColor: '#E8EAED'}
                : {borderWidth: 3, borderColor: '#E8EAED'},
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
                ? {backgroundColor: '#E8EAED'}
                : {borderWidth: 3, borderColor: '#E8EAED'},
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

        <Text style={styles.header}>This quiz is worth </Text>
        <Text style={styles.item}>
          {quizItems.length * pointsPerRight} points
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

                isOptions
                  ? {backgroundColor: '#E8EAED'}
                  : {borderWidth: 3, borderColor: '#E8EAED'},
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
                  ? {backgroundColor: '#E8EAED'}
                  : {borderWidth: 3, borderColor: '#E8EAED'},
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
              marginHorizontal: 15,
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
        <TouchableOpacity style={styles.submitButton} onPress={handleAddQuiz}>
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
    const parsedPointsPerRight = parseInt(pointsPerRight);

    if (title === '') {
      alert('Activity title is not filled properly');
      return;
    } else if (instruction == '') {
      alert('Activity instruction is not filled properly');
      return;
    } else if (isNaN(parsedPointsPerRight)) {
      alert('Points for this activity is not filled properly');
      return;
    }
    const addActivity = async () => {
      var date_converted = firestore.Timestamp.fromDate(date);
      let urls = [];
      if (files.length !== 0) {
        for (const i in files) {
          const documentUri = await getPathForFirebaseStorage(files[i].uri);
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
                setTitle('');
                setDate(new Date());
                setInstruction('');
                setPointsPerRight(100);
                setFiles([]);
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
        setTitle('');
        setDate(new Date());
        setInstruction('');
        setPointsPerRight(100);
        setFiles([]);
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
        <Text style={styles.item}>{`${date}`}</Text>
        <Text style={styles.header}>Close on deadline </Text>
        <View style={styles.flexRow}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.toggleLeft,
              {margin: 5, padding: 5, minWidth: 150},

              closeOnDeadline
                ? {backgroundColor: '#E8EAED'}
                : {borderWidth: 3, borderColor: '#E8EAED'},
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
                ? {backgroundColor: '#E8EAED'}
                : {borderWidth: 3, borderColor: '#E8EAED'},
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
        <IconUpload
          height={20}
          width={20}
          color={Colors.black}
          style={{marginLeft: 5}}
        />
      </TouchableOpacity>
      <View style={styles.marginBottom}>
        <TouchableOpacity
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
    marginHorizontal: 5,
  },
  workContainer: {},
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    paddingVertical: 10,
  },
  item: {
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    borderRadius: 10,
    padding: 15,
  },
  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
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
    minWidth: 100,
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
  toggleRight: {
    borderTopStartRadius: 0,
    borderBottomStartRadius: 0,
    marginLeft: 0,
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
    borderRadius: 5,
    marginHorizontal: 10,
    paddingVertical: 10,
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
    marginHorizontal: 15,
    marginVertical: 3,
    padding: 15,
    borderRadius: 10,
  },
});

export default CreateClasswork;
