import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Keyboard,
} from "react-native";
import { useTheme } from "../../themes/ThemeContext";
import { SpendingModel } from "../models/SpendingModel";
import { updateSpending, deleteSpending } from "../services/SpendingService";
import { useAppStore } from "../../stores/AppStore";

interface Props {
  data: SpendingModel;
  reload: () => void;
}

export default function CategoryCard({ data, reload }: Props) {
  const colors = useTheme();
  const {setCardExpanded, fetchTotalSpendings}= useAppStore()

  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  // Animation for smooth expand/collapse
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  // Animate the expansion
  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();

    // Focus input when expanding
    if (expanded) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [expanded]);

  useEffect(() => {
    reload();
  }, []);

  const handleCardPress = () => {
    // Scale animation for feedback
    Animated.sequence([
      Animated.timing(scaleAnimation, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setExpanded(!expanded);
    setCardExpanded(!expanded)
  };

  const validateAmount = (input: string): number | null => {
    const value = parseFloat(input);
    if (isNaN(value) || value <= 0) {
      Alert.alert("Error", "Por favor ingresa un monto válido mayor a 0");
      return null;
    }
    if (value > 999999) {
      Alert.alert("Error", "El monto no puede ser mayor a $999,999");
      return null;
    }
    return value;
  };

  const handleAdd = async () => {
    const value = validateAmount(amount);
    if (!value) return;

    Alert.alert(
      "Confirmar Gasto",
      `¿Agregar $${value.toFixed(2)} a "${data.category}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Agregar",
          onPress: async () => {
            setLoading(true);
            try {
              await updateSpending({
                category: data.category,
                value: value,
                color: data.color,
              });
              await fetchTotalSpendings();
              setAmount("");
              reload();
              setExpanded(false)
              setCardExpanded(false)
              Keyboard.dismiss();

              Alert.alert(
                "✅ Gasto Agregado",
                `Se agregaron $${value.toFixed(2)} a ${data.category}`
              );
            } catch (error) {
              Alert.alert("Error", "No se pudo agregar el gasto");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      "⚠️ Eliminar Categoría",
      `¿Estás seguro de que quieres eliminar "${
        data.category
      }"?\n\nSe perderán todos los gastos asociados ($${data.value.toFixed(
        2
      )}).`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteSpending(data.category);
              await fetchTotalSpendings();
              reload();
              Alert.alert(
                "✅ Eliminado",
                `La categoría "${data.category}" ha sido eliminada`
              );
              setExpanded(false)
              setCardExpanded(false)
            } catch (error) {
              Alert.alert("Error", "No se pudo eliminar la categoría");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const expandedContentHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 175], // Adjust based on your content height
  });

  return (
    <Animated.View
      style={[styles.container, { transform: [{ scale: scaleAnimation }] }]}
    >
      <TouchableOpacity
        onPress={handleCardPress}
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
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View
              style={[
                styles.colorIndicator,
                {
                  backgroundColor: data.color,
                },
              ]}
            />
            <View style={styles.categoryInfo}>
              <Text style={[styles.title, { color: colors.primaryText }]}>
                {data.category}
              </Text>
            </View>
            <Text style={[styles.expandIcon, { color: colors.secondaryText }]}>
              {expanded ? "▼" : "▶"}
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={[styles.amountLabel, { color: colors.secondaryText }]}>
              Gastado:
            </Text>
            <Text style={[styles.amount, { color: colors.error }]}>
              ${data.value}
            </Text>
          </View>
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
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
              Agregar nuevo gasto:
            </Text>
            <TextInput
              ref={inputRef}
              keyboardType="numeric"
              value={amount}
              placeholder="0.00"
              onChangeText={setAmount}
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
              returnKeyType="done"
              onSubmitEditing={handleAdd}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={handleAdd}
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.success,
                  opacity: loading || !amount.trim() ? 0.6 : 1,
                },
              ]}
              disabled={loading || !amount.trim()}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                {loading ? "Agregando..." : "💰 Agregar"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDelete}
              style={[
                styles.deleteButton,
                {
                  backgroundColor: colors.error,
                  opacity: loading ? 0.6 : 1,
                },
              ]}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.buttonText, { color: colors.primaryText }]}>
                🗑️ Eliminar
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  header: {
    marginBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    fontWeight: "600",
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
  },
  expandedContent: {
    overflow: "hidden",
    marginTop: 8,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "column",
    gap: 8,
  },
  addButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
