import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView,
} from "react-native";
import PieChart from "react-native-pie-chart";
import { SpendingModel } from "../../expenses/models/SpendingModel";
import { useTheme } from "../../themes/ThemeContext";
import { useRef, useEffect } from "react";

type Props = {
  spendings: SpendingModel[];
  totalSpendings: number;
};

const { width: screenWidth } = Dimensions.get("window");

export default function PieChartView({ spendings, totalSpendings }: Props) {
  const colors = useTheme();

  const widthAndHeight = Math.min(screenWidth * 0.6, 220);

  const values = spendings.map((item) => item.value);
  const totalInPie = values.reduce((acc, val) => acc + val, 0);
  const sortedSpendings = [...spendings].sort((a, b) => b.value - a.value);
  const pieData = sortedSpendings.map((item) => ({
    value: item.value,
    color: item.color,
  }));

  const groupedSpendings = [];
  for (let i = 0; i < sortedSpendings.length; i += 3) {
    groupedSpendings.push(sortedSpendings.slice(i, i + 3));
  }

  const legendAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (totalInPie > 0) {
      Animated.sequence([
        Animated.timing(legendAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [totalInPie]);

  const formatCurrency = (amount: number) => {
    return `$${amount}`;
  };

  const getPercentage = (value: number) => {
    return ((value / totalSpendings) * 100).toFixed(2);
  };

  return (
    <View style={styles.container}>
      {totalInPie > 0 ? (
        <>
          <PieChart
            widthAndHeight={widthAndHeight}
            series={pieData}
            padAngle={0.005}
            cover={{ radius: 0.6, color: colors.bgAccent }}
          />
          <Animated.View
            style={[styles.legendContainer, { opacity: legendAnim }]}
          >
            <Text style={[styles.legendTitle, { color: colors.primaryText }]}>
              📋 Categorías ({sortedSpendings.length})
            </Text>
            {sortedSpendings.length > 3 && (
              <View style={styles.scrollIndicator}>
                <Text style={[styles.scrollHint, { color: colors.mutedText }]}>
                  ← Desliza para ver más categorías →
                </Text>
              </View>
            )}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={screenWidth * 0.6}
              decelerationRate="fast"
              pagingEnabled
              contentContainerStyle={{ maxHeight:150, alignItems:'center'}}
            >
              {groupedSpendings.map((group, pageIndex) => (
                <TouchableOpacity
                  key={pageIndex}
                  style={[
                    styles.categoryCard,
                    {
                      backgroundColor: colors.bgAccent,
                      shadowColor: colors.shadow,
                      height: group.length * 40 + 24,

                    },
                  ]}
                >
                  {group.map((item, index) => (
                    <View key={index} style={styles.categoryContent}>
                      <View
                        style={[
                          styles.colorIndicator,
                          {
                            backgroundColor: item.color,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.categoryName,
                          { color: colors.primaryText },
                        ]}
                        numberOfLines={1}
                      >
                        {item.category}:
                      </Text>

                      <Text
                        style={[styles.categoryAmount, { color: colors.error }]}
                      >
                        {formatCurrency(item.value)}
                      </Text>

                      <Text
                        style={[
                          styles.categoryPercentage,
                          { color: colors.secondaryText },
                        ]}
                      >
                        ({getPercentage(item.value)}%)
                      </Text>
                    </View>
                  ))}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Scroll indicator */}
          </Animated.View>
        </>
      ) : (
        <Text style={[styles.subText, { color: colors.secondaryText }]}>
          Aún no hay datos suficientes para mostrar la gráfica.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    maxWidth: screenWidth * 0.65,
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  scrollContainer:{
    justifyContent: 'center'
  },
  colorIndicator: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
    marginHorizontal: 2,
  },
  legendContainer: {
    marginVertical: 10,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  categoryCard: {
    width: screenWidth * 0.6, // Show ~1.3 cards at a time
    maxHeight: 120,
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 12,
    boxShadow: `0 4px 6px #94a3b8`,
    alignContent: "center",
    justifyContent: "center",
  },
  categoryContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    paddingVertical: 5,
  },
  categoryPercentage: {
    fontSize: 11,
    marginBottom: 4,
  },
  scrollIndicator: {
    alignItems: "center",
    marginTop: 12,
  },
  scrollHint: {
    fontSize: 12,
    fontStyle: "italic",
  },
});
