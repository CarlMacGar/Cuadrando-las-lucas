import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, Alert } from "react-native";
import Balance from "../stats/components/Balance";
import BottomSheet from "../components/BottomSheet";
import CategoryCard from "../expenses/components/CategoryCard";
import { MonthlyReportButton } from "../report/components/MonthlyReportButton";
import { AnnualReportButton } from "../report/components/AnnualReportButton";
import { useEffect, useState } from "react";
import { useTheme } from "../themes/ThemeContext";
import { useAppStore } from "../stores/AppStore";
import { annualReportAble, monthlyReportAble } from "../report/services/ReportData";

export default function Home() {
  const colors = useTheme();
  const [canGenerateMonthlyReport, setCanGenerateMonthlyReport] = useState(false);
  const [canGenerateAnnualReport, setCanGenerateAnnualReport] = useState(false);

  const {
    cardExpanded,
    spendings,
    fetchSpendings,
    fetchGeneratedReports,
  } = useAppStore();

  const loadData = async () => {
    try {
      await fetchSpendings();
      await fetchGeneratedReports();
      const monthlyAble = await monthlyReportAble();
      const annualAble = await annualReportAble();
      setCanGenerateMonthlyReport(monthlyAble);
      setCanGenerateAnnualReport(annualAble);
    } catch (error) {
      console.error("Error loading spendings:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Show alert if monthly report can be generated-
    if (canGenerateMonthlyReport) {
      Alert.alert(
        "Tu cuadre mensual está listo!",
        `Debajo de las estadísticas habrá un botón para generar el reporte mensual de tus lucas ;)`,
        [{ text: "OK" }]
      );
    }

    // Alert for annual report generation
    if (canGenerateAnnualReport) {
      const year = new Date().getFullYear() - 1;
      Alert.alert(
        `Tu cuadre de lucas ${year} está listo!`,
        `Debajo de las estadísticas habrá un botón para generar tu cuadre de lucas ${year} :D`,
        [{ text: "OK" }]
      );
    }
  }, []);

  return (
    <>
      <ScrollView style={{ backgroundColor: colors.bgPrimary }}>
        <View style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
          <StatusBar style="auto" />
          <Balance />
          {canGenerateMonthlyReport && (
            <View style={{ paddingBottom: 110 }}>
              <MonthlyReportButton />
            </View>
          )}
          {canGenerateAnnualReport && (
            <View style={{ paddingBottom: 110 }}>
              <AnnualReportButton />
            </View>
          )}
        </View>
      </ScrollView>
      <BottomSheet>
        {spendings.length === 0 ? (
          <Text style={[styles.bttmShtEmpty, { color: colors.secondaryText }]}>
            No hay categorías aún.
          </Text>
        ) : (
          <View
            style={[
              styles.bttmShtFilled,
              {
                paddingBottom: cardExpanded ? 230 : 0,
              },
            ]}
          >
            {spendings.map((cat, idx) => (
              <View key={idx} style={{ width: "48%" }}>
                <CategoryCard data={cat} reload={loadData} />
              </View>
            ))}
          </View>
        )}
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  bttmShtEmpty: {
    marginTop: 20,
    textAlign: "center",
  },
  bttmShtFilled: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
});
