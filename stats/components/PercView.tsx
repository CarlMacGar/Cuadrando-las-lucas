import { StyleSheet, Text, View, Dimensions, Animated } from "react-native";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useEffect, useRef } from "react";
import { useTheme } from "../../themes/ThemeContext";

type Props = {
  totalSpendings: number;
  budget: number;
};

const { width: screenWidth } = Dimensions.get("window");


export default function PercView({ totalSpendings, budget }: Props) {
  const colors = useTheme();
  
  const percentage = budget > 0 ? (totalSpendings / budget) * 100 : 0;
  const remaining = budget - totalSpendings;
  
  // Animation for the text content
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getBudgetStatus = () => {
    if (percentage <= 50) {
      return {
        color: colors.success,
        status: "Excelente",
        icon: "🟢",
        message: "Vas muy bien"
      };
    } else if (percentage <= 75) {
      return {
        color: colors.warning,
        status: "Moderado",
        icon: "🟡",
        message: "Ten cuidado"
      };
    } else if (percentage <= 100) {
      return {
        color: colors.error,
        status: "Límite",
        icon: "🟠",
        message: "Casi al límite"
      };
    } else {
      return {
        color: colors.error,
        status: "Excedido",
        icon: "🔴",
        message: "Presupuesto superado"
      };
    }
  };

  const getCircleColor = () => {
    if (percentage > 100) return colors.error;
    if (percentage > 75) return colors.warning;
    if (percentage > 50) return colors.yellow;
    return colors.success;
  };

  const budgetStatus = getBudgetStatus();

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.statusHeader}>
        <Text style={[styles.statusIcon]}>{budgetStatus.icon}</Text>
        <Text style={[styles.statusText, { color: colors.secondaryText }]}>
          {budgetStatus.status}
        </Text>
      </View>

      {/* Circular Progress */}
      <View style={styles.progressContainer}>
        <AnimatedCircularProgress
          size={screenWidth * 0.55}
          width={12}
          fill={percentage > 100 ? 100 : percentage}
          tintColor={getCircleColor()}
          backgroundColor={colors.border}
          lineCap="round"
          duration={1500}
          easing={(t) => t * (2 - t)} // Ease out animation
        >
          {() => (
            <Animated.View
              style={[
                styles.centerContent,
                {
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }
              ]}
            >
              <Text style={[styles.percentText, { color: budgetStatus.color }]}>
                {percentage.toFixed(1)}%
              </Text>
              <Text style={[styles.subText, { color: colors.secondaryText }]}>
                Gastado
              </Text>
              
              {/* Additional info */}
              <View style={styles.additionalInfo}>
                <Text style={[styles.amountText, { color: colors.mutedText }]}>
                  {formatCurrency(totalSpendings)}
                </Text>
                <Text style={[styles.budgetText, { color: colors.mutedText }]}>
                  de {formatCurrency(budget)}
                </Text>
              </View>
            </Animated.View>
          )}
        </AnimatedCircularProgress>
      </View>

      {/* Bottom Info */}
      <View style={styles.bottomInfo}>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: colors.secondaryText }]}>
            Restante:
          </Text>
          <Text 
            style={[
              styles.infoValue, 
              { color: remaining >= 0 ? colors.success : colors.error }
            ]}
          >
            {formatCurrency(remaining)}
          </Text>
        </View>
        
        <Text style={[styles.statusMessage, { color: colors.mutedText }]}>
          {budgetStatus.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: screenWidth * 0.65,
    alignItems: "center",
    paddingVertical: 16,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    gap: 8,
  },
  statusIcon: {
    fontSize: 16,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  percentText: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 12,
  },
  additionalInfo: {
    alignItems: "center",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 2,
  },
  budgetText: {
    fontSize: 12,
    textAlign: "center",
  },
  bottomInfo: {
    alignItems: "center",
    width: "100%",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  statusMessage: {
    fontSize: 12,
    fontStyle: "italic",
    textAlign: "center",
  },
});