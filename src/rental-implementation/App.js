import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert } from 'react-native';

const App = () => {
  const [vehicles, setVehicles] = useState([]);
  const [userId, setUserId] = useState('');
  const [vehicleId, setVehicleId] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/vehicles');
      const data = await response.json();
      setVehicles(data);
    } catch (error) {
      console.error(error);
    }
  };

  const rentVehicle = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rentals/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, vehicleID: vehicleId }),
      });
      const data = await response.json();
      Alert.alert(data.message);
      fetchVehicles(); // Refresh vehicle list after renting
    } catch (error) {
      console.error(error);
    }
  };

  const cancelReservation = async (reservationId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        Alert.alert('Reservation canceled');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="User ID"
        value={userId}
        onChangeText={setUserId}
      />
      <TextInput
        placeholder="Vehicle ID"
        value={vehicleId}
        onChangeText={setVehicleId}
      />
      <Button title="Rent Vehicle" onPress={rentVehicle} />
      <FlatList
        data={vehicles}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View>
            <Text>{`${item.type} - ${item.station}`}</Text>
            <Button title="Cancel Reservation" onPress={() => cancelReservation(item._id)} />
          </View>
        )}
      />
    </View>
  );
};

export default App;
