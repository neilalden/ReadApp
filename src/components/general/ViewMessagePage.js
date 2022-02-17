import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  BackHandler,
} from 'react-native';
import {AuthContext} from '../../context/AuthContext';
import IconGoBack from '../../../assets/goback.svg';
import IconSend from '../../../assets/send.svg';
import firestore from '@react-native-firebase/firestore';
import {useHistory} from 'react-router';
import {ClassContext, fetchMessages} from '../../context/ClassContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
const ViewMessagePage = ({userInfo}) => {
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const [senderProfile, setSenderProfile] = useState({});
  const [text, setText] = useState('');
  const {classList, messageList, setMessageList, messageNumber} =
    useContext(ClassContext);
  useEffect(() => {
    for (const i in messageList[messageNumber].messages) {
      if (
        messageList[messageNumber].sender.id &&
        messageList[messageNumber].sender.id !== user.displayname
      ) {
        setSenderProfile(messageList[messageNumber].sender);
        break;
      }
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Messages');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  const renderItem = ({item, index}) => {
    if (item == null || item.message == null) return;
    const messages = messageList[messageNumber].messages;
    let dt = new Date(
      item.createdAt.toDate
        ? item.createdAt.toDate()
        : item.createdAt.seconds * 1000,
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
    return (
      <View>
        <View
          key={index}
          style={[
            item.sender == user.displayName
              ? styles.messageIsFromUser
              : styles.messageIsNotFromUser,
            messages[index - 1] &&
              messages[index - 1].sender == item.sender && {marginVertical: 0},
            messages[index + 1] &&
              messages[index + 1].sender == item.sender && {
                marginVertical: 1,
              },
          ]}>
          <Text
            style={{
              textAlign: 'left',
              fontFamily: 'Lato-Regular',
              fontSize: 16,
              margin: 10,
            }}>
            {item.message}
          </Text>
        </View>
        <Text
          style={[
            {
              marginHorizontal: 10,
              fontSize: 9,
              marginVertical: 0,
              paddingVertical: 0,
            },
            item.sender == user.displayName
              ? {
                  alignSelf: 'flex-end',
                }
              : {alignSelf: 'flex-start'},
          ]}>
          {timeSent}
        </Text>
      </View>
    );
  };
  return (
    <>
      <Header history={history} senderProfile={senderProfile} />
      <SafeAreaView style={styles.container}>
        <FlatList
          data={messageList[messageNumber].messages}
          renderItem={renderItem}
          keyExtractor={item => item.message}
          inverted={true}
        />
      </SafeAreaView>
      <ChatBox
        text={text}
        setText={setText}
        classList={classList}
        messageList={messageList}
        setMessageList={setMessageList}
        messageNumber={messageNumber}
        userInfo={userInfo}
      />
    </>
  );
};
const ChatBox = ({
  text,
  setText,
  classList,
  messageList,
  setMessageList,
  messageNumber,
  userInfo,
}) => {
  const handleSendMessage = () => {
    if (text === '') {
      return;
    }
    firestore()
      .collection('messages')
      .doc(messageList[messageNumber].convoId)
      .get()
      .then(res => {
        const data = {
          [`${userInfo.id}`]: [
            {
              message: text,
              createdAt: firestore.Timestamp.fromDate(new Date()),
            },
            ...res.data()[userInfo.id],
          ],
        };
        firestore()
          .collection('messages')
          .doc(messageList[messageNumber].convoId)
          .update(data)
          .then(() => {
            fetchMessages(userInfo, classList, setMessageList);
            // let copy = [...messageList];
            // copy[messageNumber].messages =
            //   copy[messageNumber].messages.unshift(data);
            // setMessageList(copy);
            setText('');
          })
          .catch(e => alert(e.message, e.code));
      })
      .catch(e => alert(e.message, e.code));
  };
  return (
    <View style={styles.sendContainer}>
      <TextInput
        style={styles.cardTextInput}
        placeholder="Aa"
        multiline={true}
        value={text}
        onChangeText={text => setText(text)}
      />
      <TouchableOpacity
        style={styles.cardSendIconContainer}
        onPress={handleSendMessage}>
        <IconSend height={20} width={20} style={styles.cardSendIcon} />
      </TouchableOpacity>
    </View>
  );
};
const Header = ({senderProfile, history}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.imageAndTextContainer}>
        <Image
          style={styles.profileImage}
          source={{
            uri: senderProfile.photoUrl,
          }}
        />
        <Text style={styles.headerText}>{senderProfile.name}</Text>
      </View>
      <TouchableOpacity
        style={styles.writeIconContainer}
        onPress={() => {
          history.push('./Messages');
        }}>
        <IconGoBack height={30} width={30} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};
const getData = async (messageList, messageNumber, setMessageList) => {
  const key = messageList[messageNumber].convoId;
  AsyncStorage.getItem(key)
    .then(jsonValue => {
      const val = JSON.parse(jsonValue);
      let copy = [...messageList];
      copy[messageNumber].messages = val
        ? val[key].messages
        : copy[messageNumber].messages;
      setMessageList(copy);
    })
    .catch(e => alert(e.message));
};
const styles = StyleSheet.create({
  imageAndTextContainer: {flexDirection: 'row'},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
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
  backIcon: {
    color: '#FFF',
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    marginTop: 0,
  },
  searchBar: {
    fontSize: 16,
    fontFamily: 'Lato-Regular',
    marginLeft: 10,
  },
  searchBarContainer: {
    width: '90%',
    marginTop: 5,
    marginBottom: 20,
    backgroundColor: '#E8EAED',
    borderRadius: 50,
    padding: 5,
    alignSelf: 'center',
  },
  cardSendIconContainer: {
    backgroundColor: '#ADD8E6',
    width: '11%',
    borderRadius: 50,
    marginEnd: 4,
    marginBottom: 8.5,
    height: 30,
    width: 30,
    alignSelf: 'flex-end',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  cardSendIcon: {
    color: '#E8EAED',
    marginLeft: 3.75,
    marginTop: 1.75,
  },
  cardTextInput: {
    fontFamily: 'Lato-Regular',
    width: '85%',
    fontSize: 16,
    margin: 2,
  },
  sendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    margin: 10,
    borderRadius: 10,
  },
  messageIsFromUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#E8EAED',
    maxWidth: '70%',
    marginHorizontal: 10,
    marginVertical: 0,
    borderRadius: 10,
    borderBottomRightRadius: 0,
  },
  messageIsNotFromUser: {
    alignSelf: 'flex-start',
    backgroundColor: '#ADD8E6',
    maxWidth: '70%',
    marginHorizontal: 10,
    marginVertical: 0,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
  },
});

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
export default ViewMessagePage;
