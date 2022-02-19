import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import FileViewer from 'react-native-file-viewer';
import RNFS from 'react-native-fs';
import IconDelete from '../../../assets/trash.svg';
import IconGoBack from '../../../assets/goback.svg';
import IconSend from '../../../assets/send.svg';
import {
  ClassContext,
  createComment,
  fetchPosts,
} from '../../context/ClassContext';

const ViewPostPage = ({userInfo, post, setPost, setViewPost}) => {
  /***STATES***/
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const [comment, setComment] = useState('');

  const [author, setAuthor] = useState({});

  const classId = classList[classNumber].classId;
  const students = classList[classNumber].students;
  const teachers = classList[classNumber].teachers;
  /***HOOKS***/
  useEffect(() => {
    setAuthor(findAuthor(post, students, teachers));
  }, []);
  return (
    <>
      <ScrollView>
        <Segment setViewPost={setViewPost} />
        <PostCard
          userInfo={userInfo}
          author={author}
          post={post}
          classList={classList}
          classNumber={classNumber}
          setViewPost={setViewPost}
          setClassList={setClassList}
        />
        <FilesContainer
          files={post.files}
          classList={classList}
          classNumber={classNumber}
        />
        <CommentBox
          userInfo={userInfo}
          postId={post.id}
          comments={post.comments}
          comment={comment}
          setComment={setComment}
          classList={classList}
          classNumber={classNumber}
        />

        <CommentsContainer
          userInfo={userInfo}
          post={post}
          students={students}
          teachers={teachers}
          classList={classList}
          classNumber={classNumber}
          setPost={setPost}
        />
      </ScrollView>
    </>
  );
};

/***COMPONENTS***/
const CommentsContainer = ({
  userInfo,
  post,
  students,
  teachers,
  classList,
  classNumber,
  setPost,
}) => {
  return (
    <ScrollView>
      {post.comments &&
        post.comments.map((comment, index) => {
          const author = findAuthor(comment, students, teachers);
          return (
            <CommentCard
              key={index}
              index={index}
              userInfo={userInfo}
              author={author}
              comment={comment}
              post={post}
              setPost={setPost}
              classList={classList}
              classNumber={classNumber}
            />
          );
        })}
    </ScrollView>
  );
};

const CommentBox = ({
  userInfo,
  postId,
  comments,
  comment,
  setComment,
  classList,
  classNumber,
}) => {
  const handlePostComment = () => {
    if (comment === '') {
      alert('Nothing to comment', 'Write something to comment');
    } else {
      let data = {
        author: userInfo.id,
        body: comment,
        createdAt: firestore.Timestamp.fromDate(new Date()),
      };
      comments.unshift(data);
      createComment(postId, comments, classList, classNumber);
      setComment('');
    }
  };

  return (
    <View style={styles.sendContainer}>
      <TextInput
        style={styles.cardTextInput}
        placeholder="Comment here"
        multiline={true}
        value={comment}
        onChangeText={text => setComment(text)}
      />
      <TouchableOpacity
        style={styles.cardSendIconContainer}
        onPress={handlePostComment}>
        <IconSend height={20} width={20} style={styles.cardSendIcon} />
      </TouchableOpacity>
    </View>
  );
};
const FilesContainer = ({files, classList, classNumber}) => {
  return (
    <View style={styles.filesCardContainer}>
      {files &&
        files.map((file, index) => (
          <FileCard
            file={file}
            classList={classList}
            classNumber={classNumber}
            key={index}
          />
        ))}
    </View>
  );
};
const FileCard = ({file, classList, classNumber}) => {
  const classId = classList[classNumber].classId;

  const handleViewFile = async () => {
    const permission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        title: 'ReadApp Storage Permission',
        message: 'ReadApp needs access to your storage to save files',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (permission) {
      viewFile(file, classList, classNumber);
    }
  };
  return (
    <TouchableOpacity
      style={[styles.card, {marginHorizontal: 2}]}
      onPress={handleViewFile}>
      <Text>{file.replace(`${classId}/posts/`, '')}</Text>
    </TouchableOpacity>
  );
};

const PostCard = ({
  userInfo,
  author,
  post,
  classList,
  classNumber,
  setViewPost,
  setClassList,
}) => {
  let dt = new Date(
    post.createdAt.toDate
      ? post.createdAt.toDate()
      : post.createdAt.seconds * 1000,
  );
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  const hour = dt.getHours();
  const minute = dt.getMinutes();
  const ampm = hour > 12 ? 'pm' : 'am';

  const handleDeletePost = () => {
    Alert.alert(`Delete this post?`, 'This will be permanent', [
      {
        text: 'YES',
        onPress: () => {
          //mag dedelete ng post
          firestore()
            .collection(`classes/${classList[classNumber].classId}/posts`)
            .doc(post.id)
            .delete()
            .then(() => {
              for (const i in post.files) {
                storage()
                  .ref(`${post.files[i]}`)
                  .delete()
                  .then(() => {
                    if (i == post.files.length - 1) {
                      setViewPost(false);
                      fetchPosts(classNumber, classList, setClassList);
                    }
                  })
                  .catch(e => {
                    alert(e.code, e.message);
                  });
              }
            })
            .catch(e => {
              alert(e.code, e.message);
            });
        },
      },
      {text: 'NO', onPress: () => true},
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={styles.authorInfoContainer}>
          <Image
            style={styles.userPic}
            source={{
              uri: author.photoUrl,
            }}
          />
          <View>
            <Text style={styles.cardTitleText}>{author.name}</Text>
            <Text style={styles.cardSubtitleText}>
              {MONTHS[month]}/{day}/{year}
              &nbsp;&nbsp;
              {hour > 12 ? hour - 12 : hour}:{minute} {ampm}
            </Text>
          </View>
        </View>
        {userInfo.id === author.id && (
          <TouchableOpacity
            onPress={handleDeletePost}
            style={styles.iconContainer}>
            <IconDelete height={25} width={25} style={styles.deleteIcon} />
          </TouchableOpacity>
        )}
      </View>
      {post.body !== '' && (
        <View style={styles.cardBodyContainer}>
          <Text style={styles.cardBodyText}>{post.body}</Text>
        </View>
      )}
    </View>
  );
};

const CommentCard = ({
  index,
  userInfo,
  author,
  comment,
  post,
  setPost,
  classList,
  classNumber,
}) => {
  const handleDeleteComment = () => {
    Alert.alert(`Delete this comment?`, 'This will be permanent', [
      {
        text: 'YES',
        onPress: () => {
          let copyComments = [...post.comments];
          copyComments.splice(index, 1);

          let copyPost = {...post};
          copyPost.comments = copyComments;
          setPost(copyPost);
          createComment(post.id, copyComments, classList, classNumber);
        },
      },
      {text: 'NO', onPress: () => true},
    ]);
  };

  let dt = new Date(
    comment.createdAt.toDate
      ? comment.createdAt.toDate()
      : comment.createdAt.seconds * 1000,
  );
  const day = dt.getDate();
  const month = dt.getMonth();
  const year = dt.getFullYear();
  const hour = dt.getHours();
  const minute = dt.getMinutes();
  const ampm = hour > 12 ? 'pm' : 'am';

  return (
    <View style={styles.card}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <View style={styles.authorInfoContainer}>
          <Image
            style={styles.userPic}
            source={{
              uri: author.photoUrl,
            }}
          />
          <View>
            <Text style={styles.cardTitleText}>{author.name}</Text>
            <Text style={styles.cardSubtitleText}>
              {MONTHS[month]}/{day}/{year}
              &nbsp;&nbsp;
              {hour > 12 ? hour - 12 : hour}:{minute} {ampm}
            </Text>
          </View>
        </View>
        {userInfo.id === author.id && (
          <TouchableOpacity
            onPress={handleDeleteComment}
            style={styles.iconContainer}>
            <IconDelete height={25} width={25} style={styles.deleteIcon} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.cardBodyContainer}>
        <Text style={styles.cardBodyText}>{comment.body}</Text>
      </View>
    </View>
  );
};

const Segment = ({setViewPost}) => {
  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => setViewPost(false)}
        style={styles.backIconContainer}>
        <IconGoBack height={30} width={30} style={styles.backIcon} />
      </TouchableOpacity>
    </View>
  );
};

/***FUNCTIONS***/
const findAuthor = (post, students, teachers) => {
  let author = {
    id: post.author,
    name: post.author,
    photoUrl: post.author,
  };
  students.forEach(student => {
    if (student.id == post.author) {
      author = student;
    }
  });
  teachers.forEach(teacher => {
    if (teacher.id == post.author) {
      author = teacher;
    }
  });
  return author;
};

const viewFile = (file, classList, classNumber) => {
  ToastAndroid.showWithGravity(
    'Loading...',
    ToastAndroid.SHORT,
    ToastAndroid.CENTER,
  );
  const classId = classList[classNumber].classId;
  const className = `${classList[classNumber].subject} ${classList[classNumber].section}`;
  const filePath = `${classId}/posts/`;
  const localFile = `${RNFS.DownloadDirectoryPath}/${className}/${file.replace(
    filePath,
    '',
  )}`;
  RNFS.exists(localFile).then(exists => {
    if (exists) {
      FileViewer.open(localFile);
    } else {
      storage()
        .ref(file)
        .getDownloadURL()
        .then(url => {
          const options = {
            fromUrl: url,
            toFile: localFile,
          };
          RNFS.exists(`${RNFS.DownloadDirectoryPath}/${className}`).then(x => {
            if (!x) {
              RNFS.mkdir(`${RNFS.DownloadDirectoryPath}/${className}`);
            }
            RNFS.downloadFile(options)
              .promise.then(() => FileViewer.open(localFile))
              .then(() => {})
              .catch(error => {
                alert(error.message, error.code);
              });
          });
        })
        .catch(e => alert(e.code, e.message));
    }
  });
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  header: {
    color: 'black',
    textAlign: 'center',
    fontFamily: 'Lato-Regular',
    fontSize: 18,
    padding: 15,
  },
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  cardTitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
  },
  cardSubtitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
  },
  cardBodyContainer: {
    backgroundColor: '#E8EAED',
    borderRadius: 10,
    margin: 2,
    padding: 10,
  },
  cardBodyText: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
  },
  authorInfoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  iconContainer: {
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 50,
    padding: 5,
    marginHorizontal: 5,
  },
  backIcon: {
    color: '#FFF',
    alignSelf: 'center',
  },
  deleteIcon: {
    color: 'red',
  },
  userPic: {
    borderRadius: 50,
    height: 50,
    width: 50,
    marginLeft: 2,
    marginRight: 10,
  },
  filesCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  sendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#E8EAED',
    margin: 10,
    borderRadius: 10,
  },
  cardTextInput: {
    fontFamily: 'Lato-Regular',
    width: '85%',
    fontSize: 14,
    margin: 2,
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
  backIconContainer: {
    backgroundColor: '#ADD8E6',
    height: 40,
    width: 40,
    margin: 10,
    padding: 5,
    borderRadius: 50,
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
export default ViewPostPage;
