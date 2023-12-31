import * as React from 'react';
import {View, Text, StyleSheet, Alert, TextInput, Pressable, Keyboard } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import GameContext from '../Contexts/GameListContext.js';

function HolesScreen({ navigation }) {

    const {games, setGames} = React.useContext(GameContext);

    const [leftSelected, setLeftSelected] = React.useState([]);
    const [rightSelected, setRightSelected] = React.useState([]);
    const [centerSelected, setCenterSelected] = React.useState([]);

    const refs = React.useRef(Array(5).fill(null));

    let currentGame = games[games.length - 1];

    const handleNext = () =>
    {
        if (leftSelected.length != 2) {
            Alert.alert('Invalid Left Team', 'Must have 2 Players.');
            return;
        }

        if (rightSelected.length != 2) {
            Alert.alert('Invalid Right Team', 'Must have 2 Players.');
            return;
        }

        if (centerSelected.length != 1) {
            Alert.alert('Invalid Center Team', 'Must have 1 Player.');
            return;
        }

        for (let i = 0; i < currentGame.getPlayers().length; i++) {
            let player = currentGame.getPlayers()[i];
            if (currentGame.getScores()[player][currentGame.getHole()] <= 0) {
                Alert.alert('Invalid Scores', 'Scores must be real.');
                return;
            }
        }

        // Ensure that no selected teams have repeated names
        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 2; j++)
            {
                if (leftSelected[i] == rightSelected[j] || leftSelected[i] == centerSelected[0] || rightSelected[j] == centerSelected[0]) {
                    Alert.alert('Invalid Teams', 'A player can only be on 1 team.');
                    return;
                }
            }
        }

        for (let i = 0; i < 2; i++) {
            currentGame.setTeams(leftSelected[i], 'L');
            currentGame.setTeams(rightSelected[i], 'R');
        }
        currentGame.setTeams(centerSelected[0], 'C');


        currentGame.calculatePoints();

        if (currentGame.getHole() == 14) {
            Alert.alert('Double Points?', 'Select Yes to double points for the rest of the game.', [
                {
                    text: 'No',
                    style: 'cancel',
                },
                { text: 'Yes', onPress: () => currentGame.doubleAmounts() }
            ])
        }

        navigation.push('ScoresScreen');
    };

    const handleScoreUpdate = (index, value) => {

        let player = currentGame.getPlayers()[index];

        currentGame.setRawScore(player, value);

        if (value.length === 1) {
            const nextIndex = index + 1;
            if (nextIndex < currentGame.getPlayers().length) {
                setTimeout(() => {
                    refs.current[nextIndex].focus();
                }, 10);
            }
            else {
                Keyboard.dismiss();
            }
        }
    };

    const handleInGameGoBack = () => {
        currentGame.prevHole();
        if (currentGame.getHole() === 0) {
            let newGames = [];
            for (let i = 0; i < games.length - 1; i++) {
                newGames.push(games[i]);
            }
            setGames(newGames);
        }
    }
    

    React.useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                e.preventDefault();
                handleInGameGoBack();
                navigation.dispatch(e.data.action)
            })
    )

    return (
        <View style={styles.container}>
            <Text style ={styles.generalText}>Teams:</Text>
            <MultipleSelectList
                boxStyles = {styles.dropDownBox}
                checkBoxStyles = {styles.dropDown}
                inputStyles = {styles.generalText}
                dropdownTextStyles = {styles.generalText}
                labelStyles = {styles.dropDownLabel}
                badgeStyles = {styles.dropDownBadge}
                badgeTextStyles = {styles.dropDownBadgeText}
                setSelected = {(val) => setLeftSelected(val)}
                data = {currentGame.getPlayers()}
                save="value"
                label="Left"
                search = {false}
                placeholder = "Left"
            />
            <MultipleSelectList
                boxStyles={styles.dropDownBox}
                checkBoxStyles={styles.dropDown}
                dropdownTextStyles={styles.generalText}
                labelStyles={styles.dropDownLabel}
                badgeStyles={styles.dropDownBadge}
                badgeTextStyles={styles.dropDownBadgeText}
                setSelected={(val) => setCenterSelected(val)}
                data={currentGame.getPlayers()}
                save="value"
                label="Center"
                search={false}
                placeholder="Center"
                inputStyles={styles.generalText}
            />
            <MultipleSelectList
                boxStyles={styles.dropDownBox}
                checkBoxStyles={styles.dropDown}
                dropdownTextStyles={styles.generalText}
                labelStyles={styles.dropDownLabel}
                badgeStyles={styles.dropDownBadge}
                badgeTextStyles={styles.dropDownBadgeText}
                setSelected={(val) => setRightSelected(val)}
                data={currentGame.getPlayers()}
                save="value"
                label="Right"
                search={false}
                placeholder="Right"
                inputStyles={styles.generalText}
            />
            <View style={styles.scoreContainer}>
                <Text style={styles.generalText}>Scores:</Text>
                <View style={styles.gridContainer}>
                {Array.from({ length: 5}, (_, index) => (
                    <TextInput
                        ref={ref => refs.current[index] = ref}
                        key={index}
                        style={[styles.input]}
                        keyboardType="numeric"
                        placeholder={currentGame.getPlayers()[index]}
                        onChangeText={(value) => handleScoreUpdate(index, value)}
                    />
                ))}
                </View>
            </View>
            <View style={styles.nextHoleContainer}>
                <Pressable style={styles.button} onPress={handleNext}>
                    <Text style={styles.buttontext}>Continue</Text>
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center'
    },

    scoreContainer: {
        flex: 2,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    nextHoleContainer: {
        flex: 3,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    generalText: {
        color: '#fff',
        fontFamily: 'Times New Roman',
        fontSize: 32
    },

    dropDown: {
      backgroundColor: '#fff',
    },

    dropDownBox: {
        backgroundColor: '#03AC13',
    },

    dropDownLabel: {
        color: '#fff',
        fontFamily: 'Times New Roman',
        fontSize: 24,
    },

    dropDownBadge: {
        backgroundColor: '#000',
    },

    dropDownBadgeText: {
        color: '#fff',
        fontFamily: 'Times New Roman',
        fontSize: 18,
    },

    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        color: '#000',
        backgroundColor: '#fff',
    },

    gridContainer: {
        flexDirection: 'row',
        justifyContent: "space-between",
    },

    button: {
        alignItems: 'center',
        justifycontent: 'center',
        paddingVertical: 25,
        paddingHorizontal: 100,
        borderRadius: 100,
        elevation: 25,
        backgroundColor: '#03AC13',
        marginTop: 10,
        marginBottom: 10,
    },

    buttontext: {
        color: '#fff',
        fontFamily: 'Times New Roman',
        fontSize: 24,
    },

})

export default HolesScreen;