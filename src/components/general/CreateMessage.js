import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  BackHandler,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useHistory} from 'react-router';
import {AuthContext} from '../../context/AuthContext';
import IconGoBack from '../../../assets/goback.svg';
import IconSend from '../../../assets/send.svg';
import firestore from '@react-native-firebase/firestore';
import {ClassContext} from '../../context/ClassContext';

const CreateMessage = ({userInfo}) => {
  const history = useHistory();
  const {user} = useContext(AuthContext);
  const {classList, messageList, setMessageNumber} = useContext(ClassContext);
  const [associates, setAssociates] = useState([]);
  const [associatesCopy, setAssociatesCopy] = useState([]);
  const [recipient, setRecipient] = useState({});
  const [searchText, setSearchText] = useState('');
  const [text, setText] = useState('');
  useEffect(() => {
    if (classList.length > 0) {
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
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Messages');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);
  return (
    <>
      <ScrollView>
        <Header history={history} />

        <SearchComponent
          user={user}
          setAssociatesCopy={setAssociatesCopy}
          associates={associates}
          searchText={searchText}
          setSearchText={setSearchText}
        />
        {searchText === '' ? (
          <Reciever recipient={recipient} />
        ) : (
          <SearchResults
            userInfo={userInfo}
            messageList={messageList}
            associatesCopy={associatesCopy}
            setSearchText={setSearchText}
            setRecipient={setRecipient}
            setMessageNumber={setMessageNumber}
            history={history}
          />
        )}
      </ScrollView>
      <ChatBox
        text={text}
        setText={setText}
        recipient={recipient}
        userInfo={userInfo}
        history={history}
      />
    </>
  );
};
const ChatBox = ({text, setText, recipient, userInfo, history}) => {
  const handleSendMessage = () => {
    if (text === '') {
    } else if (Object.keys(recipient).length === 0) {
      alert('Please select a recipient of the message first');
    } else {
      const data = {
        [`${userInfo.id}`]: [
          {
            message: text,
            createdAt: firestore.Timestamp.fromDate(new Date()),
          },
        ],
        [`${recipient.id}`]: [],
      };
      const convoId = firestore().collection('messages').doc().id;
      const userConvoList = [convoId, ...userInfo.messages];
      firestore()
        .collection('messages')
        .doc(convoId)
        .set(data)
        .then(() => {
          firestore()
            .collection('users')
            .doc(userInfo.id)
            .update({messages: userConvoList})
            .then()
            .catch(e => alert(e.message, e.code));

          firestore()
            .collection('users')
            .doc(recipient.id)
            .get()
            .then(res => {
              const messages = res.data().messages ? res.data().messages : [];
              const recipientConvoList = [convoId, ...messages];
              firestore()
                .collection('users')
                .doc(recipient.id)
                .update({messages: recipientConvoList})
                .then(() => history.push('/Messages'))
                .catch(e => alert(e.message, e.code));
            })
            .catch(e => alert(e.message, e.code));
        })
        .catch(e => alert(e.message, e.code));
    }
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

const Reciever = ({recipient}) => {
  return (
    <View
      style={[
        styles.imageAndTextContainer,
        {
          marginHorizontal: 10,
          alignItems: 'center',
        },
      ]}>
      <Text style={styles.messageText}>To : </Text>
      <Image
        source={{
          uri: recipient.photoUrl ? recipient.photoUrl : 'recipient.photoUrl',
        }}
        style={[styles.profileImage, {height: 25, width: 25}]}
      />
      <Text style={styles.messageText}>
        {recipient.name ? recipient.name : 'Please select a recipient'}
      </Text>
    </View>
  );
};

const SearchResults = ({
  associatesCopy,
  userInfo,
  messageList,
  setSearchText,
  setRecipient,
  setMessageNumber,
  history,
}) => {
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
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageAndTextContainer}
                        onPress={() => {
                          for (const i in messageList) {
                            if (messageList[i].convoWith == student.id) {
                              setMessageNumber(i);
                              history.push('/ViewMessage');
                              break;
                            }
                          }
                          setSearchText('');
                          setRecipient(student);
                        }}>
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
                    return (
                      <TouchableOpacity
                        key={index}
                        style={styles.imageAndTextContainer}
                        onPress={() => {
                          for (const i in messageList) {
                            if (messageList[i].convoWith == teacher.id) {
                              setMessageNumber(i);
                              history.push('/ViewMessage');
                              break;
                            }
                          }
                          setSearchText('');
                          setRecipient(teacher);
                        }}>
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

const SearchComponent = ({
  setAssociatesCopy,
  associates,
  searchText,
  setSearchText,
  user,
}) => {
  return (
    <View style={styles.searchBarContainer}>
      <TextInput
        style={styles.searchBar}
        placeholder="Type a name or ID"
        value={searchText}
        onChangeText={text => {
          text = text.toLowerCase();
          setSearchText(text);
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

const Header = ({history}) => {
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>New message</Text>
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
const styles = StyleSheet.create({
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  headerText: {
    fontFamily: 'Lato-Regular',
    fontSize: 24,
    margin: 10,
    textAlignVertical: 'center',
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
  messageText: {
    fontFamily: 'Lato-Regular',
    fontSize: 18,
  },
  messageSubtitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  imageAndTextContainer: {flexDirection: 'row'},
  profileImage: {
    borderRadius: 50,
    height: 50,
    width: 50,
    margin: 10,
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
});
export default CreateMessage;
