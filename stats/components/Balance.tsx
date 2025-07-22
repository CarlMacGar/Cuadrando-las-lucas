import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  RefreshControl,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import PieChartView from "./PieChartView";
import PercView from "./PercView";
import BudgetForm from "../../budget/components/BudgetForm";
import CategoryForm from "../../expenses/components/CategoryForm";
import { useTheme } from "../../themes/ThemeContext";
import { useAppStore } from "../../stores/AppStore";

type ViewMode = 1 | 2 | 3;

export default function Balance() {
  const colors = useTheme();
  const {
    budget,
    spendings,
    totalSpendings,
    fetchBudget,
    fetchSpendings,
    fetchTotalSpendings,
  } = useAppStore();

  const [viewMode, setViewMode] = useState<ViewMode>(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const budgetUsedPercentage = budget > 0 ? (totalSpendings / budget) * 100 : 0;

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      await Promise.all([
        fetchSpendings(),
        fetchTotalSpendings(),
        fetchBudget(),
      ]);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos");
      console.error("Error loading balance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleView = () => {
    // Animate transition
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Scale animation for feedback
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setViewMode((prev) => (prev === 2 ? 1 : ((prev + 1) as ViewMode)));
  };

  const getBudgetStatus = () => {
    if (budgetUsedPercentage <= 50)
      return { color: colors.success, status: "Excelente" };
    if (budgetUsedPercentage <= 80)
      return { color: colors.warning, status: "Cuidado" };
    return { color: colors.error, status: "Límite" };
  };

  const getViewModeInfo = () => {
    switch (viewMode) {
      case 1:
        return {
          title: "Progreso",
          icon: require("../../assets/ProgressIcon.png"),
        };
      case 2:
        return {
          title: "Categorías",
          icon: require("../../assets/PieIcon.png"),
        };
      default:
        return {
          title: "Vista",
          icon: require("../../assets/AppIconCircleTiny.png"),
        };
    }
  };

  const onRefresh = () => {
    loadData(true);
  };

  return (
    <ScrollView
      style={[styles.container]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Stats */}
      <View style={styles.headerContainer}>
        <View style={styles.contentRow}>
          <Image
            source={require("../../assets/AppIconCircleTiny.png")}
            style={styles.icon}
          />
          <Text style={[styles.headerTitle, { color: colors.yellow }]}>
            Cuadre de lucas
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getBudgetStatus().color },
            ]}
          />
          <Text style={[styles.statusText, { color: colors.secondaryText }]}>
            {getBudgetStatus().status}
          </Text>
        </View>
      </View>

      {/* Budget Overview Cards */}
      <View style={styles.generalData}>
        <BudgetForm />
        <CategoryForm />
      </View>

      {/* Interactive Chart Section */}
      <View style={styles.chartSection}>
        <View style={styles.chartHeader}>
          <View  style={styles.contentRow}>
            <Image source={getViewModeInfo().icon} style={styles.icon} />
            <Text style={[styles.chartTitle, { color: colors.yellow }]}>
              {getViewModeInfo().title}
            </Text>
          </View>

          <Text style={[styles.tapHint, { color: colors.mutedText }]}>
            Toca para cambiar vista
          </Text>
        </View>

        <Animated.View
          style={[
            styles.chartContainer,
            {
              backgroundColor: colors.bgCard,
              borderColor: colors.border,
              shadowColor: colors.primaryText,
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <TouchableOpacity
            onPress={toggleView}
            activeOpacity={0.8}
            style={styles.chartTouchable}
          >
            {viewMode === 1 && (
              <PercView budget={budget} totalSpendings={totalSpendings} />
            )}

            {viewMode === 2 && (
              <PieChartView
                spendings={spendings}
                totalSpendings={totalSpendings}
              />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* View Mode Indicators */}
        <View style={styles.indicatorContainer}>
          {[1, 2].map((mode) => (
            <View
              key={mode}
              style={[
                styles.indicator,
                {
                  backgroundColor:
                    viewMode === mode ? colors.yellow : colors.border,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 5,
    marginTop: 30,
    backgroundColor: "transparent",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  statusContainer: {
    marginLeft: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  generalData: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  chartSection: {
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tapHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
  chartContainer: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    minHeight: 200,
  },
  chartTouchable: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
});
