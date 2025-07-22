import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Image
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../themes/ThemeContext";
import { addBudget, subtractBudget } from "../services/BudgetService";
import { useAppStore } from "../../stores/AppStore";

export default function BudgetForm() {
  const colors = useTheme();
  const { budget, fetchBudget } = useAppStore();

  const [budgetInput, setBudgetInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation for smooth expand/collapse
  const animatedHeight = useRef(new Animated.Value(0)).current;

  const loadBudget = async () => {
    try {
      await fetchBudget();
    } catch (error) {
      console.error("Error loading budget:", error);
    }
  };

  useEffect(() => {
    loadBudget();
  }, []);

  // Animate the expansion
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const validateInput = (input: string): number | null => {
    const amount = parseFloat(input);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido mayor a 0");
      return null;
    }
    return amount;
  };

  const handleAdd = async () => {
    const amount = validateInput(budgetInput);
    if (!amount) return;

    setLoading(true);
    try {
      await addBudget(amount);
      await loadBudget();
      setBudgetInput("");
      Alert.alert(
        "✅ Éxito",
        `Se agregaron $${amount.toFixed(2)} al presupuesto`
      );
      setExpanded(false)
    } catch (error) {
      Alert.alert("Error", "No se pudo agregar el monto");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtract = async () => {
    const amount = validateInput(budgetInput);
    if (!amount) return;

    // Warning if subtracting more than available
    if (amount > budget) {
      Alert.alert(
        "⚠️ Advertencia",
        `Vas a restar $${amount.toFixed(2)} pero solo tienes $${budget.toFixed(
          2
        )} disponible. ¿Continuar?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Continuar", onPress: () => executeSubtract(amount) },
        ]
      );
      return;
    }

    executeSubtract(amount);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const executeSubtract = async (amount: number) => {
    setLoading(true);
    try {
      await subtractBudget(amount);
      await loadBudget();
      setBudgetInput("");
      Alert.alert(
        "✅ Éxito",
        `Se restaron $${amount.toFixed(2)} del presupuesto`
      );
      setExpanded(false)
    } catch (error) {
      Alert.alert("Error", "No se pudo restar el monto");
    } finally {
      setLoading(false);
    }
  };

  const expandedContentHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 110], // Adjust based on your content height
  });

  return (
    <TouchableOpacity
      onPress={() => setExpanded(!expanded)}
      style={[
        styles.card,
        {
          backgroundColor: colors.bgCard,
          borderColor: colors.border,
          shadowColor: colors.primaryText,
        },
      ]}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.itemData,
          {
            backgroundColor: colors.bgCard,
            borderColor: colors.border,
            shadowColor: colors.primaryText,
          },
        ]}
      >
        <View style={styles.titleRow}>
          <View style={styles.contentRow}>
            <Image
              source={require("../../assets/BudgetIcon.png")}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: colors.yellow }]}>presupuesto</Text>
          </View>
          <Text style={[styles.expandIcon, { color: colors.secondaryText }]}>
            {expanded ? "  ▼" : "  ▶"}
          </Text>
        </View>
        <Text style={[styles.details, { color: colors.success }]}>
          {formatCurrency(budget)}
        </Text>
        <Text style={[styles.subDetails, { color: colors.mutedText }]}>
          Total disponible
        </Text>
      </View>

      <Animated.View
        style={[
          styles.expandedContent,
          {
            height: expandedContentHeight,
            opacity: animatedHeight,
          },
        ]}
      >
        <TextInput
          value={budgetInput}
          onChangeText={setBudgetInput}
          keyboardType="numeric"
          placeholder="Ingresa el monto"
          style={[
            styles.input,
            {
              borderColor: colors.borderLight,
              backgroundColor: colors.bgSecondary,
              color: colors.primaryText,
            },
          ]}
          placeholderTextColor={colors.mutedText}
          editable={!loading}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleSubtract}
            style={[
              styles.button,
              styles.subtractButton,
              { backgroundColor: colors.error },
            ]}
            disabled={loading || !budgetInput.trim()}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              −
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleAdd}
            style={[
              styles.button,
              styles.addButton,
              { backgroundColor: colors.success },
            ]}
            disabled={loading || !budgetInput.trim()}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              +
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginVertical: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemData: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  details: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subDetails: {
    fontSize: 12,
    textAlign: "center",
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontWeight: "bold",
    fontSize: 18,
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: "600",
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  budgetAmount: {
    fontSize: 20,
    fontWeight: "bold",
  },
  expandedContent: {
    overflow: "hidden",
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 8,
  },
  button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    marginHorizontal: 8,
  },
  addButton: {
    // Additional styles if needed
  },
  subtractButton: {
    // Additional styles if needed
  },
  buttonText: {
    fontSize: 24,
    fontWeight: "bold",
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
