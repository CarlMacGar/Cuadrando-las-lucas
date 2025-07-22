import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  Keyboard,
  Image,
} from "react-native";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../themes/ThemeContext";
import { SpendingModel } from "../models/SpendingModel";
import { saveSpending } from "../services/SpendingService";
import { getRandomColor } from "../../utils/randomColor";
import { useAppStore } from "../../stores/AppStore";

export default function CategoryForm() {
  const colors = useTheme();
  const { spendings, totalSpendings, fetchSpendings, fetchTotalSpendings } =
    useAppStore();

  const [spending, setSpending] = useState<SpendingModel>({
    category: "",
    value: 0,
    color: getRandomColor(),
  });
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation for smooth expand/collapse
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const inputRef = useRef<TextInput>(null);

  const loadSpendings = async () => {
    try {
      await fetchSpendings();
      await fetchTotalSpendings();
    } catch (error) {
      console.error("Error loading spendings:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías");
    }
  };

  useEffect(() => {
    loadSpendings();
  }, []);

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

  const validateCategory = (category: string): string | null => {
    const trimmedCategory = category.trim();

    if (!trimmedCategory) {
      Alert.alert("Error", "Por favor ingresa un nombre para la categoría");
      return null;
    }

    if (trimmedCategory.length < 2) {
      Alert.alert(
        "Error",
        "El nombre de la categoría debe tener al menos 2 caracteres"
      );
      return null;
    }

    if (trimmedCategory.length > 15) {
      Alert.alert(
        "Error",
        "El nombre de la categoría no puede tener más de 15 caracteres"
      );
      return null;
    }

    return trimmedCategory;
  };

  const checkCategoryExists = (category: string): boolean => {
    return spendings.some(
      (s) => s.category.trim().toLowerCase() === category.toLowerCase()
    );
  };

  const checkExistingColor = (color: string): boolean => {
    return spendings.some((s) => s.color === color)
  }

  const generateUniqueColor = (): string => {
    let newColor = getRandomColor();
    while(checkExistingColor(newColor)){
      newColor = getRandomColor();
    }
    return newColor;
  }

  const handleAdd = async () => {
    const validatedCategory = validateCategory(spending.category);
    let spdColor = spending.color;
    if (checkExistingColor(spdColor)) {
      spdColor = generateUniqueColor();
    };
    if (!validatedCategory) return;

    if (checkCategoryExists(validatedCategory)) {
      Alert.alert(
        "⚠️ Categoría Existente",
        `La categoría "${validatedCategory}" ya existe. Puedes agregarle gastos desde su tarjeta.`,
        [
          {
            text: "Entendido",
            onPress: () => {
              setSpending({ ...spending, category: "" });
              inputRef.current?.focus();
            },
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await saveSpending({ ...spending, category: validatedCategory, color: spdColor });
      await loadSpendings();

      Alert.alert(
        "✅ Éxito",
        `Categoría "${validatedCategory}" agregada correctamente`,
        [
          {
            text: "Continuar",
          },
        ]
      );
      setExpanded(false);
      setSpending({ ...spending, category: "" });
      Keyboard.dismiss();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Error al agregar la categoría"
      );
    } finally {
      setLoading(false);
    }
  };

  const expandedContentHeight = animatedHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120], // Adjust based on your content height
  });

  const handleCardPress = () => {
    setExpanded(!expanded);
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  return (
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
              source={require("../../assets/ExpensesIcon.png")}
              style={styles.icon}
            />
            <Text style={[styles.title, { color: colors.yellow }]}>
              Gastos
            </Text>
          </View>
          <Text style={[styles.expandIcon, { color: colors.secondaryText }]}>
            {expanded ? "  ▼" : "  ▶"}
          </Text>
        </View>
        <Text style={[styles.details, { color: colors.error }]}>
          {formatCurrency(totalSpendings)}
        </Text>
        <Text style={[styles.subDetails, { color: colors.mutedText }]}>
          Total gastado
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
        <View>
          <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
            Nombre de la categoría:
          </Text>
          <TextInput
            ref={inputRef}
            value={spending.category}
            onChangeText={(text) =>
              setSpending({ ...spending, category: text })
            }
            placeholder="Ej: Comida"
            style={[
              styles.input,
              {
                borderColor: colors.borderLight,
                backgroundColor: colors.bgSecondary,
                color: colors.primaryText,
              },
            ]}
            placeholderTextColor={colors.mutedText}
            maxLength={15}
            editable={!loading}
            autoCapitalize="words"
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />

          <Text style={[styles.characterCounter, { color: colors.mutedText }]}>
            {spending.category.length}/15
          </Text>
          <TouchableOpacity
            onPress={handleAdd}
            style={[
              styles.button,
              {
                backgroundColor: colors.success,
                opacity: loading || !spending.category.trim() ? 0.6 : 1,
              },
            ]}
            disabled={loading || !spending.category.trim()}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, { color: colors.primaryText }]}>
              {loading ? "Agregando..." : "✓ Agregar Categoría"}
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
    marginVertical: 4,
    fontSize: 16,
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 1,
  },
  characterCounter: {
    fontSize: 12,
    textAlign: "right",
    marginBottom: 3,
  },
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 35,
  },
  buttonText: {
    fontWeight: "bold",
    fontSize: 16,
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

/*
<TouchableOpacity
        style={styles.button}
        onPress={() =>
          generateMonthlyReport({
            month: "Julio",
            year: 2025,
            budget: 500000,
            expenses: currentSpendings,
          })
        }
      >
        <Text>Generar PDF</Text>
      </TouchableOpacity>
      <Text style={{ marginTop: 20, fontWeight: "bold" }}>Categorías:</Text>
      {currentSpendings.length === 0 ? (
        <Text>No hay categorías aún.</Text>
      ) : (
        <View
          style={{
            marginTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {currentSpendings.map((cat, idx) => (
            <CategoryCard key={idx} data={cat} reload={loadSpendings} />
          ))}
        </View>
      )}
        inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 1,
  },
 */
