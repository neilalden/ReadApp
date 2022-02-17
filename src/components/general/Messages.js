import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Alert,
  TextInput,
  FlatList,
  RefreshControl,
} from 'react-native';
import Nav from './Nav';
import {AuthContext} from '../../context/AuthContext';
import {
  ClassContext,
  fetchClassList,
  fetchMessages,
} from '../../context/ClassContext';
import IconWrite from '../../../assets/pencil-square.svg';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';

const Messages = ({userInfo, setUserInfo}) => {
  const {user} = useContext(AuthContext);
  const {
    classList,
    setClassList,
    messageList,
    setMessageList,
    setMessageNumber,
  } = useContext(ClassContext);
  const history = useHistory();
  const [associates, setAssociates] = useState([]);
  const [associatesCopy, setAssociatesCopy] = useState([]);
  const [text, setText] = useState('');
  useEffect(() => {
    if (!user) {
      history.push('/Login');
      setUserInfo({});
      setClassList([]);
    } else if (
      Object.keys(userInfo).length === 0 &&
      Object.keys(user).length !== 0
    ) {
      fetchUser(user.displayName);
    }
    if (classList.length > 0) {
      firestore()
        .collection('users')
        .doc(userInfo.id)
        .onSnapshot(snapshot => {
          if (snapshot == undefined) {
            return;
          }
          if (
            snapshot.data().messages &&
            userInfo.messages.length !== snapshot.data().messages.length
          ) {
            const new_userInfo = {
              classes: snapshot.data().classes,
              id: snapshot.data().id,
              isStudent: snapshot.data().isStudent,
              phoneNumber: snapshot.data().phoneNumber,
              name: snapshot.data().name,
              messages: snapshot.data().messages,
            };
            fetchClassList(new_userInfo, setClassList);
            setUserInfo(new_userInfo);
          }
          fetchMessages(userInfo, classList, setMessageList);
          for (const i in classList) {
            setAssociates(prev => [
              ...prev,
              {
                subject: classList[i].subject,
                teachers: classList[i].teachers,
                students: classList[i].students,
              },
            ]);
          }
        });
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  const fetchUser = id => {
    firestore()
      .collection('users')
      .doc(id)
      .get()
      .then(res => {
        if (!res.data()) {
          history.push('/Register');
        } else {
          setUserInfo({
            classes: res.data().classes,
            id: res.data().id,
            isStudent: res.data().isStudent,
            phoneNumber: res.data().phoneNumber,
            name: res.data().name,
            messages: res.data().messages ? res.data().messages : [],
          });
        }
      })
      .catch(e => alert(e.message, e.code));
  };
  if (Object.keys(userInfo).length === 0 || Object.keys(user).length === 0) {
    return <></>;
  }
  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <Header user={user} history={history} />
        <SearchComponent
          setAssociatesCopy={setAssociatesCopy}
          associates={associates}
          setText={setText}
          user={user}
        />
        {text !== '' ? (
          <SearchResults associatesCopy={associatesCopy} user={user} />
        ) : (
          <MessagesList
            messageList={messageList}
            setMessageNumber={setMessageNumber}
            classList={classList}
            history={history}
            user={user}
          />
        )}
      </ScrollView>
      <Nav />
    </>
  );
};

const MessagesList = ({
  messageList,
  setMessageNumber,
  classList,
  history,
  user,
}) => {
  return (
    <ScrollView>
      {messageList.length > 0 ? (
        messageList.map((message, index) => {
          return (
            <Message
              key={index}
              message={message}
              setMessageNumber={setMessageNumber}
              classList={classList}
              history={history}
              user={user}
              index={index}
            />
          );
        })
      ) : (
        <Text style={[styles.messageSubtitleText, {alignSelf: 'center'}]}>
          No Messages yet
        </Text>
      )}
    </ScrollView>
  );
};

const Message = ({
  message,
  setMessageNumber,
  classList,
  history,
  user,
  index,
}) => {
  const msg =
    message.messages[0].message.length > 25
      ? `${message.messages[0].message.substring(0, 25)}...`
      : message.messages[0].message;
  let dt = new Date(
    message.messages[0].createdAt.toDate
      ? message.messages[0].createdAt.toDate()
      : message.messages[0].createdAt.seconds * 1000,
  );
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  const hour = dt.getHours();
  const minute = dt.getMinutes();
  const ampm = hour > 12 ? 'pm' : 'am';
  let timeSent = '';
  const today = new Date();

  if (today.getFullYear() - year >= 1) {
    timeSent = `${MONTHS[month]} ${year}`;
  } else if (today.getDate() - day > 7) {
    timeSent = `${MONTHS[month]} ${day}`;
  } else if (today.getDate() - day > 0 && today.getDate() - day <= 7) {
    timeSent = WEEKDAYS[dt.getDay()];
  } else if (today.getDate() == day) {
    timeSent = `${hour > 12 ? hour - 12 : hour}:${minute} ${ampm}`;
  } else {
    timeSent = `${MONTHS[month]} ${day} ${year}`;
  }
  if (!message.sender) {
    return (
      <Text style={[styles.messageText, {textAlign: 'center'}]}>No user</Text>
    );
  }

  return (
    <TouchableOpacity
      style={styles.messageContainer}
      onPress={() => {
        setMessageNumber(index);
        history.push('/ViewMessage');
      }}>
      <View style={styles.imageAndTextContainer}>
        <Image
          style={styles.messageProfileImage}
          source={{
            uri: message.sender.photoUrl,
          }}
        />
        <View style={styles.nameAndMessageContainer}>
          <Text style={styles.messageText}>{message.sender.name}</Text>
          <Text style={styles.messageSubtitleText}>
            {message.messages[0].sender == message.sender.id
              ? msg
              : `You: ${msg}`}
          </Text>
        </View>
      </View>
      <View style={styles.messageTimeContainer}>
        <Text style={styles.messageSubtitleText}>{timeSent}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Header = ({user, history}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.imageAndTextContainer}>
        <Image
          style={styles.profileImage}
          source={{
            uri: user.photoURL,
          }}
        />
        <Text style={styles.headerText}>Messages</Text>
      </View>
      <TouchableOpacity
        style={styles.writeIconContainer}
        onPress={() => history.push('/CreateMessage')}>
        <IconWrite height={25} width={25} style={styles.writeIcon} />
      </TouchableOpacity>
    </View>
  );
};

const SearchResults = ({associatesCopy, user}) => {
  return (
    <ScrollView>
      {associatesCopy.length > 0 ? (
        associatesCopy.map((associate, index) => {
          return (
            <View key={index}>
              <Text
                style={[
                  styles.messageText,
                  {
                    backgroundColor: '#E8EAED',
                    paddingVertical: 5,
                    paddingHorizontal: 10,
                  },
                ]}>
                {associate.subject}
              </Text>
              {associate.students.length > 0 && (
                <ScrollView>
                  {associate.students.map((student, index) => {
                    if (student.id === user.displayName) return;
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageAndTextContainer}>
                        <Image
                          source={{uri: student.photoUrl}}
                          style={styles.profileImage}
                        />
                        <Text
                          style={[
                            styles.messageSubtitleText,
                            {alignSelf: 'center'},
                          ]}>
                          {student.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {associate.teachers.length > 0 && (
                <ScrollView>
                  {associate.teachers.map((teacher, index) => {
                    if (teacher.id === user.displayName) return;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageAndTextContainer}>
                        <Image
                          source={{uri: teacher.photoUrl}}
                          style={styles.profileImage}
                        />
                        <Text
                          style={[
                            styles.messageSubtitleText,
                            {alignSelf: 'center'},
                          ]}>
                          {teacher.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>
          );
        })
      ) : (
        <Text style={[styles.messageSubtitleText, {alignSelf: 'center'}]}>
          No name or ID matched
        </Text>
      )}
    </ScrollView>
  );
};
const SearchComponent = ({setAssociatesCopy, associates, setText, user}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Type a name or ID"
        onChangeText={text => {
          text = text.toLowerCase();
          setText(text);
          if (text === '') {
            setAssociatesCopy([]);
            return;
          }
          let associatesTemp = [];

          for (const i in associates) {
            const associatesClass = {
              subject: associates[i].subject,
              students: [],
              teachers: [],
            };

            for (const j in associates[i].students) {
              if (
                associates[i].students[j].id.toLowerCase().includes(text) ||
                associates[i].students[j].name.toLowerCase().includes(text)
              ) {
                if (associates[i].students[j].id !== user.displayName) {
                  associatesClass.students.push(associates[i].students[j]);
                }
              }
            }

            for (const j in associates[i].teachers) {
              if (
                associates[i].teachers[j].id.toLowerCase().includes(text) ||
                associates[i].teachers[j].name.toLowerCase().includes(text)
              ) {
                if (associates[i].teachers[j].id !== user.displayName) {
                  associatesClass.teachers.push(associates[i].teachers[j]);
                }
              }
            }

            if (
              associatesClass.students.length > 0 ||
              associatesClass.teachers.length > 0
            ) {
              associatesTemp.push(associatesClass);
            }
          }
          setAssociatesCopy(associatesTemp);
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  imageAndTextContainer: {flexDirection: 'row'},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Lato-Regular',
    fontSize: 24,
    textAlignVertical: 'center',
  },
  profileImage: {
    borderRadius: 50,
    height: 50,
    width: 50,
    margin: 10,
  },
  writeIconContainer: {
    backgroundColor: '#ADD8E6',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    height: 40,
    width: 40,
    margin: 10,
  },
  writeIcon: {
    color: '#FFF',
    alignSelf: 'center',
  },
  searchBar: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    marginLeft: 10,
  },
  searchBarContainer: {
    width: '95%',
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: '#E8EAED',
    borderRadius: 50,
    padding: 5,
    alignSelf: 'center',
  },
  messageProfileImage: {
    borderRadius: 50,
    height: 50,
    width: 50,
    margin: 10,
    marginLeft: 0,
  },
  messageContainer: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    paddingVertical: 5,
    marginHorizontal: 10,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameAndMessageContainer: {
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  messageText: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
  },
  messageSubtitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  messageTimeContainer: {
    alignSelf: 'center',
    margin: 10,
  },
  seenMessageText: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    fontWeight: 'bold',
  },
  seenMessageSubtitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
const alert = (msg, title) => {
  if (title === 'Exit?') {
    Alert.alert(title, `${msg ? msg : 'Fill up the form properly'}`, [
      {text: 'Yes', onPress: () => BackHandler.exitApp()},
      {
        text: 'No',
        onPress: () => {
          true;
        },
      },
    ]);
  } else {
    Alert.alert(title, msg, [{text: 'OK', onPress: () => true}]);
  }
};

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'June',
  'July',
  'Aug',
  'Sept',
  'Oct',
  'Nov',
  'Dec',
];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default Messages;
