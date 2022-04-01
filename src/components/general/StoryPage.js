import React, {useEffect, useRef, useState} from 'react';
import {
  BackHandler,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';

const StoryPage = ({stories, userInfo}) => {
  const [story, setStory] = useState({});
  const [storyKeys, setStoryKeys] = useState([]);
  const [current, setCurrent] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [hasTaken, setHasTaken] = useState(false);
  const [rand, setRand] = useState(1);
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
      let options = quiz[i].options
        ? [...quiz[i].options, quiz[i].answer]
        : undefined;
      if (options) options.sort(() => Math.random() - 0.5);
      quiz[i].options = options;
    }
    storiesCopy['quiz'] = quiz;
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
          <Directions directions={story.directions} rand={rand} />
        )}
        {(story.story_content || story.story_title) && (
          <Story content={story.story_content} title={story.story_title} />
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
        <NextButton
          stories={stories}
          current={current}
          setCurrent={setCurrent}
          storyKeys={storyKeys}
          setStory={setStory}
          scrollUp={scrollUp}
          userAnswers={userAnswers}
          userInfo={userInfo}
          setHasTaken={setHasTaken}
          setRand={setRand}
        />
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
                        <Text>{option}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <TextInput
                  placeholder="Write your answers here.."
                  editable={hasTaken}
                  style={styles.item}
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

const Directions = ({directions, rand}) => {
  return (
    <View style={[styles.item, {flexDirection: 'row', minHeight: 130}]}>
      <Image
        style={styles.imageHeader}
        source={{uri: `asset:/image_headers/teacher${rand}.png`}}
      />
      <Text
        style={
          (styles.itemText,
          {fontWeight: 'bold', textAlign: 'justify', paddingLeft: 70})
        }>
        {directions}
      </Text>
    </View>
  );
};
const Story = ({content, title}) => {
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
const NextButton = ({
  stories,
  current,
  setCurrent,
  storyKeys,
  setStory,
  scrollUp,
  userAnswers,
  userInfo,
  setHasTaken,
  setRand,
}) => {
  const endOfDay = storyKeys.length - 1 == current;
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => {
        if (!endOfDay) {
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
      <Text style={styles.buttonText}>{endOfDay ? 'Submit' : 'Next'}</Text>
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
    height: 120,
    width: 120,
    position: 'absolute',
    right: 240,
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
  },
  questionContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginHorizontal: 10,
    marginVertical: 5,
    paddingVertical: 10,
  },
});
export default StoryPage;
