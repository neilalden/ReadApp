import React, {useContext} from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {ClassContext} from '../../context/ClassContext';
import {Link} from 'react-router-native';

const StudentClassList = () => {
  const {classList, setClassNumber} = useContext(ClassContext);

  return (
    <>
      {classList &&
        classList.map((item, index) => {
          const teachers = [];
          for (const i in item.teachers) {
            teachers.push(item.teachers[i].name);
          }
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
                  <View style={styles.teachersNameContainer}>
                    <Text style={styles.itemSubtitle}>
                      {teachers ? teachers.toString().replace(',', ', ') : ''}
                    </Text>
                  </View>
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
    borderRadius: 15,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
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
  teachersNameContainer: {
    flexDirection: 'row',
  },
  itemPic: {
    flexDirection: 'row',
    borderRadius: 50,
    height: 50,
    width: 50,
    alignSelf: 'center',
  },
});

export default StudentClassList;
