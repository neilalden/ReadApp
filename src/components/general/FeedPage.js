import React, {useCallback, useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  BackHandler,
  RefreshControl,
} from 'react-native';
import {useHistory} from 'react-router';
import {ClassContext, fetchPosts} from '../../context/ClassContext';
import {AuthContext} from '../../context/AuthContext';
import IconAddClass from '../../../assets/addClass.svg';
import firestore from '@react-native-firebase/firestore';
import ClassroomHeader from './ClassroomHeader';
import ClassroomNav from './ClassroomNav';
import ViewPostPage from './ViewPostPage';
const FeedPage = ({userInfo}) => {
  /***STATES***/
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const [viewPost, setViewPost] = useState(false);
  const [post, setPost] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  /***HOOKS***/

  useEffect(() => {
    if (userInfo.id !== undefined && user) {
      firestore()
        .collection(`classes/${classList[classNumber].classId}/posts`)
        .orderBy('createdAt', 'desc')
        .onSnapshot(snapShot => {
          if (snapShot == undefined) {
            return;
          } else {
            fetchPosts(classNumber, classList, setClassList);
          }
        });
    }
    BackHandler.addEventListener('hardwareBackPress', () => {
      if (viewPost) {
        setViewPost(false);
      } else {
        history.push('/ClassList');
      }
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, [viewPost]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(classNumber, classList, setClassList);
    wait(1000).then(() => setRefreshing(false));
  }, []);
  const wait = timeout => {
    return new Promise(resolve => setTimeout(resolve, timeout));
  };
  return (
    <>
      <ScrollView
        style={{backgroundColor: '#fff'}}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {!viewPost && <ClassroomHeader classroom={classList[classNumber]} />}
        {!viewPost && <Segment history={history} />}
        {viewPost ? (
          <ViewPostPage
            userInfo={userInfo}
            post={post}
            setPost={setPost}
            setViewPost={setViewPost}
          />
        ) : (
          <PostList
            posts={classList[classNumber].posts}
            setPost={setPost}
            setViewPost={setViewPost}
            classList={classList}
            classNumber={classNumber}
          />
        )}
      </ScrollView>
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};

/***COMPONENTS***/
const Segment = ({history}) => {
  return (
    <View style={styles.curvedSegment}>
      <TouchableOpacity
        style={styles.settingsToggle}
        onPress={() => {
          history.push('/CreatePost');
        }}>
        <IconAddClass height={30} width={30} style={styles.addIcon} />
      </TouchableOpacity>
    </View>
  );
};
const PostList = ({posts, setPost, setViewPost, classNumber, classList}) => {
  const handlePostClick = post => {
    setViewPost(true);
    setPost(post);
  };
  const students = classList[classNumber].students;
  const teachers = classList[classNumber].teachers;
  const classId = classList[classNumber].classId;

  return (
    <ScrollView style={{marginTop: 10}}>
      {posts && posts.length > 0 ? (
        <ScrollView>
          {posts.map((post, index) => {
            let author = {};
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
            return (
              <TouchableOpacity
                key={index}
                style={styles.card}
                onPress={() => handlePostClick(post)}>
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
                {post.body !== '' && (
                  <View style={styles.cardBodyContainer}>
                    <Text style={styles.cardBodyText}>
                      {post.body.length > 255
                        ? `${post.body.substring(0, 255)}...`
                        : post.body}
                    </Text>
                  </View>
                )}
                <View style={styles.filesCardContainer}>
                  {post.files &&
                    post.files.map((file, index) => {
                      return (
                        <View
                          key={index}
                          style={[
                            styles.card,
                            {marginHorizontal: 2, backgroundColor: '#E8EAED'},
                          ]}>
                          <Text>
                            {index >= 2
                              ? `${post.files.length - 2} more`
                              : file.replace(`${classId}/posts/`, '')}
                          </Text>
                        </View>
                      );
                    })}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.subtitle}>No posts yet</Text>
      )}
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    marginVertical: 5,
  },
  authorInfoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  userPic: {
    borderRadius: 50,
    height: 50,
    width: 50,
    marginLeft: 2,
    marginRight: 10,
  },
  cardTitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
  },
  cardSubtitleText: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
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

  curvedSegment: {
    height: 30,
    margin: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addIcon: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    borderRadius: 50,
  },
  settingsToggle: {
    alignContent: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  filesCardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginHorizontal: 10,
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

export default FeedPage;
