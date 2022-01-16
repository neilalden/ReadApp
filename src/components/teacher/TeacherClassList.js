import React from 'react';
import {useContext} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {Link} from 'react-router-native';
import {ClassContext} from '../../context/ClassContext';

const TeacherClassList = () => {
  const {classList, setClassNumber} = useContext(ClassContext);

  return (
    <>
      {classList &&
        classList.map((item, index) => {
          return (
            <Link
              to="/Classroom"
              underlayColor="#C1E1EC"
              key={index}
              style={styles.item}
              onPress={() => {
                setClassNumber(index);
              }}>
              <>
                <View>
                  <Text style={styles.header}>{item.subject}</Text>
                  <Text style={styles.itemSubtitle}>{item.section}</Text>
                </View>
                <Image
                  style={styles.itemPic}
                  source={{
                    uri: item.teachers[0].photoUrl,
                  }}
                />
              </>
            </Link>
          );
        })}
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#ADD8E6',
    padding: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 3,
  },
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 15,
    textAlign: 'left',
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    marginTop: 5,
    marginRight: 5,
    color: '#000',
    fontSize: 10,
    textAlign: 'left',
  },
  itemPic: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 50,
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
});

export default TeacherClassList;
