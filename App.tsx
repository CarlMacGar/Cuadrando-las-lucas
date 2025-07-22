import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import Home from "./screens/Home";
import { ThemeProvider } from "./themes/ThemeContext";

export default function App() {

  return (
    <ThemeProvider>
      <Home/>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
