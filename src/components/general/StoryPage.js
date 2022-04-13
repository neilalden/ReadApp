import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Image,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Video from 'react-native-video';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {useHistory} from 'react-router';

const StoryPage = ({stories, userInfo, setUserInfo}) => {
  const [story, setStory] = useState({});
  const [storyKeys, setStoryKeys] = useState([]);
  const [total, setTotal] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [hasTaken, setHasTaken] = useState(false);
  const [rand, setRand] = useState(1);
  const [url, setUrl] = useState('');
  let history = useHistory();
  useEffect(() => {
    setRand(Math.floor(Math.random() * 3 + 1));
    let keys = Object.keys(stories);
    for (const i in keys) {
      if (keys[i] == 'id') {
        keys.splice(i, 1);
        break;
      }
    }
    setStoryKeys(keys);
    let storiesCopy = {...stories[keys[current]]};
    const quiz = [...storiesCopy['quiz']];
    for (const i in quiz) {
      let willShuffle = true;
      for (const j in quiz[i].options) {
        if (quiz[i].options[j] == quiz[i].answer) {
          willShuffle = false;
          break;
        }
      }
      let options = quiz[i].options;
      if (willShuffle) {
        options = quiz[i].options
          ? [...quiz[i].options, quiz[i].answer]
          : undefined;
      }
      if (options) options.sort(() => Math.random() - 0.5);
      quiz[i].options = options;
    }
    storiesCopy['quiz'] = quiz;
    let temp = 0;
    for (const i in keys) {
      if (keys[i] !== 'order') temp += stories[keys[i]].quiz.length;
    }
    setTotal(temp);
    if (userInfo[stories.id]) setScore(userInfo[stories.id].score);
    setStory(storiesCopy);
    firestore()
      .collection('users')
      .doc(userInfo.id)
      .get()
      .then(doc => {
        if (!doc.data()[stories.id]) return;
        setHasTaken(true);
        setUserAnswers(doc.data()[stories.id].userAnswers);
      })
      .catch(e => alert(`${e}`));

    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  const scrollRef = useRef();

  const scrollUp = () => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  };
  if (!story || !story.directions) return <></>;
  return (
    <>
      <ScrollView ref={scrollRef}>
        {story.directions && (
          <Directions
            directions={story.directions}
            rand={rand}
            hasTaken={hasTaken}
            score={score}
            total={total}
          />
        )}
        {story.story ? (
          <VideoStory story={story.story} url={url} setUrl={setUrl} />
        ) : (
          <WrittenStory
            content={story.story_content}
            title={story.story_title}
          />
        )}
        <Quiz
          quiz={story.quiz}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          userAnswers={userAnswers}
          hasTaken={hasTaken}
        />
        {current !== 0 && (
          <PrevButton
            stories={stories}
            current={current}
            setCurrent={setCurrent}
            storyKeys={storyKeys}
            setStory={setStory}
            scrollUp={scrollUp}
          />
        )}
        {(!hasTaken || stories.id == 'Pre-test') && (
          <NextButton
            userInfo={userInfo}
            stories={stories}
            scrollUp={scrollUp}
            current={current}
            setCurrent={setCurrent}
            storyKeys={storyKeys}
            setStory={setStory}
            userAnswers={userAnswers}
            hasTaken={hasTaken}
            setHasTaken={setHasTaken}
            setRand={setRand}
            setScore={setScore}
          />
        )}
      </ScrollView>
    </>
  );
};
const Quiz = ({quiz, userAnswers, setUserAnswers, hasTaken}) => {
  if (hasTaken) {
    return (
      <ScrollView>
        {quiz.map((quizItem, quizIndex) => {
          return (
            <View key={quizIndex} style={styles.questionContainer}>
              {quizItem.underline ? (
                <Text style={styles.header}>
                  {quizItem.question}
                  &nbsp;
                  <Text style={{textDecorationLine: 'underline'}}>
                    {quizItem.underline}
                  </Text>
                  &nbsp;
                  {quizItem.question1}
                </Text>
              ) : (
                <Text style={styles.header}>{quizItem.question}</Text>
              )}
              <View>
                <Text
                  style={[
                    styles.item,
                    {
                      fontSize: 15,
                      marginHorizontal: 15,
                      padding: 20,
                      textAlign: 'center',
                    },
                    quizItem['answer'] == userAnswers[quizItem.question]
                      ? {backgroundColor: 'forestgreen'}
                      : {backgroundColor: 'crimson'},
                  ]}>
                  {userAnswers[quizItem.question]}
                </Text>
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  } else {
    return (
      <ScrollView>
        {quiz.map((quizItem, quizIndex) => {
          return (
            <View key={quizIndex} style={styles.questionContainer}>
              {quizItem.underline ? (
                <Text style={styles.header}>
                  {quizItem.question}
                  &nbsp;
                  <Text style={{textDecorationLine: 'underline'}}>
                    {quizItem.underline}
                  </Text>
                  &nbsp;
                  {quizItem.question1}
                </Text>
              ) : (
                <Text style={styles.header}>{quizItem.question}</Text>
              )}
              {quizItem.options ? (
                <View style={styles.optionsContainer}>
                  {quizItem.options.map((option, optionIndex) => {
                    return (
                      <TouchableOpacity
                        key={optionIndex}
                        disabled={hasTaken}
                        style={[
                          styles.item,
                          {
                            backgroundColor: '#E8EAED',
                            marginHorizontal: 15,
                            fontSize: 15,
                          },
                          userAnswers[quizItem.question] &&
                            userAnswers[quizItem.question] == option && {
                              borderColor: '#3ca1c3',
                              borderWidth: 3,
                              padding: 12,
                            },
                        ]}
                        onPress={() => {
                          handleAnswer(
                            userAnswers,
                            setUserAnswers,
                            option,
                            quizItem.question,
                          );
                        }}>
                        <Text style={[styles.itemText, {textAlign: 'center'}]}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  placeholder="Write your answers here.."
                  editable={!hasTaken}
                  multiline={true}
                  style={styles.textBox}
                  value={userAnswers[quizItem.question]}
                  onChangeText={text => {
                    handleAnswer(
                      userAnswers,
                      setUserAnswers,
                      text,
                      quizItem.question,
                    );
                  }}
                />
              )}
            </View>
          );
        })}
      </ScrollView>
    );
  }
};

const Directions = ({directions, rand, hasTaken, score, total}) => {
  if (directions.length <= 300) {
    return (
      <View style={[styles.item, {minHeight: 130}]}>
        <Image
          style={styles.imageHeader}
          source={{uri: `asset:/image_headers/teacher${rand}.png`}}
        />
        <Text
          style={[
            styles.itemText,
            {
              fontWeight: 'bold',
              textAlign: 'justify',
              paddingLeft: 70,
              flex: 1,
              textAlignVertical: 'center',
            },
          ]}>
          {directions}
        </Text>
        {hasTaken && (
          <Text style={[styles.itemText, {color: '#000'}]}>
            Score : {`${score}/${total}`}
          </Text>
        )}
      </View>
    );
  } else {
    let cutIndex = 265;
    for (let i = 260; i <= 270; i++) {
      if (directions[i] == ' ' || directions[i] == '-') cutIndex = i + 1;
    }
    return (
      <View style={[styles.item, {minHeight: 130}]}>
        <View style={{flexDirection: 'row', width: '100%'}}>
          <Image
            style={{
              resizeMode: 'center',
              height: 120,
              width: 79,
              marginTop: 10,
            }}
            source={{uri: `asset:/image_headers/teacher${rand}.png`}}
          />
          <Text
            style={[
              styles.itemText,
              {fontWeight: 'bold', textAlign: 'justify', flex: 1},
            ]}>
            {directions.substring(0, cutIndex)}
          </Text>
        </View>
        <Text
          style={[
            styles.itemText,
            {
              fontWeight: 'bold',
              textAlign: 'justify',
              flex: 1,
              marginBottom: 5,
            },
          ]}>
          {directions.substring(cutIndex, directions.length)}
        </Text>
        {hasTaken && (
          <Text style={[styles.itemText, {color: '#000'}]}>
            Score : {`${score}/${total}`}
          </Text>
        )}
      </View>
    );
  }
};
const WrittenStory = ({content, title}) => {
  return (
    <View style={styles.item}>
      <Text style={styles.header}>{title}</Text>
      <Text />
      <Text style={(styles.itemText, {textAlign: 'center'})}>
        {content.replace('  ', '\n')}
      </Text>
    </View>
  );
};
const VideoStory = ({story, url, setUrl}) => {
  try {
    ToastAndroid.showWithGravity(
      'Loading video...',
      ToastAndroid.SHORT,
      ToastAndroid.CENTER,
    );
    storage()
      .ref(story)
      .getDownloadURL()
      .then(link => {
        setUrl(link);
      })
      .catch(e => alert(e.message, e.code));
  } catch (e) {
    alert(`${e}`, 'Alert');
  }
  return (
    <Video
      source={{
        uri: url,
      }} // Can be a URL or a local file.
      // Store reference
      // onBuffer={this.onBuffer} // Callback when remote video is buffering
      // onError={this.videoError} // Callback when video cannot be loaded
      style={{
        aspectRatio: 3.5 / 2,
        width: '95%',
        position: 'relative',
        alignSelf: 'center',
        borderRadius: 15,
      }}
      resizeMode={'contain'}
      controls={true}
    />
  );
};
const NextButton = ({
  stories,
  current,
  setCurrent,
  storyKeys,
  setStory,
  scrollUp,
  userAnswers,
  userInfo,
  hasTaken,
  setHasTaken,
  setRand,
  setScore,
}) => {
  const endOfQuiz = storyKeys.length - 2 == current;
  if (hasTaken && endOfQuiz) return <></>;
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        if (!endOfQuiz) {
          setCurrent(current + 1);
          let storiesCopy = {...stories[storyKeys[current + 1]]};
          const quiz = [...storiesCopy['quiz']];
          for (const i in quiz) {
            let skip = true;
            for (const j in quiz[i].options) {
              if (quiz[i].options[j] == quiz[i].answer) skip = false;
            }
            if (skip) {
              let options = quiz[i].options
                ? [...quiz[i].options, quiz[i].answer]
                : undefined;
              if (options) options.sort(() => Math.random() - 0.5);
              quiz[i].options = options;
            }
          }
          storiesCopy['quiz'] = quiz;
          setStory(storiesCopy);
          scrollUp();
          setRand(Math.floor(Math.random() * 3 + 1));
        } else {
          let quizes = 0;
          for (const i in storyKeys) {
            const quiz = stories[storyKeys[i]].quiz;
            for (const j in quiz) {
              quizes += 1;
            }
          }
          if (!userAnswers || Object.keys(userAnswers).length !== quizes) {
            alert('Please answer every question');
            return;
          }
          let score = 0;
          for (const i in storyKeys) {
            const quiz = stories[storyKeys[i]].quiz;
            for (const j in quiz) {
              if (
                userAnswers[quiz[j].question].toLowerCase() ==
                quiz[j].answer.toLowerCase()
              ) {
                score += 1;
              }
            }
          }
          setScore(score);
          firestore()
            .collection('users')
            .doc(userInfo.id)
            .update({[stories.id]: {score: score, userAnswers}})
            .then(() => {
              setHasTaken(true);
            })
            .catch(e => alert(`${e}`));
        }
      }}>
      <Text style={styles.buttonText}>{endOfQuiz ? 'Submit' : 'Next'}</Text>
    </TouchableOpacity>
  );
};
const PrevButton = ({
  stories,
  current,
  setCurrent,
  storyKeys,
  setStory,
  scrollUp,
}) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        setCurrent(current - 1);
        let storiesCopy = {...stories[storyKeys[current - 1]]};
        setStory(storiesCopy);
        scrollUp();
      }}>
      <Text style={styles.buttonText}>Previous</Text>
    </TouchableOpacity>
  );
};
const handleAnswer = (userAnswers, setUserAnswers, value, index) => {
  let copyOfUserAnswers = {...userAnswers};
  copyOfUserAnswers[index] = value;
  setUserAnswers(copyOfUserAnswers);
};
const styles = StyleSheet.create({
  imageHeader: {
    resizeMode: 'center',
    position: 'absolute',
    right: 255,
    height: 120,
    width: 79,
  },
  item: {
    minHeight: 60,
    marginHorizontal: 10,
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    alignItems: 'center', //vertical align text center
    justifyContent: 'center',
  },
  itemText: {
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    // textAlign: 'justify',
  },
  button: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 20,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Lato-Regular',
    alignSelf: 'center',
  },
  header: {
    fontSize: 18,
    fontFamily: 'Lato-Regular',
    marginHorizontal: 15,
    marginVertical: 3,
    padding: 3,
    flex: 1,
    textAlign: 'justify',
  },
  questionContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
  textBox: {
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
  // backgroundVideo: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   bottom: 0,
  //   right: 0,
  // },
});
export default StoryPage;
