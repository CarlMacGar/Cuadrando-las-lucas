import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  View,
  Alert,
} from "react-native";
import { generateMonthlyReport } from "../services/pdfReport";
import { clearSpendingsValues } from "../../expenses/services/SpendingService";
import { subtractBudget } from "../../budget/services/BudgetService";
import { useTheme } from "../../themes/ThemeContext";
import { useEffect } from "react";
import { useAppStore } from "../../stores/AppStore";
import { saveMonthlyData } from "../services/ReportData";
import { getPreviousMonthKey } from "../../utils/PrevKeys";

export const MonthlyReportButton = () => {
  const colors = useTheme();
  const {
    budget,
    spendings,
    totalSpendings,
    addGeneratedReports,
    fetchBudget,
    fetchSpendings,
    fetchTotalSpendings,
  } = useAppStore();

  const getDate = () => {
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const month = prevMonthDate.toLocaleString("es-CO", { month: "long" });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    const year = prevMonthDate.getFullYear();
    return { capitalizedMonth, year };
  };

  const loadData = async () => {
    try {
      await Promise.all([
        fetchSpendings(),
        fetchTotalSpendings(),
        fetchBudget(),
      ]);
    } catch (error) {
      console.error("Error loading spendings:", error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = async () => {
    Alert.alert(
      "¿Deseas continuar?",
      `Al generar el cuadre de ${getDate().capitalizedMonth} ${
        getDate().year
      } se reiniciaran los datos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Generar",
          onPress: async () => {
            const key = getPreviousMonthKey();
            try {
              await saveMonthlyData({
                month: getDate().capitalizedMonth,
                monthBudget: budget.toString(),
                monthSpendings: totalSpendings,
              });
              await subtractBudget(budget);
              await clearSpendingsValues();
              await loadData();
              await generateMonthlyReport({
                month: getDate().capitalizedMonth,
                year: getDate().year,
                budget: budget,
                spendings: spendings,
              });
              addGeneratedReports(key);
            } catch (error) {
              Alert.alert("Error", "Ups, algo falló al generar el reporte.");
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: colors.yellow }]}
      onPress={handleGenerateReport}
    >
      <View style={styles.contentRow}>
        <Image
          source={require("../../assets/BudgetIcon.png")}
          style={styles.icon}
        />
        <Text style={[styles.text, { color: colors.darkText }]}>
          Tu cuadre mensual
        </Text>
        <Image
          source={require("../../assets/ExpensesIcon.png")}
          style={styles.icon}
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 10,
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
