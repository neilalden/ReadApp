import React, {useCallback, useContext, useEffect, useState} from 'react';

import NetInfo from '@react-native-community/netinfo';
import {
  View,
  Text,
  Alert,
  BackHandler,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Link, useHistory} from 'react-router-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';
import IconAddClass from '../../../assets/addClass.svg';
import IconDrafts from '../../../assets/sd-card.svg';

import {ClassContext, fetchClassworkList} from '../../context/ClassContext';
import ClassroomHeader from './ClassroomHeader';
import ClassroomNav from './ClassroomNav';

const ClassroomPage = ({userInfo}) => {
  /***STATES***/
  const history = useHistory();
  const {classNumber, classList, setClassList, setClassworkNumber} =
    useContext(ClassContext);
  const [isConnected, setIsConnected] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState([]);

  /***HOOKS***/
  useEffect(() => {
    NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    // FETCH CLASSWORKLIST OF THE OPENNED CLASS IF IT DOES NOT EXIST YET
    fetchClassworkList(
      classNumber,
      classList,
      setClassList,
      setClassworkNumber,
    );

    // TO STOP THE BACK BUTTON FROM CLOSING THE APP
    BackHandler.addEventListener('hardwareBackPress', () => {
      history.push('/ClassList');
      return true;
    });
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  /***FUNCTIONS***/
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchClassworkList(
      classNumber,
      classList,
      setClassList,
      setClassworkNumber,
    );
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
        <ClassroomHeader
          subject={classList[classNumber].subject}
          section={classList[classNumber].section}
        />
        <Segment
          userInfo={userInfo}
          setShowDrafts={setShowDrafts}
          showDrafts={showDrafts}
          setDrafts={setDrafts}
          drafts={drafts}
          classList={classList}
          classNumber={classNumber}
          history={history}
        />
        <ClassworkList
          classList={classList}
          classNumber={classNumber}
          setClassworkNumber={setClassworkNumber}
        />
      </ScrollView>
      <ClassroomNav isStudent={userInfo.isStudent} />
    </>
  );
};

const ClassworkList = ({classList, classNumber, setClassworkNumber}) => {
  return (
    <ScrollView>
      {classList[classNumber].classworkList &&
      classList[classNumber].classworkList.length !== 0 ? (
        <ScrollView>
          {classList[classNumber].classworkList.map((item, index) => {
            let dt = new Date(
              item.deadline.toDate
                ? item.deadline.toDate()
                : item.deadline.seconds * 1000,
            );
            const day = dt.getDate();
            const month = dt.getMonth();
            const year = dt.getFullYear();
            const hour = dt.getHours();
            const minute = dt.getMinutes();
            const ampm = hour >= 12 ? 'pm' : 'am';
            return (
              <Link
                to="/Classwork"
                underlayColor="#C1E1EC"
                key={index}
                style={styles.item}
                onPress={() => {
                  setClassworkNumber(index);
                }}>
                <View style={styles.itemContainer}>
                  <View>
                    <Text style={styles.itemText}>{item.title}</Text>
                    <Text style={styles.itemTextSubs}>
                      Deadline: {MONTHS[month]}/{day}/{year}{' '}
                      {hour >= 12 ? hour - 12 : hour}:{minute} {ampm}
                    </Text>
                  </View>
                  {item.closeOnDeadline && (
                    <Text style={styles.itemTextSubs}>
                      will close{'\n'}on deadline
                    </Text>
                  )}
                </View>
              </Link>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={styles.itemTextSubs}>No classworks yet</Text>
      )}
    </ScrollView>
  );
};

const Segment = ({
  userInfo,
  setShowDrafts,
  showDrafts,
  setDrafts,
  drafts,
  classList,
  classNumber,
  history,
}) => {
  const handleShowDrafts = () => {
    setShowDrafts(!showDrafts);
    if (drafts.length === 0) {
      AsyncStorage.getItem(`drafts-${classList[classNumber].classId}`)
        .then(jsonValue => {
          if (jsonValue !== null) {
            setDrafts(JSON.parse(jsonValue).drafts);
          }
        })
        .catch(e => alert(e.message, e.code));
    }
  };
  return (
    <>
      {!userInfo.isStudent ? (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            history.push('/CreateClasswork');
          }}>
          <IconAddClass height={30} width={30} style={styles.addIcon} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, {flexDirection: 'row'}]}
          onPress={handleShowDrafts}>
          {showDrafts ? (
            <IconGoBack height={25} width={25} style={styles.addIcon} />
          ) : (
            <IconDrafts height={25} width={25} style={styles.addIcon} />
          )}
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  addButton: {
    margin: 10,
    alignSelf: 'flex-end',
  },
  item: {
    height: 70,
    marginHorizontal: 10,
    paddingHorizontal: 15,
    marginBottom: 5,
    borderRadius: 10,
    backgroundColor: '#ADD8E6',
    fontFamily: 'Lato-Regular',
    flexDirection: 'row',
    alignItems: 'center', //vertical align text center
  },
  itemText: {
    fontFamily: 'Lato-Regular',
    fontSize: 20,
    paddingVertical: 5,
  },
  itemTextSubs: {
    fontFamily: 'Lato-Regular',
    fontSize: 12,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
  },
  itemContainer: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    alignItems: 'center', //vertical align text center
  },
  addIcon: {
    backgroundColor: '#ADD8E6',
    color: '#fff',
    borderRadius: 50,
  },
});

const alert = (message, title = 'Alert!') => {
  Alert.alert(title, message, [{text: 'OK', onPress: () => true}]);
};
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

export default ClassroomPage;
