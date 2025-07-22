import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";
import { Themes } from "../constants/Colors";

const ThemeContext = createContext(Themes.light);

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? Themes.dark : Themes.light;

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};