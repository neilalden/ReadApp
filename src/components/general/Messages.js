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
  const [messageListCopy, setMessageListCopy] = useState([]);
  const [text, setText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
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
            fetchClassList(snapshot.data(), setClassList);
            setUserInfo(snapshot.data());
          }
          fetchMessages(userInfo, classList, setMessageList);
        });
    }

    BackHandler.addEventListener('hardwareBackPress', () => {
      alert('Do you want to leave?', 'Exit?');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  useEffect(() => {
    if (messageList.length > 0 && messageListCopy.length == 0 && text == '') {
      setMessageListCopy(messageList);
    }
  }, [messageList]);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUser(user.displayName);
    setMessageList([]);
    wait(1000).then(() => {
      fetchMessages(userInfo, classList, setMessageList);
      setRefreshing(false);
    });
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  const fetchUser = id => {
    firestore()
      .collection('users')
      .doc(id)
      .get()
      .then(res => {
        if (!res.data()) {
          history.push('/Register');
        } else {
          setUserInfo(res.data());
        }
      })
      .catch(e => alert(e.message, e.code));
  };
  if (Object.keys(userInfo).length === 0 || Object.keys(user).length === 0) {
    return <></>;
  }
  return (
    <>
      <ScrollView
        style={{backgroundColor: '#fff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Header user={user} history={history} />
        <SearchComponent
          user={user}
          setText={setText}
          messageList={messageList}
          messageListCopy={messageListCopy}
          setMessageListCopy={setMessageListCopy}
        />
        <MessagesList
          user={user}
          messageListCopy={messageListCopy}
          setMessageNumber={setMessageNumber}
          classList={classList}
          history={history}
        />
      </ScrollView>
      <Nav />
    </>
  );
};

const MessagesList = ({
  messageListCopy,
  setMessageNumber,
  classList,
  history,
  user,
}) => {
  return (
    <ScrollView>
      {messageListCopy.length > 0 ? (
        messageListCopy.map((message, index) => {
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
          No Messages
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
    timeSent = `${WEEKDAYS[dt.getDay()]}\n${
      hour > 12 ? hour - 12 : hour
    }:${minute} ${ampm}`;
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

const SearchComponent = ({
  user,
  messageList,
  setText,
  messageListCopy,
  setMessageListCopy,
}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Type a name or ID"
        onChangeText={text => {
          text = text.toLowerCase();
          setText(text);
          if (text == '') {
            setMessageListCopy(messageList);
            return;
          }

          setMessageListCopy(messageList);
          setMessageListCopy(prev =>
            prev.filter(convo => {
              let isTrue = convo.convoWith.toLowerCase().includes(text);
              if (!isTrue) {
                isTrue = convo.sender.name.toLowerCase().includes(text);
              }
              return isTrue;
            }),
          );
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
