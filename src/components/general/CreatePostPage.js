import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  BackHandler,
  Alert,
  PermissionsAndroid,
  Platform,
  ToastAndroid,
} from 'react-native';
import {useHistory} from 'react-router';
import {ClassContext, createPost} from '../../context/ClassContext';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import DocumentPicker from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';

import IconGoBack from '../../../assets/goback.svg';
import IconUpload from '../../../assets/uploadFile.svg';
import IconRemove from '../../../assets/x-circle.svg';

const CreatePostPage = ({userInfo}) => {
  /***STATES***/

  const {classList, setClassList, classNumber} = useContext(ClassContext);
  const history = useHistory();
  const [postText, setPostText] = useState('');
  const [postFiles, setPostFiles] = useState([]);
  const [isPosting, setIsPosting] = useState(false);

  /***HOOKS***/
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/Feed');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  return (
    <ScrollView style={{backgroundColor: '#fff'}}>
      <Segment history={history} />
      <PostTextCard postText={postText} setPostText={setPostText} />
      <FilesContainer postFiles={postFiles} setPostFiles={setPostFiles} />
      <Reminder />
      <UploadFileButton setPostFiles={setPostFiles} />
      <PostButton
        userInfo={userInfo}
        postText={postText}
        setPostText={setPostText}
        postFiles={postFiles}
        setPostFiles={setPostFiles}
        classList={classList}
        setClassList={setClassList}
        classNumber={classNumber}
        isPosting={isPosting}
        setIsPosting={setIsPosting}
      />
    </ScrollView>
  );
};

/***COMPONENTS***/

const PostButton = ({
  userInfo,
  postText,
  setPostText,
  postFiles,
  setPostFiles,
  classList,
  setClassList,
  classNumber,
  isPosting,
  setIsPosting,
}) => {
  const data = {
    author: userInfo.id,
    body: postText,
    files: postFiles,
    createdAt: firestore.Timestamp.fromDate(new Date()),
    comments: [],
  };
  return (
    <TouchableOpacity
      style={styles.submitButton}
      disabled={isPosting}
      onPress={() => {
        validatePost(
          data,
          classList,
          classNumber,
          setPostText,
          setPostFiles,
          setClassList,
          setIsPosting,
        );
      }}>
      <Text>Post</Text>
    </TouchableOpacity>
  );
};

const UploadFileButton = ({setPostFiles}) => {
  return (
    <TouchableOpacity
      onPress={() => {
        openFile(setPostFiles);
      }}
      style={[styles.submitButton, styles.uploadFile]}>
      <Text>Upload file</Text>
      <IconUpload style={styles.icon} />
    </TouchableOpacity>
  );
};

const Reminder = () => {
  return (
    <Text style={styles.subtitle}>
      Reminder: Most devices only support images, videos, text, and PDF files.
      Any other file types would require people to have the neccesarry
      application to open them
    </Text>
  );
};

const FileCard = ({index, file, postFiles, setPostFiles}) => {
  return (
    <TouchableOpacity
      style={styles.fileCard}
      onPress={() => {
        let copyPostFiles = [...postFiles];
        copyPostFiles.splice(index, 1);
        setPostFiles(copyPostFiles);
      }}>
      <Text>{file.fileName}</Text>
      <IconRemove style={styles.iconRemove} />
    </TouchableOpacity>
  );
};

const FilesContainer = ({postFiles, setPostFiles}) => {
  return (
    <View style={styles.filesCardContainer}>
      {postFiles.map((file, index) => (
        <FileCard
          index={index}
          file={file}
          postFiles={postFiles}
          setPostFiles={setPostFiles}
          key={index}
        />
      ))}
    </View>
  );
};

const PostTextCard = ({postText, setPostText}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.header}>Write a post</Text>
      <TextInput
        placeholder="Hello world!"
        multiline={true}
        style={styles.item}
        value={postText}
        onChangeText={text => setPostText(text)}
      />
    </View>
  );
};

const Segment = ({history}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.back}
        onPress={() => {
          history.push('/Feed');
        }}>
        <IconGoBack height={30} width={30} style={styles.goback} />
      </TouchableOpacity>
    </View>
  );
};

/***FUNCTIONS***/
const validatePost = async (
  data,
  classList,
  classNumber,
  setPostText,
  setPostFiles,
  setClassList,
  setIsPosting,
) => {
  const classId = classList[classNumber].classId;
  const filePath = `${classId}/posts/`;

  if (data.body === '' && data.files.length === 0) {
    alert('nothing to post', 'please write or upload anything');
  } else {
    ToastAndroid.show('Posting...', ToastAndroid.SHORT);
    setIsPosting(true);
    let files = data.files;
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
              data.files = urls;
              createPost(data, classList, classNumber);

              let copyClassList = [...classList];
              if (copyClassList[classNumber].posts !== undefined) {
                copyClassList[classNumber].posts.unshift(data);
              } else {
                copyClassList[classNumber].posts = [data];
              }
              setClassList(copyClassList);
              setIsPosting(false);

              setPostText('');
              setPostFiles([]);

              ToastAndroid.show('Post succesful!', ToastAndroid.LONG);
              return;
            }
          })
          .catch(e => {
            alert('error', `${e}`);
          });
      }
    } else {
      createPost(data, classList, classNumber);

      let copyClassList = [...classList];
      if (copyClassList[classNumber].posts !== undefined) {
        copyClassList[classNumber].posts.unshift(data);
      } else {
        copyClassList[classNumber].posts = [data];
      }
      setClassList(copyClassList);
      setIsPosting(false);

      setPostText('');
      setPostFiles([]);

      ToastAndroid.show('Post succesful!', ToastAndroid.SHORT);
      return;
    }
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
    alert('Move file to internal storage', `${e}`);
  }
};

const openFile = async setPostFiles => {
  try {
    const permission = await requestStoragePermission();
    if (permission) {
      DocumentPicker.pickMultiple({
        type: [DocumentPicker.types.allFiles],
        mode: 'open',
        copyTo: 'cachesDirectory',
      })
        .then(res => {
          setPostFiles(prev => [
            ...prev,
            {fileName: res[0].name, uri: res[0].fileCopyUri},
          ]);
        })
        .catch(e => alert('Alert', `${e}`));
    } else {
      alert('Alert', 'Unable to upload file');
    }
  } catch (e) {
    alert('Alert', `${e}`);
  }
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

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
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
    margin: 10,
  },
  subtitle: {
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    color: '#000',
    fontSize: 12,
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  submitButton: {
    marginVertical: 5,
    backgroundColor: '#ADD8E6',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  uploadFile: {
    padding: 12,
    borderWidth: 3,
    borderColor: '#ADD8E6',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  icon: {
    color: '#000',
    height: 20,
    width: 20,
    marginLeft: 5,
  },
  back: {
    backgroundColor: '#ADD8E6',
    height: 40,
    width: 40,
    margin: 10,
    padding: 5,
    borderRadius: 50,
  },
  goback: {
    color: '#fff',
    alignSelf: 'center',
  },
  filesCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  fileCard: {
    flexDirection: 'row',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 2,
    padding: 10,
  },
  iconRemove: {
    height: 20,
    width: 20,
    color: 'red',
    marginStart: 5,
  },
});

const alert = (title, message) => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
};

export default CreatePostPage;
