import React, {useEffect} from 'react';
import {useContext} from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import {Link} from 'react-router-native';
import {ClassContext, fetchPeople} from '../../context/ClassContext';

const sources = [
  '../../../assets/image_headers/1.png',
  '../../../assets/image_headers/2.png',
  '../../../assets/image_headers/3.png',
  '../../../assets/image_headers/4.png',
  '../../../assets/image_headers/5.png',
  '../../../assets/image_headers/6.png',
  '../../../assets/image_headers/7.png',
  '../../../assets/image_headers/8.png',
  '../../../assets/image_headers/9.png',
  '../../../assets/image_headers/10.png',
  '../../../assets/image_headers/11.png',
  '../../../assets/image_headers/12.png',
  '../../../assets/image_headers/13.png',
  '../../../assets/image_headers/14.png',
  '../../../assets/image_headers/15.png',
  '../../../assets/image_headers/16.png',
];

const TeacherClassList = () => {
  const {classList, setClassList, setClassNumber} = useContext(ClassContext);
  return (
    <ScrollView>
      {classList &&
        classList.map((item, index) => {
          const student = randomNumberGenerator(item.students.length);
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
                <View style={styles.classInfo}>
                  <View>
                    <Text style={styles.header}>{item.subject}</Text>
                    <Text style={styles.itemSubtitle}>{item.section}</Text>
                  </View>
                  <View>
                    {item.students[student] ? (
                      <>
                        <View style={styles.flexDirectionRow}>
                          <Image
                            style={styles.itemPic}
                            source={{
                              uri: item.students[student].photoUrl,
                            }}
                          />
                          <Text style={styles.itemSubtitle}>
                            {`${
                              item.students[student].name.length > 20
                                ? `${item.students[student].name.substring(
                                    0,
                                    20,
                                  )}...`
                                : item.students[student].name
                            }`}
                          </Text>
                        </View>
                        <Text style={styles.itemSubtitle}>
                          {item.students.length > 1 &&
                            ` and ${item.students.length - 1} more`}
                        </Text>
                      </>
                    ) : (
                      <Text style={styles.itemSubtitle}>No students yet</Text>
                    )}
                  </View>
                </View>
                <Image
                  style={styles.imageHeader}
                  source={{uri: `asset:/image_headers/${item.classHeader}.png`}}
                />
              </>
            </Link>
          );
        })}
    </ScrollView>
  );
};

/***FUNCRION***/
const randomNumberGenerator = num_of_students => {
  if (num_of_students == 0) {
    return undefined;
  } else {
    return Math.floor(Math.random() * num_of_students);
  }
};

const styles = StyleSheet.create({
  classInfo: {
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  flexDirectionRow: {
    flexDirection: 'row',
  },
  textAlignCenter: {
    alignSelf: 'center',
  },
  item: {
    backgroundColor: '#ADD8E6',
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginHorizontal: 10,
    marginVertical: 5,
    height: 120,
  },
  header: {
    fontFamily: 'Lato-Regular',
    fontSize: 16,
    textAlign: 'left',
  },
  itemSubtitle: {
    fontFamily: 'Lato-Regular',
    color: '#000',
    fontSize: 12,
    textAlign: 'left',
  },
  itemPic: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderRadius: 50,
    height: 20,
    width: 20,
    marginRight: 5,
    alignSelf: 'center',
  },
  imageHeader: {
    resizeMode: 'contain',
    height: 120,
    width: 120,
  },
});

export default TeacherClassList;
