import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import Orientation from 'react-native-orientation';
import Video from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Day1 from '../../materials/DAY1.mp4';
import Day2 from '../../materials/DAY2.mp4';
import Day3 from '../../materials/DAY3.mp4';
import Day4 from '../../materials/DAY4.mp4';
import Day5 from '../../materials/DAY5.mp4';
import Day6 from '../../materials/DAY6.mp4';
import Day7 from '../../materials/DAY7.mp4';
import Day8 from '../../materials/DAY8.mp4';
import Day9 from '../../materials/DAY9.mp4';
import Day10 from '../../materials/DAY10.mp4';
import Day11 from '../../materials/DAY11.mp4';
import Day12 from '../../materials/DAY12.mp4';
import Day13 from '../../materials/DAY13.mp4';
import Day14 from '../../materials/DAY14.mp4';
import Day15 from '../../materials/DAY15.mp4';
import Day16 from '../../materials/DAY16.mp4';
import Day17 from '../../materials/DAY17.mp4';
import Day18 from '../../materials/DAY18.mp4';
import Day19 from '../../materials/DAY19.mp4';
import Day20 from '../../materials/DAY20.mp4';

const StoryPage = ({stories, userInfo, setUserInfo}) => {
  const [story, setStory] = useState({});
  const [storyKeys, setStoryKeys] = useState([]);
  const [total, setTotal] = useState(0);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [hasTaken, setHasTaken] = useState(false);
  const [rand, setRand] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
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
    if (Object.keys(userInfo).length == 0) return;
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
      Orientation.lockToPortrait();
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
  if (!story || !story.quiz)
    return (
      <Text style={[styles.itemText, {textAlign: 'center'}]}>Loading</Text>
    );
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
        {!!story.story_content && (
          <WrittenStory
            content={story.story_content}
            title={story.story_title}
          />
        )}

        {story.story && (
          <VideoStory
            story={story.story}
            storyBy={story.storyBy}
            fullscreen={fullscreen}
            setFullscreen={setFullscreen}
          />
        )}
        <Quiz
          quiz={story.quiz}
          userAnswers={userAnswers}
          setUserAnswers={setUserAnswers}
          userAnswers={userAnswers}
          hasTaken={hasTaken}
          fullscreen={fullscreen}
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
            history={history}
            userInfo={userInfo}
            setUserInfo={setUserInfo}
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
        {storyKeys.length - 2 == current && (
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              history.push('/');
              Orientation.lockToPortrait();
            }}>
            <Text>Exit</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </>
  );
};
const Quiz = ({quiz, userAnswers, setUserAnswers, hasTaken, fullscreen}) => {
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
const VideoStory = ({story, storyBy, fullscreen, setFullscreen}) => {
  const templates = {
    Day1,
    Day2,
    Day3,
    Day4,
    Day5,
    Day6,
    Day7,
    Day8,
    Day9,
    Day10,
    Day11,
    Day12,
    Day13,
    Day14,
    Day15,
    Day16,
    Day17,
    Day18,
    Day19,
    Day20,
  };
  function getTemplate(name) {
    return templates[name];
  }
  return (
    <View>
      <VideoPlayer
        source={getTemplate(story)}
        disableBack={true}
        disableVolume={true}
        onEnterFullscreen={() => {
          Orientation.lockToLandscape();
          setFullscreen(true);
        }}
        onExitFullscreen={() => {
          Orientation.lockToPortrait();
          setFullscreen(false);
        }}
        style={[
          fullscreen
            ? {
                width: Dimensions.get('window').height,
                height: Dimensions.get('window').width - 25,
                alignSelf: 'center',
              }
            : styles.video,
        ]}
      />
      {storyBy && (
        <Text style={[styles.buttonText, {marginHorizontal: 10}]}>
          Story by {storyBy}
        </Text>
      )}
    </View>
  );
};
const NextButton = ({
  history,
  stories,
  current,
  setCurrent,
  storyKeys,
  setStory,
  scrollUp,
  userAnswers,
  userInfo,
  setUserInfo,
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

          NetInfo.fetch().then(state => {
            if (!state.isConnected) {
              storeData(stories.id, {
                [stories.id]: {score: score, userAnswers},
              });
            } else {
              firestore()
                .collection('users')
                .doc(userInfo.id)
                .update({[stories.id]: {score: score, userAnswers}})
                .then(() => {
                  setUserInfo({});
                  history.push('/');
                  setHasTaken(true);
                })
                .catch(e => alert(`${e}`));
            }
          });
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
const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    console.log('saving log', jsonValue);
  } catch (e) {
    alert(e.message, 'storeData');
  }
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
    height: 120,
    width: 79,
    left: 10,
    alignSelf: 'flex-start',
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
    textAlign: 'center',
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
  video: {
    aspectRatio: 3.5 / 2,
    width: '95%',
    position: 'relative',
    alignSelf: 'center',
    borderRadius: 15,
    marginTop: 10,
    transform: [{rotate: '0deg'}],
  },
  videoFullscreen: {
    width: Dimensions.get('window').height,
    height: Dimensions.get('window').width - 15,
    alignSelf: 'center',
  },
});
export default StoryPage;
