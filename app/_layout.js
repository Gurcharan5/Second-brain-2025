import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'To-Do',
          tabBarLabel: 'To-Do',
          tabBarIcon: () => <MaterialCommunityIcons name="check-circle" size={24} color="black" />,
          headerShown: false, // Hides the top header
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: 'Habits',
          tabBarLabel: 'Habits',
          tabBarIcon: () => <MaterialCommunityIcons name="clock-check" size={24} color="black" />,
          headerShown: false, // Hides the top header
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarLabel: 'Notes',
          tabBarIcon: () => <MaterialCommunityIcons name="note" size={24} color="black" />,
          headerShown: false, // Hides the top header
        }}
      />
    </Tabs>
  );
}
