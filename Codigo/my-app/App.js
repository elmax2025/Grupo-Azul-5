import Login from '../my-app/src/Login/login.js'
import Registro from './src/Register/Registro.js'
import Contraseñaperdida from './src/Contraseñaperdida/contraseña.js'
import { StyleSheet, View } from 'react-native';


export default function App() {

  return (
    <View style={styles.container}>
      <Registro/>
    </View>
  );
}

//FRONT
const styles = StyleSheet.create({
 container: {
    flex: 1,
    backgroundColor: '#9958',
    padding: 20,
  },
});
