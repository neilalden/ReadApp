import React, {useContext, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import {useHistory} from 'react-router';
import {ClassContext} from '../../context/ClassContext';
import {AuthContext} from '../../context/AuthContext';
import IconAddClass from '../../../assets/addClass.svg';
import IconSend from '../../../assets/send.svg';
import ClassroomHeader from './ClassroomHeader';
import ClassroomNav from './ClassroomNav';
const FeedPage = ({userInfo}) => {
  /***HOOKS***/
  const {classNumber, classList, setClassList} = useContext(ClassContext);
  const {user} = useContext(AuthContext);
  const history = useHistory();
  const [posts, setPosts] = useState([
    {
      title: 'Lorem Ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ac dolor ut nibh iaculis fermentum nec eu augue. Integer vitae iaculis odio, vel dictum diam. Duis tristique urna id nibh malesuada blandit. Nunc tempus faucibus rutrum. Integer porttitor diam nec convallis blandit. Donec dui nisl, pharetra suscipit ante at, cursus gravida odio. Etiam pretium orci eget enim pulvinar, vitae condimentum tortor consequat. Sed tincidunt molestie turpis a porta. Aliquam vitae tempus est.',
      files: ['image.png'],
    },

    {
      title: 'Lorem Ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ac dolor ut nibh iaculis fermentum nec eu augue. Integer vitae iaculis odio, vel dictum diam. Duis tristique urna id nibh malesuada blandit. Nunc tempus faucibus rutrum. Integer porttitor diam nec convallis blandit. Donec dui nisl, pharetra suscipit ante at, cursus gravida odio. Etiam pretium orci eget enim pulvinar, vitae condimentum tortor consequat. Sed tincidunt molestie turpis a porta. Aliquam vitae tempus est.',
      files: ['image.png'],
    },

    {
      title: 'Lorem Ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ac dolor ut nibh iaculis fermentum nec eu augue. Integer vitae iaculis odio, vel dictum diam. Duis tristique urna id nibh malesuada blandit. Nunc tempus faucibus rutrum. Integer porttitor diam nec convallis blandit. Donec dui nisl, pharetra suscipit ante at, cursus gravida odio. Etiam pretium orci eget enim pulvinar, vitae condimentum tortor consequat. Sed tincidunt molestie turpis a porta. Aliquam vitae tempus est.',
      files: ['image.png'],
    },

    {
      title: 'Lorem Ipsum',
      body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ac dolor ut nibh iaculis fermentum nec eu augue. Integer vitae iaculis odio, vel dictum diam. Duis tristique urna id nibh malesuada blandit. Nunc tempus faucibus rutrum. Integer porttitor diam nec convallis blandit. Donec dui nisl, pharetra suscipit ante at, cursus gravida odio. Etiam pretium orci eget enim pulvinar, vitae condimentum tortor consequat. Sed tincidunt molestie turpis a porta. Aliquam vitae tempus est.',
      files: ['image.png'],
    },
  ]);

  return (
    <>
      <ScrollView style={{backgroundColor: '#fff'}}>
        <ClassroomHeader
          subject={classList[classNumber].subject}
          section={classList[classNumber].section}
        />
        <Segment />
        {posts.map((item, index) => {
          return (
            <TouchableOpacity key={index} style={styles.cardContainer}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardBody}>
                  {item.body.length > 255
                    ? `${item.body.substr(0, 255)}...`
                    : item.body}
                </Text>
                <View style={styles.sendContainer}>
                  <TextInput
                    style={styles.cardTextInput}
                    placeholder="Type here"
                  />
                  <TouchableOpacity
                    style={styles.cardSendIcon}
                    onPress={() => {
                      ToastAndroid.show(
                        'A pikachu appeared nearby !',
                        ToastAndroid.LONG,
                      );
                    }}>
                    <IconSend height={30} width={30} color={Colors.black} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};
const Segment = () => {
  return (
    <View style={styles.curvedSegment}>
      <Text style={[styles.header]}>
        <TouchableOpacity
          style={styles.settingsToggle}
          onPress={() => {
            ToastAndroid.show('hello world', ToastAndroid.LONG);
          }}>
          <IconAddClass height={30} width={30} style={styles.addIcon} />
        </TouchableOpacity>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 10,
    margin: 5,
    elevation: 2,
  },
  card: {
    margin: 10,
  },
  cardTitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
  },
  cardBody: {
    fontFamily: 'Lato-Regular',
    fontSize: 14,
  },
  sendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardTextInput: {
    fontFamily: 'Lato-Regular',
    borderBottomColor: '#000',
    borderBottomWidth: 2,
    width: '90%',
    padding: 2,
    fontSize: 14,
  },
  cardSendIcon: {
    alignSelf: 'flex-end',
    width: '10%',
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
});

export default FeedPage;
