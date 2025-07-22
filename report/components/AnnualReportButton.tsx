import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
  Alert,
} from "react-native";
import { useTheme } from "../../themes/ThemeContext";
import { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { getMonthlyData, clearMonthlyData } from "../services/ReportData";
import { MonthlyReportModel } from "../models/MonthlyReportModel";
import { generateAnnualReport } from "../services/pdfReport";
import { useAppStore } from "../../stores/AppStore";
import { getAnnualReportKey } from "../../utils/PrevKeys";

export const AnnualReportButton = () => {
  const colors = useTheme();
  const [monthlyData, setMonthlyData] = useState<MonthlyReportModel[]>([]);
  const { addGeneratedReports, resetReports } = useAppStore();

  const loadData = async () => {
    try {
      const data = await getMonthlyData();
      setMonthlyData(data);
    } catch (error) {
      console.error("Error loading spendings:", error);
    }
  };

  const year = new Date().getFullYear();

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    try {
      await clearMonthlyData();
      Alert.alert(
        `Tu cuadre de lucas ${year - 1}`,
        `Ya está listo tu reporte anual. ¿Deseas generarlo?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Generar",
            onPress: async () => {
              const key = getAnnualReportKey();
              try {
                await generateAnnualReport(year, monthlyData);
                await loadData();
                addGeneratedReports(key);
                resetReports();
              } catch (error) {
                Alert.alert("Error", "Ups, algo falló al generar el reporte.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error resetting monthly data:", error);
      throw error;
    }
  };

  return (
    <TouchableOpacity onPress={handleGenerateReport}>
      <LinearGradient
        colors={["#fde88c", "#f9be03", "#c79100"]} // degradado claro a dorado
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.button}
      >
        <View style={styles.contentRow}>
          <Image
            source={require("../../assets/AppIconCircle.png")}
            style={styles.icon}
          />
          <Text style={[styles.text, { color: colors.darkText }]}>
            Tu cuadre de lucas 2025
          </Text>
          <Image
            source={require("../../assets/AppIconCircle.png")}
            style={styles.icon}
          />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
    overflow: "hidden",
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // si usas React Native Web, si no usa marginHorizontal
  },
  icon: {
    width: 24,
    height: 24,
    resizeMode: "contain",
  },
  text: {
    fontWeight: "bold",
    fontSize: 16,
  },
});
