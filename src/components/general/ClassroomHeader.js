import React from 'react';
import {View, Text, StyleSheet, Image, ImageBackground} from 'react-native';
import {Link} from 'react-router-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconGoBack from '../../../assets/goback.svg';
const ClassroomHeader = ({classroom}) => {
  const subject = classroom.subject;
  const section = classroom.section;
  const header = classroom.classHeader;
  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        <View>
          <Text style={styles.headerText}>{subject}</Text>
          <Text style={styles.subtitle}>{section}</Text>
        </View>
      </View>
      <View>
        <Image
          style={styles.imageHeader}
          source={{uri: `asset:/image_headers/${header}.png`}}
        />

        <Link to="/ClassList" style={styles.back} underlayColor="#fff">
          <IconGoBack height={20} width={20} style={styles.goback} />
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  imageHeader: {
    resizeMode: 'center',
    height: 100,
    width: 100,
    marginRight: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    margin: 5,
    height: 100,
  },
  headerText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 24,
    fontFamily: 'Lato-Regular',
  },
  headerTextContainer: {
    padding: 15,
    paddingBottom: 0,
  },

  subtitle: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
  },
  back: {
    borderRadius: 50,
    borderColor: '#fff',
    borderWidth: 1,
    height: 30,
    width: 30,
    justifyContent: 'center', //Centered horizontally
    position: 'absolute',
    marginLeft: 70,
    marginTop: 10,
  },
  goback: {
    color: '#fff',
    borderRadius: 50,
    alignSelf: 'center',
  },
});
export default ClassroomHeader;
